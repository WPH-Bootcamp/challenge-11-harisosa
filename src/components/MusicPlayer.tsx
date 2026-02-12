"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { containerVariants, PlayerState } from "@/components/music-player/motion/variants";
import { RepeatMode, usePlaylistControls } from "@/components/music-player/hook/usePlaylistControls";
import { Track } from "@/components/music-player/type";
import { AlbumArt, Equalizer, PlaybackProgress, MainButton, VolumeSlider } from "@/components/music-player/ui";
import { PLAYLIST } from "@/components/music-player/constant";

const SWITCH_LOADING_MS = 1000;
const PLAY_TOGGLE_LOADING_MS = 500;

const FALLBACK_TOTAL_MS = 180_000;

const MusicPlayer: React.FC = () => {
  const [state, setState] = useState<PlayerState>("paused");
  const isLoading = state === "loading";

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks] = useState<Track[]>(PLAYLIST);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackKey, setTrackKey] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const [volume, setVolume] = useState(0.6);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(PLAYLIST[0]?.durationMs ?? FALLBACK_TOTAL_MS);

  const switchTimerRef = useRef<number | null>(null);
  const playToggleTimerRef = useRef<number | null>(null);

  const controls = usePlaylistControls({
    tracks,
    index: trackIndex,
    isShuffle,
    repeatMode,
    setIndex: setTrackIndex,
    setTrackKey,
    setIsShuffle,
    setRepeatMode,
  });

  const currentTrack = controls.currentTrack;

  const clearSwitchTimer = () => {
    if (switchTimerRef.current !== null) {
      window.clearTimeout(switchTimerRef.current);
      switchTimerRef.current = null;
    }
  };

  const clearPlayToggleTimer = () => {
    if (playToggleTimerRef.current !== null) {
      window.clearTimeout(playToggleTimerRef.current);
      playToggleTimerRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup timers on unmount to avoid state updates after component is gone.
    return () => {
      clearSwitchTimer();
      clearPlayToggleTimer();
    };
  }, []);

  const handleVolumeChange = (v: number) => {
    // Single source of truth: set element volume + state together.
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolume(v);
  };

  useEffect(() => {
    // Keep the audio element in sync when volume changes externally.
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset progress whenever the track source changes.
    setElapsedMs(0);

    // If there is no src, fully clear the element.
    if (!currentTrack?.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setTotalMs(currentTrack?.durationMs ?? FALLBACK_TOTAL_MS);
      return;
    }

    // Load the new source deterministically.
    audio.pause();
    audio.currentTime = 0;
    audio.src = currentTrack.src;
    audio.load();
  }, [currentTrack?.src]);

  useEffect(() => {
    // Centralized playback control:
    // - "loading": we intentionally keep audio paused (UX consistency)
    // - "playing": start playback
    // - "paused": stop playback
    const audio = audioRef.current;
    if (!audio) return;

    if (state === "playing") {
      audio.play().catch(() => {});
      return;
    }

    audio.pause();
  }, [state]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let raf = 0;

    const tick = () => {
      // Use RAF for smooth progress updates.
      setElapsedMs(Math.floor(audio.currentTime * 1000));
      raf = requestAnimationFrame(tick);
    };

    const handleLoadedMeta = () => {
      // Prefer real duration from metadata; fallback to playlist duration.
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setTotalMs(d > 0 ? Math.floor(d * 1000) : currentTrack?.durationMs ?? FALLBACK_TOTAL_MS);
    };

    const handleEnded = () => {
      // Ended comes from the audio element; we treat it as source of truth.
      setElapsedMs(0);
      handleProgressComplete();
    };

    audio.addEventListener("loadedmetadata", handleLoadedMeta);
    audio.addEventListener("ended", handleEnded);

    if (state === "playing") {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMeta);
      audio.removeEventListener("ended", handleEnded);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [state, currentTrack?.src]); // re-bind events when track changes

  const togglePlay = () => {
    // UX rule: always show loading for PLAY_TOGGLE_LOADING_MS before state flips.
    if (isLoading) return;

    clearPlayToggleTimer();

    const next: PlayerState = state === "playing" ? "paused" : "playing";
    setState("loading");

    playToggleTimerRef.current = window.setTimeout(() => {
      setState(next); // audio play/pause happens in the [state] effect (single control point)
      playToggleTimerRef.current = null;
    }, PLAY_TOGGLE_LOADING_MS);
  };

  const runTrackSwitch = (action: () => { atEnd?: boolean } | void) => {
    // UX rule: track switches always show loading for SWITCH_LOADING_MS.
    if (isLoading) return;

    clearSwitchTimer();

    const wasPlaying = state === "playing";
    setState("loading");

    // Keep audio paused during the loading phase for consistent visuals.
    audioRef.current?.pause();

    switchTimerRef.current = window.setTimeout(() => {
      const res = action();

      // If we reached the end and repeat is off, force paused.
      // Otherwise, restore the previous play/paused state.
      const shouldPause = Boolean(res && (res as { atEnd?: boolean }).atEnd) && repeatMode === "off";
      setState(shouldPause ? "paused" : wasPlaying ? "playing" : "paused");

      switchTimerRef.current = null;
    }, SWITCH_LOADING_MS);
  };

  const onNext = () =>
    runTrackSwitch(() => {
      // Return the result so runTrackSwitch can decide final state.
      return controls.goNext();
    });

  const onPrev = () =>
    runTrackSwitch(() => {
      controls.goPrev();
    });

  const onRestart = () =>
    runTrackSwitch(() => {
      controls.restartTrack();
    });

  const handleProgressComplete = () => {
    // Called when progress finishes (either from PlaybackProgress or audio "ended").
    if (repeatMode === "one") {
      onRestart();
      return;
    }

    onNext();
  };

  return (
    <>
      <div className="grid place-items-center bg-[#0a0a0a]">
        <motion.div
          className="w-125 h-89.5 rounded-3xl p-4"
          variants={containerVariants}
          animate={state}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-6">
            <AlbumArt state={state} />

            <div className="flex-1 mt-6.5">
              <div className="flex items-center gap-6">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white truncate">{currentTrack?.title ?? "—"}</div>
                  <div className="mt-2 text-sm text-white/60 truncate">{currentTrack?.artist ?? "—"}</div>
                </div>
              </div>

              <div className="shrink-0 mt-4">
                <Equalizer state={state} bars={5} />
              </div>
            </div>
          </div>

          <PlaybackProgress
            key={trackKey}
            state={state}
            totalMs={totalMs}
            elapsedMs={elapsedMs}
            onComplete={handleProgressComplete}
          />

          <div className="mt-5 flex items-center justify-center gap-4.5">
            <MainButton
              isLoading={isLoading}
              state={state}
              isShuffle={isShuffle}
              repeatMode={repeatMode}
              onTogglePlay={togglePlay}
              onNext={onNext}
              onPrev={onPrev}
              onToggleShuffle={controls.toggleShuffle}
              onCycleRepeat={controls.cycleRepeat}
            />
          </div>

          <VolumeSlider value={volume} onChange={handleVolumeChange} disabled={isLoading} />
        </motion.div>
      </div>

      <audio ref={audioRef} preload="auto" />
    </>
  );
};

export default MusicPlayer;

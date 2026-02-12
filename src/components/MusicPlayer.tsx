"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  containerVariants,
  PlayerState,
} from "@/components/music-player/motion/variants";
import {
  RepeatMode,
  usePlaylistControls,
} from "@/components/music-player/hook/usePlaylistControls";
import { Track } from "@/components/music-player/type";
import { AlbumArt, Equalizer, PlaybackProgress, MainButton, VolumeSlider } from "@/components/music-player/ui";

const SWITCH_LOADING_MS = 1000;
const PLAY_TOGGLE_LOADING_MS = 500;

// Audio is for demo purpose only
const PLAYLIST: Track[] = [
  { id: "t1", title: "Your Man", artist: "Josh Turner", src: "/audio/Yourman.mp3" },
  { id: "t2", title: "I Started a Joke", artist: "Bee Gees", src: "/audio/i-started-a-joke.mp3" },
  { id: "t3", title: "Love of My Life", artist: "Queen", src: "/audio/love-of-my-life.mp3" },
  { id: "t4", title: "Overjoyed", artist: "Stevie Wonder", src: "/audio/overjoyed.mp3"  },
  { id: "t5", title: "Africa", artist: "Toto", src: "/audio/africa.mp3"},
  { id: "t6", title: "Heaven Knows", artist: "Rick Price", src: '/audio/heaven-knows.mp3' },
  { id: "t7", title: "Just the Way You Are", artist: "Billy Joel", src: '/audio/just-the-way-you-are.mp3' },
  { id: "t8", title: "Glory of Love", artist: "Peter Cetera", src: '/audio/glory-of-love.mp3' },
  { id: "t9", title: "You're The Inspiration", artist: "Chicago", src:'/audio/youre-the-inspiration.mp3' },
  { id: "t10", title: "Against All Odds (Take a Look at Me Now)", artist: "Phil Collins", src: '/audio/against-all-odds.mp3' },
];

const MusicPlayer: React.FC = () => {
  const [state, setState] = useState<PlayerState>("paused");

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [tracks] = useState<Track[]>(PLAYLIST);
  const [trackIndex, setTrackIndex] = useState(0);
  const [trackKey, setTrackKey] = useState(0);

  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");

  const [volume, setVolume] = useState(0.6);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(PLAYLIST[0]?.durationMs ?? 180000);

  const switchTimerRef = useRef<number | null>(null);

  const playToggleTimerRef = useRef<number | null>(null);

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
    return () => {
      clearSwitchTimer();
      clearPlayToggleTimer();
    };
  }, []);

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

  const currentTrack = useMemo(() => controls.currentTrack, [controls.currentTrack]);
  const isLoading = state === "loading";

  const handleVolumeChange = (v: number) => {
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolume(v);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setElapsedMs(0);

    if (!currentTrack?.src) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setTotalMs(currentTrack?.durationMs ?? 180000);
      return;
    }

    audio.src = currentTrack.src;
    audio.load();
    audio.currentTime = 0;

    audio.volume = volume;

    if (state === "playing") {
      audio.play().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.src]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state === "playing") {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [state]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    let raf = 0;

    const tick = () => {
      setElapsedMs(Math.floor(audio.currentTime * 1000));
      raf = requestAnimationFrame(tick);
    };

    const handleLoadedMeta = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      if (d > 0) setTotalMs(Math.floor(d * 1000));
      else setTotalMs(currentTrack?.durationMs ?? 180000);
    };

    const handleEnded = () => {
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
  }, [state, currentTrack?.src]);

  const togglePlay = () => {
    if (state === "loading") return;

    clearPlayToggleTimer();
    const next: PlayerState = state === "playing" ? "paused" : "playing";
    setState("loading");
    audioRef.current?.pause();

    playToggleTimerRef.current = window.setTimeout(() => {
      setState(next);
      playToggleTimerRef.current = null;
    }, PLAY_TOGGLE_LOADING_MS);
  };

  const runTrackSwitch = (action: () => void) => {
    if (state === "loading") return;

    const wasPlaying = state === "playing";

    clearSwitchTimer();
    setState("loading");

    audioRef.current?.pause();

    switchTimerRef.current = window.setTimeout(() => {
      action();
      setState(wasPlaying ? "playing" : "paused");
      switchTimerRef.current = null;
    }, SWITCH_LOADING_MS);
  };

  const onNext = () =>
    runTrackSwitch(() => {
      const res = controls.goNext();
      if (res.atEnd && repeatMode === "off") {
        setState("paused");
      }
    });

  const onPrev = () => runTrackSwitch(() => controls.goPrev());

  const onRestart = () => runTrackSwitch(() => controls.restartTrack());

  const handleProgressComplete = () => {
    if (state !== "playing") return;

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
          className="w-125 h-89.5  rounded-3xl p-4"
          variants={containerVariants}
          animate={state}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-6">
            <AlbumArt state={state} />

            <div className="flex-1 mt-6.5">
              <div className="flex items-center gap-6">
                <div className="min-w-0">
                  <div className="text-lg font-semibold text-white truncate">
                    {currentTrack?.title ?? "—"}
                  </div>
                  <div className="mt-2 text-sm text-white/60 truncate">
                    {currentTrack?.artist ?? "—"}
                  </div>
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

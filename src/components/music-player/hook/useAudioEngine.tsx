"use client";

import { useEffect, useRef, useState } from "react";
import type { PlayerState } from "@/components/music-player/motion/variants";

/**
 * useAudioEngine
 *
 * Encapsulates all audio element behavior:
 * - Syncing audio source
 * - Handling play / pause based on player state
 * - Tracking elapsed time via requestAnimationFrame
 * - Reading duration from metadata
 * - Handling track end events
 *
 * Keeps MusicPlayer component clean by isolating audio side-effects.
 */

type Params = {
  src?: string | null;
  state: PlayerState;
  volume: number;
  fallbackDurationMs: number;
  onEnded?: () => void;
};

type Result = {
  audioRef: React.MutableRefObject<HTMLAudioElement | null>;
  elapsedMs: number;
  totalMs: number;
  pause: () => void;
  setAudioVolume: (v: number) => void;
  resetToStart: () => void;
};

export const useAudioEngine = ({
  src,
  state,
  volume,
  fallbackDurationMs,
  onEnded,
}: Params): Result => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [totalMs, setTotalMs] = useState(fallbackDurationMs);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // When metadata loads, compute duration in ms.
    const onLoaded = () => {
      const d = Number.isFinite(audio.duration) ? audio.duration : 0;
      setTotalMs(d > 0 ? Math.floor(d * 1000) : fallbackDurationMs);
    };

    // When track finishes, reset progress and notify parent.
    const onEndedInternal = () => {
      setElapsedMs(0);
      onEnded?.();
    };

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEndedInternal);

    // Reset progress whenever src/state changes.
    setElapsedMs(0);

    if (!src) {
      // No source → fully reset audio element.
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      setTotalMs(fallbackDurationMs);
    } else {
      // Update source only if different.
      if (audio.src !== src) {
        audio.src = src;
        audio.load();
        audio.currentTime = 0;
      }

      // Keep volume in sync.
      audio.volume = volume;

      // Control playback based on state.
      if (state === "playing") {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }

    // RAF (requestAnimationFrame) loop.
    // We use RAF instead of setInterval to keep elapsed time updates
    // in sync with the browser’s render cycle (~60fps).
    // This ensures smooth progress bar animation and avoids timing drift.
    // RAF also pauses automatically when the tab is inactive.


    // RAF loop for smooth elapsed time updates.
    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      setElapsedMs(Math.floor((audio.currentTime || 0) * 1000));
    };

    if (state === "playing") {
      // Start RAF only if not already running.
      if (rafRef.current == null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    } else {
      // Stop RAF when not playing.
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }

    // Cleanup listeners and RAF on dependency change/unmount.
    return () => {
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEndedInternal);

      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

  }, [src, state, volume, fallbackDurationMs, onEnded]);

  const pause = () => audioRef.current?.pause();

  const setAudioVolume = (v: number) => {
    if (!audioRef.current) return;
    audioRef.current.volume = v;
  };

  const resetToStart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setElapsedMs(0);
  };

  return {
    audioRef,
    elapsedMs,
    totalMs,
    pause,
    setAudioVolume,
    resetToStart,
  };
};

export default useAudioEngine;

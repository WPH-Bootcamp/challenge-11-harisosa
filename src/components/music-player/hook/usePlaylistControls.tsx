"use client";

import { Track } from "@/components/music-player/type";
import { useCallback, useMemo } from "react";

export type RepeatMode = "off" | "one" | "all";

type ControlsArgs = {
  tracks: Track[];
  index: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;

  setIndex: React.Dispatch<React.SetStateAction<number>>;
  setTrackKey: React.Dispatch<React.SetStateAction<number>>;
  setIsShuffle: React.Dispatch<React.SetStateAction<boolean>>;
  setRepeatMode: React.Dispatch<React.SetStateAction<RepeatMode>>;
};

/**
 * usePlaylistControls
 *
 * A small helper hook to manage playlist navigation rules:
 * - next / prev behavior with shuffle & repeat modes
 * - "restart" by bumping trackKey (forces progress reset / remount)
 * - keeps the currentTrack derived from tracks + index
 */
export const usePlaylistControls = ({
  tracks,
  index,
  isShuffle,
  repeatMode,
  setIndex,
  setTrackKey,
  setIsShuffle,
  setRepeatMode,
}: ControlsArgs) => {
  // Derive the currently selected track from index.
  const currentTrack = useMemo(() => tracks[index], [tracks, index]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (!tracks.length) return;

      /**
       * Clamp nextIndex into the valid range [0, tracks.length - 1]
       * so we never end up with an out-of-bounds index.
       */
      const bounded = Math.min(Math.max(nextIndex, 0), tracks.length - 1);

      setIndex(bounded);

      // Bump key to force dependent UI (e.g., progress) to reset/remount.
      setTrackKey((k) => k + 1);
    },
    [tracks.length, setIndex, setTrackKey]
  );

  const goNext = useCallback(() => {
    // No tracks means we're effectively at the end.
    if (!tracks.length) return { atEnd: true };

    // Shuffle mode: jump to a random index (excluding current).
    if (isShuffle) {
      goToIndex(pickRandomIndex(tracks.length, index));
      return { atEnd: false };
    }

    // Normal mode: move forward if possible.
    const next = index + 1;

    if (next < tracks.length) {
      goToIndex(next);
      return { atEnd: false };
    }

    // Repeat-all mode: wrap around to the first track.
    if (repeatMode === "all") {
      goToIndex(0);
      return { atEnd: false };
    }

    // Otherwise, we're at the end.
    return { atEnd: true };
  }, [tracks.length, isShuffle, repeatMode, index, goToIndex]);

  const goPrev = useCallback(() => {
    if (!tracks.length) return;

    // Shuffle mode: jump to a random index (excluding current).
    if (isShuffle) {
      goToIndex(pickRandomIndex(tracks.length, index));
      return;
    }

    // Normal mode: move backward if possible.
    const prev = index - 1;

    if (prev >= 0) {
      goToIndex(prev);
      return;
    }

    // Repeat-all mode: wrap to the last track when going prev from start.
    if (repeatMode === "all") {
      goToIndex(tracks.length - 1);
      return;
    }

    // Clamp at start if repeat is off.
    goToIndex(0);
  }, [tracks.length, isShuffle, repeatMode, index, goToIndex]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((v) => !v);
  }, [setIsShuffle]);

  const cycleRepeat = useCallback(() => {
    // Cycle: off -> all -> one -> off
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, [setRepeatMode]);

  const restartTrack = useCallback(() => {
    // Force progress reset without changing index.
    setTrackKey((k) => k + 1);
  }, [setTrackKey]);

  return {
    currentTrack,
    goToIndex,
    goNext,
    goPrev,
    toggleShuffle,
    cycleRepeat,
    restartTrack,
  };
};

/**
 * Returns a random index in [0..len-1], avoiding `exclude` if possible.
 * Used to prevent "shuffle" from picking the same track repeatedly.
 */
const pickRandomIndex = (len: number, exclude: number) => {
  if (len <= 1) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * len);
  return i;
};

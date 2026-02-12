"use client";

import { Track } from "@/components/music-player/type";
import { useCallback, useMemo } from "react";


export type RepeatMode = "off" | "one" | "all";

const pickRandomIndex = (len: number, exclude: number) => {
  if (len <= 1) return 0;
  let i = exclude;
  while (i === exclude) i = Math.floor(Math.random() * len);
  return i;
};

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

  const currentTrack = useMemo(() => tracks[index], [tracks, index]);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      if (!tracks.length) return;
      const bounded = Math.min(Math.max(nextIndex, 0), tracks.length - 1);
      setIndex(bounded);
      setTrackKey((k) => k + 1);
    },
    [tracks.length, setIndex, setTrackKey]
  );

  const goNext = useCallback(() => {
    if (!tracks.length) return { didChange: false, atEnd: true };

    if (isShuffle) {
      goToIndex(pickRandomIndex(tracks.length, index));
      return { didChange: true, atEnd: false };
    }

    const next = index + 1;
    if (next < tracks.length) {
      goToIndex(next);
      return { didChange: true, atEnd: false };
    }

    if (repeatMode === "all") {
      goToIndex(0);
      return { didChange: true, atEnd: false };
    }

    return { didChange: false, atEnd: true };
  }, [tracks.length, isShuffle, repeatMode, index, goToIndex]);

  const goPrev = useCallback(() => {
    if (!tracks.length) return;

    if (isShuffle) {
      goToIndex(pickRandomIndex(tracks.length, index));
      return;
    }

    const prev = index - 1;
    if (prev >= 0) {
      goToIndex(prev);
      return;
    }

    if (repeatMode === "all") {
      goToIndex(tracks.length - 1);
      return;
    }

    goToIndex(0);
  }, [tracks.length, isShuffle, repeatMode, index, goToIndex]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle((v) => !v);
  }, [setIsShuffle]);

  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, [setRepeatMode]);

  const restartTrack = useCallback(() => {
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

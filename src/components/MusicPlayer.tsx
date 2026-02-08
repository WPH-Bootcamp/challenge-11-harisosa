"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Volume2 } from "lucide-react";

import {
  containerVariants,
  PlayerState
} from "@/components/music-player/motion/variants";
import { AlbumArt } from "@/components/music-player/ui/AlbumArt";
import { Equalizer } from "@/components/music-player/ui/Equalizer";
import { MainButton } from "@/components/music-player/ui/MainButton";
import { PlaybackProgress } from "@/components/music-player/ui/PlaybackProgress";
import { VolumeSlider } from "@/components/music-player/ui/VolumeSlider";

const LOADING_MS = 1_000;;
const MIN_PLAY_MS = 15_000;

const MusicPlayer: React.FC = () => {
  const [state, setState] = useState<PlayerState>("paused");
  const loadingTimerRef = useRef<number | null>(null);
  const playLockTimerRef = useRef<number | null>(null);
  const [isPlayLocked, setIsPlayLocked] = useState(false);
  const [trackKey, setTrackKey] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggle = () => {
    if (state === "loading") return;

    if (state === "playing") {
      // clear semua timer
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
      if (playLockTimerRef.current) window.clearTimeout(playLockTimerRef.current);

      setIsPlayLocked(false);
      setState("paused");
      return;
    }

    if (state === "paused") {
      setState("loading");

      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
      if (playLockTimerRef.current) window.clearTimeout(playLockTimerRef.current);

      loadingTimerRef.current = window.setTimeout(() => {
        setState("playing");

        setIsPlayLocked(true);
        playLockTimerRef.current = window.setTimeout(() => {
          setIsPlayLocked(false);
        }, MIN_PLAY_MS);
      }, LOADING_MS);
    }
  };

  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
      if (playLockTimerRef.current) window.clearTimeout(playLockTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const isLoading = state === "loading";

  const handleProgressComplete = () => {
    if (state !== "playing") return;

    setState("loading");

    if (loadingTimerRef.current) window.clearTimeout(loadingTimerRef.current);
    if (playLockTimerRef.current) window.clearTimeout(playLockTimerRef.current);

    loadingTimerRef.current = window.setTimeout(() => {

      setTrackKey((k) => k + 1);

      setState("playing");

      setIsPlayLocked(true);
      playLockTimerRef.current = window.setTimeout(() => {
        setIsPlayLocked(false);
      }, MIN_PLAY_MS);
    }, LOADING_MS);
  };


  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0a0a]">
      <motion.div
        className="min-w-125 rounded-3xl px-8 py-7"
        variants={containerVariants}
        animate={state}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-start gap-6">
          <AlbumArt state={state} />

          <div className="flex-1">
            <div className="flex items-center gap-6">
              <div className="min-w-0">
                <div className="text-[20px] font-semibold text-white truncate">
                  Awesome Song Title
                </div>
                <div className="mt-2 text-[14px] text-white/60 truncate">
                  Amazing Artist
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
          state={state} totalMs={MIN_PLAY_MS} onComplete={handleProgressComplete} />
        <div className="mt-7 flex items-center justify-center gap-4.5">
          <MainButton state={state} isLoading={isLoading} toggle={toggle} />
        </div>

        <VolumeSlider
          value={volume}
          onChange={setVolume}
          disabled={isLoading}
        />
      </motion.div>
    </div>
  );
};

export default MusicPlayer;

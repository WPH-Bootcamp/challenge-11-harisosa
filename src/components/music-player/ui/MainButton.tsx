import { PlayerState } from "@/components/music-player/motion/variants";
import { IconButton } from "@/components/music-player/ui/IconButton";
import { PlayButton } from "@/components/music-player/ui/PlayButton";
import { Repeat1, Repeat2, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import React from "react";

type RepeatMode = "off" | "one" | "all";

type MainButtonProps = {
  isLoading: boolean;
  state: PlayerState;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onToggleShuffle: () => void;
  onCycleRepeat: () => void;
};

export const MainButton: React.FC<MainButtonProps> = ({
  isLoading,
  state,
  isShuffle,
  repeatMode,
  onTogglePlay,
  onNext,
  onPrev,
  onToggleShuffle,
  onCycleRepeat,
}) => {
  const disabled = isLoading;

  return (
    <motion.div className="flex gap-4 items-center">
      <IconButton disabled={disabled} onClick={onToggleShuffle} active={isShuffle}>
        <Image src='/images/shuffle.svg' alt="repeat" width={18} height={18} />
      </IconButton>

      <IconButton disabled={disabled} onClick={onPrev}>
        <Image src='/images/back.svg' alt="repeat" width={18} height={18} />
      </IconButton>

      <PlayButton
        state={state}
        onToggle={() => {
          console.log('main button state : ', state)
          if (state === "loading") return;
          onTogglePlay();
        }}
      />

      <IconButton disabled={disabled} onClick={onNext}>
        <Image src='/images/forward.svg' alt="repeat" width={18} height={18} />
      </IconButton>

      <IconButton
        disabled={disabled}
        onClick={onCycleRepeat}
        active={repeatMode !== "off"}
      >
        <Image src='/images/repeat.svg' alt="repeat" width={18} height={18} />
      </IconButton>
    </motion.div>
  );
};

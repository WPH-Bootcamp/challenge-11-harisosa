import { PlayerState } from "@/components/music-player/motion/variants";
import { IconButton } from "@/components/music-player/ui/IconButton";
import { PlayButton } from "@/components/music-player/ui/PlayButton";
import { Repeat2, Shuffle, SkipBack, SkipForward } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

type MainButtonProps ={
    isLoading: boolean;
    state: PlayerState;
    toggle: () => void;
}


export const MainButton: React.FC<MainButtonProps> = ({ isLoading, state, toggle}) => {
    return (
        <motion.div
        className="flex gap-3 items-center"
        >
                  <IconButton disabled={isLoading}>
            <Shuffle size={18} />
          </IconButton>

          <IconButton disabled={isLoading}>
            <SkipBack size={18} />
          </IconButton>

          <PlayButton
           state={state} onToggle={toggle} />

          <IconButton disabled={isLoading}>
            <SkipForward size={18} />
          </IconButton>

          <IconButton disabled={isLoading}>
            <Repeat2 size={18} />
          </IconButton>
          </motion.div>
    )
}
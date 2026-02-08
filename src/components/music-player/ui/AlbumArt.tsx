"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { albumVariants, type PlayerState } from "../motion/variants";
import { Music } from "lucide-react";

type Props = {
  state: PlayerState;
};

export const AlbumArt: React.FC<Props> = ({ state }) => {
  const isPlaying = state === "playing";

  const dimStyle = useMemo(() => {
    if (state === "loading") {
      return { filter: "brightness(0.8) saturate(0.9)" };
    }

    if (state === "paused") {
      return { filter: "brightness(0.95) saturate(0.95)" };
    }

    return { filter: "brightness(1) saturate(1)" };
  }, [state]);

  return (
    <motion.div
      className="w-24 aspect-square rounded-2xl overflow-hidden grid place-items-center
                 bg-gradient-to-br from-fuchsia-600 to-pink-500"
      variants={albumVariants}
      animate={state}
      transition={{ type: "spring", duration: 0.3 }}
      style={{
        willChange: "transform, filter",
        ...dimStyle,
      }}
    >
      <motion.div
        className="h-full w-full grid place-items-center"
        animate={isPlaying ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPlaying
            ? { repeat: Infinity, duration: 20, ease: "linear" }
            : { duration: 0.3 }
        }
        style={{ willChange: "transform" }}
      >
        <Music className="w-12 h-15  text-black" />
      </motion.div>
    </motion.div>
  );
};

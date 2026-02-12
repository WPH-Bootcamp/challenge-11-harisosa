"use client";

import React from "react";
import { motion } from "motion/react";
import {
  equalizerContainerVariants,
  resolveEqualizerAnimate,
  type PlayerState,
} from "../motion/variants";

type Props = {
  state: PlayerState;
  bars?: number;
};

export const Equalizer: React.FC<Props> = ({ state, bars = 5 }) => {
  const isPlaying = state === "playing";

  return (
    <motion.div
      className="flex items-end gap-1 h-8"
      variants={equalizerContainerVariants}
      animate={state}
      transition={{ duration: 0.3 }}
      style={{ willChange: "opacity" }}
    >
      {Array.from({ length: bars }).map((_, i) => (
        <motion.div
          key={i}
          className="w-2 bg-(--equalizer-active)"
          animate={resolveEqualizerAnimate(state)}
          transition={{
            duration: isPlaying ? 0.5 : 0.3,
            ease: "easeInOut",
            repeat: isPlaying ? Infinity : 0,
            repeatType: "reverse",
            delay: isPlaying ? i * 0.1 : 0,
          }}
          style={{ willChange: "height" }}
        />
      ))}
    </motion.div>
  );
};

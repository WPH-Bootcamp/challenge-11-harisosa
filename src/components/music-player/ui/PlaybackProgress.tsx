"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { progressFillVariants, type PlayerState } from "../motion/variants";

type Props = {
  state: PlayerState;
  totalMs: number;
  elapsedMs: number;
  onComplete?: () => void;
};

const formatTimeFromMs = (ms: number) => {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const PlaybackProgress: React.FC<Props> = ({
  state,
  totalMs,
  elapsedMs,
  onComplete,
}) => {
  const resolvedTotalMs = useMemo(
    () => Math.max(0, Math.floor(totalMs)),
    [totalMs]
  );

  const progress =
    resolvedTotalMs === 0 ? 0 : Math.min(1, elapsedMs / resolvedTotalMs);

  const [didComplete, setDidComplete] = useState(false);

  useEffect(() => {
    if (state !== "playing") {
      setDidComplete(false);
      return;
    }

    if (progress >= 1 && !didComplete) {
      setDidComplete(true);
      onComplete?.();
    }
  }, [progress, state, didComplete, onComplete]);

  return (
    <div>
      <div className="mt-5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full origin-left"
          variants={progressFillVariants}
          animate={{
            ...progressFillVariants[state],
            scaleX: progress,
          }}
          transition={{
            scaleX: { duration: 0.1, ease: "linear" },
            backgroundColor: { duration: 0.3 },
            opacity: { duration: 0.3 },
          }}
        />
      </div>

      <div className="mt-5 flex justify-between text-xs text-white/40">
        <span>{formatTimeFromMs(elapsedMs)}</span>
        <span>{formatTimeFromMs(resolvedTotalMs)}</span>
      </div>
    </div>
  );
};

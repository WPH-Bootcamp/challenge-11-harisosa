"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { progressFillVariants, type PlayerState } from "../motion/variants";

type Props = {
  state: PlayerState;
  totalMs: number;
  onComplete?: () => void;
  tickMs?: number;
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
  onComplete,
  tickMs = 100,
}) => {
  const resolvedTotalMs = useMemo(() => Math.max(0, Math.floor(totalMs)), [totalMs]);

  const [elapsedMs, setElapsedMs] = useState(0);
  const [didComplete, setDidComplete] = useState(false);

  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (state !== "playing") setDidComplete(false);
  }, [state]);

  useEffect(() => {
    setElapsedMs((prev) => Math.min(prev, resolvedTotalMs));
  }, [resolvedTotalMs]);

  useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (state === "playing" && resolvedTotalMs > 0) {
      intervalRef.current = window.setInterval(() => {
        setElapsedMs((prev) => {
          const next = prev + tickMs;
          if (next >= resolvedTotalMs) {
            return resolvedTotalMs;
          }
          return next;
        });
      }, tickMs);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [state, resolvedTotalMs, tickMs]);

  useEffect(() => {
    if (state !== "playing") return;
    if (resolvedTotalMs === 0) return;

    if (elapsedMs >= resolvedTotalMs && !didComplete) {
      setDidComplete(true);
    }
  }, [elapsedMs, resolvedTotalMs, state, didComplete]);


  useEffect(() => {
    if (!didComplete) return;
    onComplete?.();
  }, [didComplete, onComplete]);

  const progress = resolvedTotalMs === 0 ? 0 : elapsedMs / resolvedTotalMs;
  const width = useMemo(() => `${Math.round(progress * 100)}%`, [progress]);

  return (
    <div>
      <div className="mt-5 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full"
          animate={state}
          variants={progressFillVariants}
          transition={{ duration: 0.3 }}
          style={{ width }}
        />
      </div>

      <div className="mt-3 flex justify-between text-[12px] text-white/40">
        <span>{formatTimeFromMs(elapsedMs)}</span>
        <span>{formatTimeFromMs(resolvedTotalMs)}</span>
      </div>
    </div>
  );
};

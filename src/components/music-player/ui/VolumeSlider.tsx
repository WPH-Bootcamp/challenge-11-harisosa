"use client";

import React, { useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";

type VolumeSliderProps = {
  value: number; // 0..1
  onChange: (next: number) => void;
  disabled?: boolean;
  className?: string;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onChange,
  disabled = false,
  className,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const percent = useMemo(() => clamp01(value) * 100, [value]);

  const getValueFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    return clamp01((clientX - rect.left) / rect.width);
  };

  return (
    <div
      className={[
        "mt-5.5 flex items-center gap-3",
        disabled && "opacity-50 pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >

      <Volume2 size={16} className="text-white/40 shrink-0" />


      <div
        ref={trackRef}
        role="slider"
        tabIndex={disabled ? -1 : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(percent)}
        onClick={(e) => {
          if (disabled) return;
          const next = getValueFromClientX(e.clientX);
          if (next !== null) onChange(next);
        }}
        className="relative h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden cursor-pointer"
      >

        <motion.div
          className="h-full bg-white/35"
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.2 }}
        />

      </div>
    </div>
  );
};

import type { Variants } from "motion/react";

export type PlayerState = "playing" | "paused" | "loading";

const NO_SHADOW = "0 0 0 rgba(0,0,0,0)";

/* =========================
   CONTAINER (background + glow)
========================= */
export const containerVariants: Variants = {
  paused: {
    backgroundColor: "var(--player-bg-paused)",
    boxShadow: NO_SHADOW,
  },
  loading: {
    backgroundColor: "var(--player-bg-loading)",
    boxShadow: NO_SHADOW,
  },
  playing: {
    backgroundColor: "var(--player-bg-playing)",
    boxShadow: "var(--player-glow)",
  },
};

/* =========================
   ALBUM ART SCALE
========================= */
export const albumVariants: Variants = {
  paused: { scale: 0.95 },
  loading: { scale: 0.9 },
  playing: { scale: 1 },
};

/* =========================
   EQUALIZER CONTAINER
========================= */
export const equalizerContainerVariants: Variants = {
  paused: { opacity: 1 },
  loading: { opacity: 0.5 },
  playing: { opacity: 1 },
};

/* =========================
   PROGRESS FILL COLOR (by state)
========================= */
export const progressFillVariants: Variants = {
  paused: { backgroundColor: "var(--progress-paused)", opacity: 0.6 },
  loading: { backgroundColor: "var(--progress-loading)", opacity: 0.4 },
  playing: { backgroundColor: "var(--progress-playing)", opacity: 1 },
};

/* =========================
   EQUALIZER BAR ANIMATE (by state)
========================= */
export const resolveEqualizerAnimate = (state: PlayerState) => {
  if (state === "playing") return { height: ["20%", "100%"] };
  if (state === "loading") return { height: "50%" };
  return { height: "20%" };
};

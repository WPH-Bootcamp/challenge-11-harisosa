import { PlayerState } from "@/components/music-player/motion/variants";
import { Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

type PlayBtnProps = {
  state: PlayerState;
  onToggle: () => void;
};

export const PlayButton: React.FC<PlayBtnProps> = ({ state, onToggle }) => {
  const isLoading = state === "loading";
  const isPlaying = state === "playing";

  return (
    <motion.button
      type="button"
      disabled={isLoading}
      onClick={() => {
        if (isLoading) return;
        onToggle();
      }}
      className={[
        "h-14 w-14 rounded-full grid place-items-center",
        isLoading
          ? "bg-white/25 cursor-not-allowed"
          : "bg-purple-500 cursor-pointer",
      ].join(" ")}
      whileHover={!isLoading ? { scale: 1.05 } : undefined}
      whileTap={!isLoading ? { scale: 0.95 } : undefined}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      <AnimatePresence mode="wait">
        {isPlaying ? (
          <motion.span
            key="pause"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", placeItems: "center" }}
          >
            <Pause size={20} className="text-white" />
          </motion.span>
        ) : (
          <motion.span
            key="play"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            style={{ display: "grid", placeItems: "center" }}
          >
            <Play size={20} className="text-white" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

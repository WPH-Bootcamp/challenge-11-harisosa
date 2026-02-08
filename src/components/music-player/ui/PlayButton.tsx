import { PlayerState } from "@/components/music-player/motion/variants";
import { Pause, Play } from "lucide-react";
import { motion } from "motion/react";

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
      onClick={onToggle}
      disabled={isLoading}
      className={[
        "h-14 w-14 rounded-full grid place-items-center",
        isLoading ? "bg-white/25 cursor-not-allowed" : "bg-purple-500",
      ].join(" ")}
      whileHover={!isLoading ? { scale: 1.05 } : undefined}
      whileTap={!isLoading ? { scale: 0.95 } : undefined}
      transition={{ type: "spring" }}
      aria-label={isPlaying ? "Pause" : "Play"}
    >
      {isPlaying ? (
        <Pause size={20} className="text-white" />
      ) : (
        <Play size={20} className="text-white" />
      )}
    </motion.button>
  );
};
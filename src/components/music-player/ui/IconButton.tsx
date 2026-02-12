import { motion } from "motion/react";

type IconBtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { disabled?: boolean, active?: boolean }

export const IconButton: React.FC<IconBtnProps> = ({ disabled, active, children, onClick }) => {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={[
        "h-9 w-9 rounded-md grid place-items-center transition-colors cursor-pointer",
        disabled ? "text-white/30 cursor-not-allowed" : "text-white/70 hover:text-white",
        active ? "bg-neutral-800" : "",
      ].join(" ")}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: "spring" }}
      aria-disabled={disabled}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
};
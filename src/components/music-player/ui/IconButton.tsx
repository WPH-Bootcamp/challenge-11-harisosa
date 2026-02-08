import { motion } from "motion/react";

type IconBtnProps = {
  disabled?: boolean;
  children: React.ReactNode;
};


export const IconButton: React.FC<IconBtnProps> = ({ disabled, children }) => {
  return (
    <motion.button
      type="button"
      disabled={disabled}
      className={[
        "h-10 w-10 grid place-items-center transition",
        disabled ? "text-white/30 cursor-not-allowed" : "text-white/70 hover:text-white",
      ].join(" ")}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      transition={{ type: "spring" }}
      aria-disabled={disabled}
    >
      {children}
    </motion.button>
  );
};
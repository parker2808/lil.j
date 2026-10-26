import { motion } from "framer-motion";

type StickyNextProps = {
  label: string;
  disabled: boolean;
  reduced: boolean;
  motionKey: string;
  onClick: () => void;
};

export function StickyNext({ label, disabled, reduced, motionKey, onClick }: StickyNextProps) {
  return (
    <motion.button
      key={motionKey}
      type="button"
      className="sticky-next"
      disabled={disabled}
      onClick={onClick}
      initial={reduced ? false : { opacity: 0, x: 18, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      whileTap={disabled || reduced ? undefined : { scale: 0.94 }}
      transition={{ duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] }}
    >
      <span>{label}</span>
      <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
        <path
          d="M4 10h11M11 5l5 5-5 5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

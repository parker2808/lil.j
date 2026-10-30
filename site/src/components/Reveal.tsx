import { motion } from "framer-motion";
import { Fragment, type ElementType } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type RevealProps = {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number;
};

export function Reveal({ text, as: Tag = "h1", className, delay = 0 }: RevealProps) {
  const reduced = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);
  if (reduced) return <Tag className={className}>{text}</Tag>;
  return (
    <Tag className={className ? `reveal ${className}` : "reveal"}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
        {index > 0 ? " " : null}
        <span className="reveal-mask">
          <motion.span
            className="reveal-word"
            initial={{ y: "115%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            transition={{ duration: 0.62, delay: delay + 0.045 * index, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
        </Fragment>
      ))}
    </Tag>
  );
}

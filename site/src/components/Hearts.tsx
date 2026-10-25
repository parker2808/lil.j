import { useMemo } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type HeartsProps = {
  active: boolean;
};

export function Hearts({ active }: HeartsProps) {
  const reduced = useReducedMotion();
  const hearts = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => ({
        id: index,
        left: 4 + ((index * 37) % 92),
        delay: (index * 0.45) % 5.5,
        duration: 7 + (index % 5),
        size: 12 + (index % 4) * 5,
        drift: (index % 2 === 0 ? -1 : 1) * (12 + (index % 5) * 8),
        color: index % 3 === 0 ? "#e6c48a" : index % 3 === 1 ? "#efb4c0" : "#f7f1e8",
      })),
    [],
  );

  if (!active || reduced) return null;

  return (
    <div className="hearts" aria-hidden="true">
      {hearts.map((heart) => (
        <span
          key={heart.id}
          className="heart"
          style={{
            left: `${heart.left}%`,
            animationDelay: `${heart.delay}s`,
            animationDuration: `${heart.duration}s`,
            fontSize: `${heart.size}px`,
            color: heart.color,
            ["--drift" as string]: `${heart.drift}px`,
          }}
        >
          ♥
        </span>
      ))}
    </div>
  );
}

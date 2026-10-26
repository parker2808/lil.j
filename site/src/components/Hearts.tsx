import { useMemo } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type HeartsProps = {
  active: boolean;
};

export function Hearts({ active }: HeartsProps) {
  const reduced = useReducedMotion();
  const bits = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        id: index,
        left: 4 + ((index * 37) % 92),
        delay: (index * 0.42) % 5.2,
        duration: 8 + (index % 5) * 0.8,
        size: index % 3 === 0 ? 10 + (index % 3) * 4 : 16 + (index % 4) * 6,
        drift: (index % 2 === 0 ? -1 : 1) * (16 + (index % 5) * 10),
        spark: index % 3 === 0,
      })),
    [],
  );

  if (!active || reduced) return null;

  return (
    <div className="hearts" aria-hidden="true">
      {bits.map((bit) => (
        <span
          key={bit.id}
          className={bit.spark ? "heart is-spark" : "heart"}
          style={{
            left: `${bit.left}%`,
            animationDelay: `${bit.delay}s`,
            animationDuration: `${bit.duration}s`,
            width: bit.size,
            height: bit.size,
            ["--drift" as string]: `${bit.drift}px`,
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <defs>
              <linearGradient id={`pearl-${bit.id}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#fff7fb" />
                <stop offset="0.42" stopColor="#f7c6dc" />
                <stop offset="1" stopColor="#e4d4ff" />
              </linearGradient>
            </defs>
            {bit.spark ? (
              <path
                fill={`url(#pearl-${bit.id})`}
                d="M12 1.5 13.6 9.2 21.5 12 13.6 14.8 12 22.5 10.4 14.8 2.5 12 10.4 9.2Z"
              />
            ) : (
              <path
                fill={`url(#pearl-${bit.id})`}
                d="M12 20.6s-6.4-4.1-8.9-7.7C1.2 10.2 1.8 6.9 4.5 5.8c2-.8 3.9-.1 5.2 1.6L12 9.2l2.3-1.8c1.3-1.7 3.2-2.4 5.2-1.6 2.7 1.1 3.3 4.4 1.4 7.1-2.5 3.6-8.9 7.7-8.9 7.7z"
              />
            )}
          </svg>
        </span>
      ))}
    </div>
  );
}

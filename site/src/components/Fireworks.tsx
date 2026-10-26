import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type Bit = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

const COLORS = ["#fff7fb", "#f7c6dc", "#d7c6f6", "#c9e2f8", "#f8d4c6", "#ffe4f0"];

export function Fireworks({ bursts = 4 }: { bursts?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let alive = true;
    const bits: Bit[] = [];
    let born = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const boom = (x: number, y: number) => {
      const count = 28;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.2;
        const speed = 0.6 + Math.random() * 1.8;
        bits.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 0.7 + Math.random() * 0.5,
          size: 1.4 + Math.random() * 2.2,
          color: COLORS[index % COLORS.length] ?? "#fff",
        });
      }
    };

    const frame = () => {
      if (!alive) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      if (born < bursts) {
        boom(width * (0.25 + Math.random() * 0.5), height * (0.2 + Math.random() * 0.35));
        born += 1;
      }
      for (const bit of bits) {
        bit.life += 0.016;
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vy += 0.012;
        const fade = 1 - bit.life / bit.max;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = bit.color;
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (bits.some((bit) => bit.life < bit.max)) raf = window.requestAnimationFrame(frame);
    };

    resize();
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [bursts, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}

export function Petals() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="petals" aria-hidden="true">
      {Array.from({ length: 10 }, (_, index) => (
        <i key={index} style={{ ["--i" as string]: index }} />
      ))}
    </div>
  );
}

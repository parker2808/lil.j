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

export function Fireworks({ bursts = 7 }: { bursts?: number }) {
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
      const count = 46;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.25;
        const speed = 0.8 + Math.random() * 2.6;
        bits.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 0.9 + Math.random() * 0.7,
          size: 1.6 + Math.random() * 2.6,
          color: COLORS[index % COLORS.length] ?? "#fff",
        });
      }
    };

    const frame = () => {
      if (!alive) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      ctx.clearRect(0, 0, width, height);
      if (born < bursts && bits.length < bursts * 46) {
        if (born === 0 || Math.random() > 0.82) {
          boom(width * (0.18 + Math.random() * 0.64), height * (0.12 + Math.random() * 0.46));
          born += 1;
        }
      }
      for (const bit of bits) {
        bit.life += 0.016;
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vy += 0.015;
        bit.vx *= 0.992;
        const fade = 1 - bit.life / bit.max;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = bit.color;
        ctx.shadowColor = bit.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      if (born < bursts || bits.some((bit) => bit.life < bit.max)) raf = window.requestAnimationFrame(frame);
    };

    resize();
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [bursts, reduced]);

  if (reduced) return null;
  return <canvas ref={ref} className="fx-canvas fireworks-layer" aria-hidden="true" />;
}

const PASTEL = ["#fff7fb", "#f7c6dc", "#e7d4ff", "#c9e2f8", "#ffd0e4"];

function mountCanvas(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.floor(rect.width * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return ctx;
}

/** One pastel burst. `play` increments each time it should fire. */
export function Spark({ play }: { play: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced || play < 1) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = mountCanvas(canvas);
    if (!ctx) return;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const bits: Bit[] = [];
    const originX = width * 0.5;
    const originY = height * 0.42;
    for (let index = 0; index < 36; index += 1) {
      const angle = (Math.PI * 2 * index) / 36;
      const speed = 1.1 + Math.random() * 2.4;
      bits.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 0.55 + Math.random() * 0.35,
        size: 1.5 + Math.random() * 2.2,
        color: PASTEL[index % PASTEL.length] ?? "#fff",
      });
    }
    let raf = 0;
    let alive = true;
    const frame = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      let moving = false;
      for (const bit of bits) {
        bit.life += 0.016;
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vy += 0.02;
        if (bit.life < bit.max) moving = true;
        ctx.globalAlpha = Math.max(0, 1 - bit.life / bit.max);
        ctx.fillStyle = bit.color;
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      if (moving) raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [play, reduced]);

  if (reduced || play < 1) return null;
  return <canvas ref={ref} className="fx-canvas" aria-hidden="true" />;
}

/** Full-viewport light burst when the gate opens. */
export function GateBurst() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const bits: Bit[] = [];
    for (let index = 0; index < 70; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 5;
      bits.push({
        x: width / 2,
        y: height * 0.42,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 0,
        max: 0.7 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 2.8,
        color: PASTEL[index % PASTEL.length] ?? "#fff",
      });
    }
    let raf = 0;
    let alive = true;
    const frame = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      let moving = false;
      for (const bit of bits) {
        bit.life += 0.016;
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vx *= 0.985;
        bit.vy *= 0.985;
        if (bit.life < bit.max) moving = true;
        ctx.globalAlpha = Math.max(0, 1 - bit.life / bit.max);
        ctx.fillStyle = bit.color;
        ctx.shadowColor = "#fff";
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      if (moving) raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="gate-burst" aria-hidden="true">
      {!reduced && <canvas ref={ref} className="gate-burst-canvas" />}
    </div>
  );
}

/** Falling stars over the final letter once the ink has finished. */
export function StarFall() {
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
    const stars = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      s: 1 + Math.random() * 1.8,
      v: 0.15 + Math.random() * 0.35,
      drift: (Math.random() - 0.5) * 0.08,
    }));
    const frame = (time: number) => {
      if (!alive) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const width = rect.width;
      const height = rect.height;
      if (canvas.width !== Math.floor(width * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        star.y += star.v * 0.012;
        star.x += star.drift * 0.006;
        if (star.y > 1.05) {
          star.y = -0.05;
          star.x = Math.random();
        }
        const tw = 0.45 + 0.55 * Math.sin(time / 280 + star.x * 12);
        ctx.globalAlpha = tw;
        ctx.fillStyle = "#fff7fb";
        ctx.shadowColor = "#f7c6dc";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.s, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    };
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
    };
  }, [reduced]);

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

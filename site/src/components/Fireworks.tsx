import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setMount(document.getElementById("fx-mount"));
  }, []);

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
    let cool = 0;

    const fit = () => {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const nextW = Math.floor(width * dpr);
      const nextH = Math.floor(height * dpr);
      if (canvas.width !== nextW || canvas.height !== nextH) {
        canvas.width = nextW;
        canvas.height = nextH;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { width, height };
    };

    const boom = (x: number, y: number) => {
      const count = 42;
      for (let index = 0; index < count; index += 1) {
        const angle = (Math.PI * 2 * index) / count + Math.random() * 0.25;
        const speed = 0.7 + Math.random() * 2.4;
        bits.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0,
          max: 0.9 + Math.random() * 0.8,
          size: 1.5 + Math.random() * 2.4,
          color: COLORS[index % COLORS.length] ?? "#fff",
        });
      }
    };

    const frame = () => {
      if (!alive) return;
      const { width, height } = fit();
      ctx.clearRect(0, 0, width, height);
      cool += 1;
      const room = bits.reduce((sum, bit) => sum + (bit.life < bit.max ? 1 : 0), 0);
      if (room < 120 && cool > 18 && (born < bursts || Math.random() > 0.55)) {
        const y = Math.random() > 0.4
          ? height * (0.05 + Math.random() * 0.14)
          : height * (0.62 + Math.random() * 0.22);
        boom(width * (0.1 + Math.random() * 0.8), y);
        born += 1;
        cool = 0;
      }
      for (let index = bits.length - 1; index >= 0; index -= 1) {
        const bit = bits[index];
        if (!bit || bit.life >= bit.max) {
          bits.splice(index, 1);
          continue;
        }
        bit.life += 0.016;
        bit.x += bit.vx;
        bit.y += bit.vy;
        bit.vy += 0.012;
        bit.vx *= 0.992;
        const fade = 1 - bit.life / bit.max;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = bit.color;
        ctx.beginPath();
        ctx.arc(bit.x, bit.y, bit.size * (0.7 + fade), 0, Math.PI * 2);
        ctx.fill();
      }
      softenEdges(ctx, width, height);
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    };

    const observer = new ResizeObserver(() => fit());
    observer.observe(canvas.parentElement ?? canvas);
    window.visualViewport?.addEventListener("resize", fit);
    raf = window.requestAnimationFrame(frame);
    return () => {
      alive = false;
      observer.disconnect();
      window.visualViewport?.removeEventListener("resize", fit);
      window.cancelAnimationFrame(raf);
    };
  }, [bursts, reduced, mount]);

  if (reduced || !mount) return null;
  return createPortal(<canvas ref={ref} className="fx-canvas fireworks-layer" aria-hidden="true" />, mount);
}

function softenEdges(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-in";
  const vertical = ctx.createLinearGradient(0, 0, 0, height);
  vertical.addColorStop(0, "rgba(0,0,0,0)");
  vertical.addColorStop(0.06, "rgba(0,0,0,1)");
  vertical.addColorStop(0.9, "rgba(0,0,0,1)");
  vertical.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = vertical;
  ctx.fillRect(0, 0, width, height);
  const horizontal = ctx.createLinearGradient(0, 0, width, 0);
  horizontal.addColorStop(0, "rgba(0,0,0,0)");
  horizontal.addColorStop(0.05, "rgba(0,0,0,1)");
  horizontal.addColorStop(0.95, "rgba(0,0,0,1)");
  horizontal.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = horizontal;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
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

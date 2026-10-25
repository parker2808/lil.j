import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type Star = {
  x: number;
  y: number;
  r: number;
  a: number;
  tw: number;
  phase: number;
  gold: boolean;
};

type Shot = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
};

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let alive = true;
    const stars: Star[] = [];
    let shot: Shot | null = null;
    let wait = 1.4;
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (stars.length > 0) return;
      const count = Math.max(80, Math.min(150, Math.round((width * height) / 15000)));
      for (let index = 0; index < count; index += 1) {
        stars.push({
          x: Math.random() * width,
          y: Math.random() * height,
          r: Math.random() < 0.07 ? 1.7 : 0.35 + Math.random() * 1.05,
          a: 0.2 + Math.random() * 0.75,
          tw: 0.5 + Math.random() * 2.4,
          phase: Math.random() * Math.PI * 2,
          gold: Math.random() < 0.14,
        });
      }
    };

    const draw = (time: number) => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      for (const star of stars) {
        const pulse = reduced ? 1 : 0.45 + 0.55 * Math.sin(time / 900 * star.tw + star.phase);
        ctx.globalAlpha = Math.max(0.08, star.a * pulse);
        ctx.fillStyle = star.gold ? "#f0d092" : "#fff7ee";
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.r > 1.4) {
          ctx.globalAlpha = 0.18 * pulse;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.r * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (!reduced) {
        wait -= 0.016;
        if (!shot && wait <= 0) {
          const left = Math.random() > 0.45;
          shot = {
            x: left ? -24 : width * (0.15 + Math.random() * 0.7),
            y: height * (0.04 + Math.random() * 0.42),
            vx: left ? 8 + Math.random() * 3 : -(7 + Math.random() * 3),
            vy: 2.4 + Math.random() * 1.8,
            life: 0,
            max: 0.85 + Math.random() * 0.45,
          };
        }
        if (shot) {
          shot.life += 0.016;
          shot.x += shot.vx;
          shot.y += shot.vy;
          const fade = 1 - shot.life / shot.max;
          for (let index = 0; index < 16; index += 1) {
            const trail = index / 16;
            ctx.globalAlpha = Math.max(0, fade * (1 - trail));
            ctx.fillStyle = index < 2 ? "#fffaf2" : "#f0d092";
            ctx.beginPath();
            ctx.arc(shot.x - shot.vx * trail * 2.1, shot.y - shot.vy * trail * 2.1, Math.max(0.3, 1.8 - trail * 1.5), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
          if (shot.life > shot.max || shot.x < -80 || shot.x > width + 80 || shot.y > height + 40) {
            shot = null;
            wait = 2.8 + Math.random() * 4.5;
          }
        }
      }

      if (!reduced && !document.hidden) raf = window.requestAnimationFrame(draw);
    };

    const onVisible = () => {
      if (document.hidden || reduced) return;
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisible);
    if (reduced) draw(0);
    else raf = window.requestAnimationFrame(draw);

    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

import { useEffect, useRef } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

type Star = {
  x: number;
  y: number;
  z: number;
  r: number;
  a: number;
  tw: number;
  phase: number;
  hue: string;
};

const STAR_HUES = ["#fff7fb", "#f7c6dc", "#d7c6f6", "#c9e2f8", "#f8d4c6"];

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
    const tilt = { x: 0, y: 0 };
    const gyro = { x: 0, y: 0 };
    const nebula = [
      { x: 0.2, y: 0.3, r: 0.42, hue: "rgba(186, 164, 236, 0.22)", drift: 0.4 },
      { x: 0.78, y: 0.62, r: 0.36, hue: "rgba(247, 183, 208, 0.18)", drift: 0.25 },
      { x: 0.5, y: 0.9, r: 0.5, hue: "rgba(197, 223, 245, 0.12)", drift: 0.15 },
    ];

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
          z: 0.25 + Math.random() * 1,
          r: Math.random() < 0.07 ? 1.8 : 0.35 + Math.random() * 1.05,
          a: 0.2 + Math.random() * 0.75,
          tw: 0.5 + Math.random() * 2.4,
          phase: Math.random() * Math.PI * 2,
          hue: STAR_HUES[index % STAR_HUES.length] ?? "#fff7fb",
        });
      }
    };

    const draw = (time: number) => {
      if (!alive) return;
      ctx.clearRect(0, 0, width, height);
      if (!reduced) {
        nebula.forEach((cloud, index) => {
          const ox = Math.sin(time / 9000 + index) * 24 * cloud.drift;
          const oy = Math.cos(time / 11000 + index) * 16 * cloud.drift;
          const gradient = ctx.createRadialGradient(
            cloud.x * width + ox + (tilt.x * 0.35 + gyro.x) * 28,
            cloud.y * height + oy + (tilt.y * 0.35 + gyro.y) * 18,
            10,
            cloud.x * width + ox,
            cloud.y * height + oy,
            cloud.r * Math.min(width, height),
          );
          gradient.addColorStop(0, cloud.hue);
          gradient.addColorStop(1, "rgba(0,0,0,0)");
          ctx.globalAlpha = 1;
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, width, height);
        });
      }
      for (const star of stars) {
        const pulse = reduced ? 1 : 0.45 + 0.55 * Math.sin(time / 900 * star.tw + star.phase);
        const sway = reduced ? 0 : Math.sin(time / 14000 + star.phase);
        const bob = reduced ? 0 : Math.cos(time / 17000 + star.phase);
        const px = tilt.x * 0.35 + gyro.x;
        const py = tilt.y * 0.35 + gyro.y;
        const x = star.x + px * 28 * star.z + sway * 10 * star.z;
        const y = star.y + py * 18 * star.z + bob * 6 * star.z;
        ctx.globalAlpha = Math.max(0.08, star.a * pulse);
        ctx.fillStyle = star.hue;
        ctx.beginPath();
        ctx.arc(x, y, star.r, 0, Math.PI * 2);
        ctx.fill();
        if (star.r > 1.4) {
          ctx.globalAlpha = 0.18 * pulse;
          ctx.beginPath();
          ctx.arc(x, y, star.r * 4, 0, Math.PI * 2);
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
            ctx.fillStyle = index < 2 ? "#fff7fb" : "#f4b7d4";
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

    const onPoint = (event: PointerEvent) => {
      tilt.x = event.clientX / Math.max(1, width) - 0.5;
      tilt.y = event.clientY / Math.max(1, height) - 0.5;
    };
    const onOrient = (event: Event) => {
      const orient = event as DeviceOrientationEvent;
      const gamma = orient.gamma ?? 0;
      const beta = orient.beta ?? 0;
      gyro.x = Math.max(-1, Math.min(1, gamma / 32));
      gyro.y = Math.max(-1, Math.min(1, (beta - 35) / 40));
    };
    const askGyro = () => {
      const ctor = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (typeof ctor.requestPermission !== "function") return;
      void ctor.requestPermission().then((state) => {
        if (state === "granted") window.addEventListener("deviceorientation", onOrient);
      }).catch(() => undefined);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPoint, { passive: true });
    window.addEventListener("deviceorientation", onOrient);
    window.addEventListener("pointerdown", askGyro, { once: true });
    document.addEventListener("visibilitychange", onVisible);
    if (reduced) draw(0);
    else raf = window.requestAnimationFrame(draw);

    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPoint);
      window.removeEventListener("deviceorientation", onOrient);
      window.removeEventListener("pointerdown", askGyro);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="starfield" aria-hidden="true" />;
}

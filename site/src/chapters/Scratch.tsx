import { useCallback, useEffect, useRef } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { ChapterProps } from "../types.ts";

export function Scratch({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "scratch");

  const reveal = useCallback((id: string) => {
    update((current) =>
      current.scratched.includes(id) ? current : { ...current, scratched: [...current.scratched, id] },
    );
  }, [update]);

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <div className="scratch-list">
        {content.scratches.map((item) => (
          <ScratchCard
            key={item.id}
            id={item.id}
            cover={t(item.cover)}
            reveal={t(item.reveal)}
            revealed={progress.scratched.includes(item.id)}
            onReveal={reveal}
          />
        ))}
      </div>
    </ChapterFrame>
  );
}

function ScratchCard({
  id,
  cover,
  reveal,
  revealed,
  onReveal,
}: {
  id: string;
  cover: string;
  reveal: string;
  revealed: boolean;
  onReveal: (id: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glitterRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    const glitter = glitterRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const gctx = glitter?.getContext("2d") ?? null;
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    let moves = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const paint = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const width = rect.width;
      const height = rect.height;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#e7b4c8");
      gradient.addColorStop(0.45, "#fbe4ee");
      gradient.addColorStop(1, "#d489a8");
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#fff6fb";
      ctx.lineWidth = 2;
      for (let x = -height; x < width; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#6a3454";
      ctx.font = "600 16px Inter, ui-sans-serif, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cover, width / 2, height / 2);
    };

    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    type Glint = { x: number; y: number; vx: number; vy: number; life: number; size: number };
    const glints: Glint[] = [];

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!reduced) {
        for (let index = 0; index < 7; index += 1) {
          glints.push({
            x: lastX + (x - lastX) * Math.random(),
            y: lastY + (y - lastY) * Math.random(),
            vx: (Math.random() - 0.5) * 1.6,
            vy: -0.4 - Math.random() * 1.4,
            life: 1,
            size: 1 + Math.random() * 2.2,
          });
        }
      }
      lastX = x;
      lastY = y;
      kickGlitter();
    };

    const cleared = () => {
      const { width, height } = canvas;
      const pixels = ctx.getImageData(0, 0, width, height).data;
      let clear = 0;
      let total = 0;
      const step = 8 * dpr;
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const alpha = pixels[(Math.floor(y) * width + Math.floor(x)) * 4 + 3] ?? 255;
          total += 1;
          if (alpha < 40) clear += 1;
        }
      }
      return total > 0 && clear / total > 0.46;
    };

    const maybeDone = () => {
      if (cleared()) onReveal(id);
    };

    const down = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      drawing = true;
      const here = point(event);
      lastX = here.x;
      lastY = here.y;
      scratch(here.x + 0.01, here.y + 0.01);
    };
    const move = (event: PointerEvent) => {
      if (!drawing) return;
      const here = point(event);
      scratch(here.x, here.y);
      moves += 1;
      if (moves % 8 === 0) maybeDone();
    };
    const up = () => {
      if (!drawing) return;
      drawing = false;
      maybeDone();
    };

    let raf = 0;
    let alive = true;
    let glittering = false;
    const glitterFrame = () => {
      glittering = false;
      if (!alive) return;
      if (glitter && gctx) {
        const rect = glitter.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        if (glitter.width !== Math.floor(width * dpr)) {
          glitter.width = Math.max(1, Math.floor(width * dpr));
          glitter.height = Math.max(1, Math.floor(height * dpr));
        }
        gctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        gctx.clearRect(0, 0, width, height);
        for (let index = glints.length - 1; index >= 0; index -= 1) {
          const glint = glints[index];
          if (!glint) continue;
          glint.x += glint.vx;
          glint.y += glint.vy;
          glint.life -= 0.04;
          if (glint.life <= 0) {
            glints.splice(index, 1);
            continue;
          }
          gctx.globalAlpha = glint.life;
          gctx.fillStyle = glint.life > 0.6 ? "#fff" : "#f7c6dc";
          gctx.shadowColor = "#fff7fb";
          gctx.shadowBlur = 6;
          gctx.beginPath();
          gctx.arc(glint.x, glint.y, glint.size, 0, Math.PI * 2);
          gctx.fill();
        }
        gctx.shadowBlur = 0;
        gctx.globalAlpha = 1;
      }
      if (glints.length > 0) {
        glittering = true;
        raf = window.requestAnimationFrame(glitterFrame);
      }
    };
    const kickGlitter = () => {
      if (reduced || glittering) return;
      glittering = true;
      raf = window.requestAnimationFrame(glitterFrame);
    };

    paint();
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [cover, id, onReveal, reduced, revealed]);

  return (
    <article className="scratch">
      <p className="scratch-reveal">{reveal}</p>
      {!revealed && (
        <>
          <canvas ref={canvasRef} className="scratch-canvas" aria-label={cover} />
          <canvas ref={glitterRef} className="scratch-glitter" aria-hidden="true" />
        </>
      )}
    </article>
  );
}

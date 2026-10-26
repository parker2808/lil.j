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
    const card = canvas?.parentElement;
    if (!canvas || !card) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const gctx = glitter?.getContext("2d") ?? null;
    let drawing = false;
    let pointer = -1;
    let lastX = 0;
    let lastY = 0;
    let lastCssX = 0;
    let lastCssY = 0;
    let moves = 0;
    let painted = false;

    const foil = (width: number, height: number) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.globalAlpha = 1;
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#e7b4c8");
      gradient.addColorStop(0.45, "#fbe4ee");
      gradient.addColorStop(1, "#d489a8");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#fff6fb";
      ctx.lineWidth = Math.max(2, height / 84);
      for (let x = -height; x < width; x += Math.max(10, height / 12)) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + height, height);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#6a3454";
      ctx.font = `600 ${Math.max(14, Math.round(height / 10))}px Inter, ui-sans-serif, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cover, width / 2, height / 2);
    };

    const fit = () => {
      const cssWidth = card.clientWidth;
      const cssHeight = card.clientHeight;
      if (cssWidth < 2 || cssHeight < 2) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const nextW = Math.max(1, Math.round(cssWidth * dpr));
      const nextH = Math.max(1, Math.round(cssHeight * dpr));
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      if (glitter) {
        glitter.style.width = `${cssWidth}px`;
        glitter.style.height = `${cssHeight}px`;
      }
      if (canvas.width === nextW && canvas.height === nextH && painted) return;
      const previous = painted ? document.createElement("canvas") : null;
      if (previous) {
        previous.width = canvas.width;
        previous.height = canvas.height;
        previous.getContext("2d")?.drawImage(canvas, 0, 0);
      }
      canvas.width = nextW;
      canvas.height = nextH;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      if (previous && previous.width > 1 && previous.height > 1) {
        ctx.drawImage(previous, 0, 0, nextW, nextH);
      } else {
        foil(nextW, nextH);
      }
      painted = true;
    };

    const locate = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relX = Math.min(1, Math.max(0, (event.clientX - rect.left) / Math.max(rect.width, 1)));
      const relY = Math.min(1, Math.max(0, (event.clientY - rect.top) / Math.max(rect.height, 1)));
      return {
        x: relX * canvas.width,
        y: relY * canvas.height,
        cssX: relX * rect.width,
        cssY: relY * rect.height,
      };
    };

    type Glint = { x: number; y: number; vx: number; vy: number; life: number; size: number };
    const glints: Glint[] = [];

    const scratchTo = (x: number, y: number, cssX: number, cssY: number) => {
      const rect = canvas.getBoundingClientRect();
      const scale = canvas.width / Math.max(rect.width, 1);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 36 * scale;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      if (!reduced) {
        for (let index = 0; index < 6; index += 1) {
          glints.push({
            x: lastCssX + (cssX - lastCssX) * Math.random(),
            y: lastCssY + (cssY - lastCssY) * Math.random(),
            vx: (Math.random() - 0.5) * 1.6,
            vy: -0.4 - Math.random() * 1.4,
            life: 1,
            size: 1 + Math.random() * 2.2,
          });
        }
      }
      lastX = x;
      lastY = y;
      lastCssX = cssX;
      lastCssY = cssY;
      kickGlitter();
    };

    const cleared = () => {
      const { width, height } = canvas;
      if (width < 2 || height < 2) return false;
      const pixels = ctx.getImageData(0, 0, width, height).data;
      const cols = 48;
      const rows = 28;
      let clear = 0;
      let total = 0;
      for (let row = 0; row < rows; row += 1) {
        for (let col = 0; col < cols; col += 1) {
          const x = Math.min(width - 1, Math.round(((col + 0.5) / cols) * width));
          const y = Math.min(height - 1, Math.round(((row + 0.5) / rows) * height));
          const alpha = pixels[(y * width + x) * 4 + 3] ?? 255;
          total += 1;
          if (alpha < 40) clear += 1;
        }
      }
      return total > 0 && clear / total > 0.46;
    };

    const maybeDone = () => {
      if (cleared()) onReveal(id);
    };

    const stroke = (event: PointerEvent) => {
      const events = event.getCoalescedEvents?.() ?? [event];
      const batch = events.length > 0 ? events : [event];
      for (const item of batch) {
        const here = locate(item);
        scratchTo(here.x, here.y, here.cssX, here.cssY);
      }
    };

    const down = (event: PointerEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      card.setPointerCapture(event.pointerId);
      drawing = true;
      pointer = event.pointerId;
      const here = locate(event);
      lastX = here.x;
      lastY = here.y;
      lastCssX = here.cssX;
      lastCssY = here.cssY;
      scratchTo(here.x + 0.5, here.y + 0.5, here.cssX, here.cssY);
    };
    const move = (event: PointerEvent) => {
      if (!drawing || event.pointerId !== pointer) return;
      event.preventDefault();
      stroke(event);
      moves += 1;
      if (moves % 6 === 0) maybeDone();
    };
    const up = (event: PointerEvent) => {
      if (!drawing || event.pointerId !== pointer) return;
      drawing = false;
      pointer = -1;
      if (card.hasPointerCapture(event.pointerId)) card.releasePointerCapture(event.pointerId);
      maybeDone();
    };

    let raf = 0;
    let alive = true;
    let glittering = false;
    const glitterFrame = () => {
      glittering = false;
      if (!alive || !glitter || !gctx) return;
      const width = card.clientWidth;
      const height = card.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const nextW = Math.max(1, Math.round(width * dpr));
      const nextH = Math.max(1, Math.round(height * dpr));
      if (glitter.width !== nextW || glitter.height !== nextH) {
        glitter.width = nextW;
        glitter.height = nextH;
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

    fit();
    const observer = new ResizeObserver(() => fit());
    observer.observe(card);
    card.addEventListener("pointerdown", down);
    card.addEventListener("pointermove", move);
    card.addEventListener("pointerup", up);
    card.addEventListener("pointercancel", up);
    return () => {
      alive = false;
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      card.removeEventListener("pointerdown", down);
      card.removeEventListener("pointermove", move);
      card.removeEventListener("pointerup", up);
      card.removeEventListener("pointercancel", up);
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

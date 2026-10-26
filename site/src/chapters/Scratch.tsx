import { useCallback, useEffect, useRef } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { useI18n } from "../lib/locale-context.ts";
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

  useEffect(() => {
    if (revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
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
      ctx.font = "600 16px 'Be Vietnam Pro', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(cover, width / 2, height / 2);
    };

    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const scratch = (x: number, y: number) => {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 34;
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.stroke();
      lastX = x;
      lastY = y;
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

    paint();
    canvas.addEventListener("pointerdown", down);
    canvas.addEventListener("pointermove", move);
    canvas.addEventListener("pointerup", up);
    canvas.addEventListener("pointercancel", up);
    return () => {
      canvas.removeEventListener("pointerdown", down);
      canvas.removeEventListener("pointermove", move);
      canvas.removeEventListener("pointerup", up);
      canvas.removeEventListener("pointercancel", up);
    };
  }, [cover, id, onReveal, revealed]);

  return (
    <article className="scratch">
      <p className="scratch-reveal">{reveal}</p>
      {!revealed && <canvas ref={canvasRef} className="scratch-canvas" aria-label={cover} />}
    </article>
  );
}

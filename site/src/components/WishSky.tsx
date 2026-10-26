import { useEffect, useRef, useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { playChime } from "../lib/music.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { Wish } from "../types.ts";
import { Reveal } from "./Reveal.tsx";

type WishSkyProps = {
  wishes: Wish[];
  onSend: (text: string) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
};

const HUES = ["#fff7fb", "#f7c6dc", "#e7d4ff", "#c9e2f8", "#ffd0e4"];

export function WishSky({ wishes, onSend }: WishSkyProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [value, setValue] = useState("");
  const [empty, setEmpty] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const seen = useRef(wishes.length);
  const reading = wishes.find((wish) => wish.id === openId);

  useEffect(() => {
    if (wishes.length <= seen.current) {
      seen.current = wishes.length;
      return;
    }
    const wish = wishes[wishes.length - 1];
    seen.current = wishes.length;
    if (!wish) return;
    if (reduced) {
      setHiddenId(null);
      return;
    }
    setHiddenId(wish.id);
    const sky = skyRef.current;
    const canvas = canvasRef.current;
    const form = formRef.current;
    if (!sky || !canvas || !form) {
      setHiddenId(null);
      return;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setHiddenId(null);
      return;
    }
    const spot = slot(wish.id);
    const skyBox = sky.getBoundingClientRect();
    const formBox = form.getBoundingClientRect();
    const fieldBox = starsRef.current?.getBoundingClientRect() ?? skyBox;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(skyBox.width * dpr));
    canvas.height = Math.max(1, Math.floor(skyBox.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const from = {
      x: formBox.left - skyBox.left + formBox.width / 2,
      y: formBox.top - skyBox.top + formBox.height / 2,
    };
    const to = {
      x: fieldBox.left - skyBox.left + (spot.left / 100) * fieldBox.width,
      y: fieldBox.top - skyBox.top + (spot.top / 100) * fieldBox.height,
    };
    const samples = sampleWords(wish.text, Math.min(280, skyBox.width - 36));
    const particles: Particle[] = samples.map((point) => ({
      x: from.x - 80 + point.x,
      y: from.y - 10 + point.y,
      vx: 0,
      vy: 0,
      size: 1.4 + Math.random() * 1.8,
      color: HUES[Math.floor(Math.random() * HUES.length)] ?? "#fff",
      life: 1,
    }));
    let raf = 0;
    let start = 0;
    const duration = 2800;
    const tick = (now: number) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, skyBox.width, skyBox.height);
      const gather = ease(Math.min(1, t / 0.28));
      const launch = ease(clamp01((t - 0.28) / 0.4));
      const burst = clamp01((t - 0.7) / 0.3);
      const head = {
        x: from.x + (to.x - from.x) * launch,
        y: from.y + (to.y - from.y) * launch - Math.sin(launch * Math.PI) * 36,
      };
      particles.forEach((particle, index) => {
        const originX = from.x - 80 + (samples[index]?.x ?? 0);
        const originY = from.y - 10 + (samples[index]?.y ?? 0);
        const gx = originX + (from.x - originX) * gather;
        const gy = originY + (from.y - 28 - originY) * gather;
        const tx = gx + (head.x - gx) * launch;
        const ty = gy + (head.y - gy) * launch;
        particle.x += (tx - particle.x) * 0.35;
        particle.y += (ty - particle.y) * 0.35;
        const fade = burst > 0 ? 1 - burst : 1;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      if (launch > 0.02 && burst < 1) {
        ctx.globalAlpha = 0.85;
        const grad = ctx.createLinearGradient(from.x, from.y, head.x, head.y);
        grad.addColorStop(0, "rgba(255,247,251,0)");
        grad.addColorStop(1, "rgba(255,214,230,0.95)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(from.x + (head.x - from.x) * Math.max(0, launch - 0.18), from.y + (head.y - from.y) * Math.max(0, launch - 0.18));
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff7fb";
        ctx.shadowColor = "#f7c6dc";
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 5 + launch * 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (burst > 0) {
        const sparks = 18;
        for (let index = 0; index < sparks; index += 1) {
          const angle = (Math.PI * 2 * index) / sparks;
          const radius = burst * (28 + (index % 5) * 8);
          ctx.globalAlpha = 1 - burst;
          ctx.fillStyle = HUES[index % HUES.length] ?? "#fff";
          ctx.beginPath();
          ctx.arc(to.x + Math.cos(angle) * radius, to.y + Math.sin(angle) * radius, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      if (t < 1) raf = window.requestAnimationFrame(tick);
      else setHiddenId(null);
    };
    navigator.vibrate?.([12, 36, 14]);
    playChime();
    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [reduced, wishes]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim().slice(0, 180);
    if (!text) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    setValue("");
    setOpenId(null);
    onSend(text);
  }

  return (
    <section className="scene wish-scene">
      <div className="wish-sky" ref={skyRef}>
        <canvas ref={canvasRef} className="wish-flight" aria-hidden="true" />
        <div className="wish-copy">
          <p className="kicker">{t(content.wish.kicker)}</p>
          <Reveal text={t(content.wish.title)} />
          <p className="lede">{t(content.wish.lede)}</p>
          <p className="wish-read" role="status">
            {empty ? t(content.wish.empty) : reading ? reading.text : wishes.length > 0 ? t(content.wish.sent) : ""}
          </p>
        </div>
        <div className="wish-stars" ref={starsRef}>
          {wishes.map((wish) => {
            if (wish.id === hiddenId) return null;
            const spot = slot(wish.id);
            const hue = HUES[hashOf(wish.id) % HUES.length];
            return (
              <button
                key={wish.id}
                type="button"
                className={wish.id === openId ? "wish-star is-on" : "wish-star"}
                style={{ left: `${spot.left}%`, top: `${spot.top}%`, ["--hue" as string]: hue }}
                aria-label={wish.text}
                aria-pressed={wish.id === openId}
                onClick={() => setOpenId(wish.id === openId ? null : wish.id)}
              />
            );
          })}
        </div>
        <form className="wish-pill" onSubmit={submit} ref={formRef}>
          <label className="wish-field">
            <span className="sr-only">{t(content.wish.placeholder)}</span>
            <input
              value={value}
              placeholder={t(content.wish.placeholder)}
              maxLength={180}
              autoComplete="off"
              enterKeyHint="send"
              onChange={(event) => {
                setValue(event.target.value);
                setEmpty(false);
              }}
            />
          </label>
          <button type="submit" className="btn btn-gold">
            {wishes.length > 0 ? t(content.wish.more) : t(content.wish.send)}
          </button>
        </form>
      </div>
    </section>
  );
}

function sampleWords(text: string, width: number): { x: number; y: number }[] {
  const canvas = document.createElement("canvas");
  const height = 36;
  canvas.width = Math.max(40, Math.floor(width));
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [{ x: width / 2, y: 18 }];
  ctx.font = "600 16px 'Be Vietnam Pro', sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(text.slice(0, 42), 0, 24);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      if ((data[(y * canvas.width + x) * 4 + 3] ?? 0) > 40) points.push({ x, y });
    }
  }
  if (points.length > 90) {
    const step = Math.ceil(points.length / 90);
    return points.filter((_, index) => index % step === 0);
  }
  return points.length > 0 ? points : [{ x: width / 2, y: 18 }];
}

function slot(id: string): { left: number; top: number } {
  const hash = hashOf(id);
  return { left: 16 + (hash % 68), top: 30 + ((hash >>> 8) % 40) };
}

function hashOf(id: string): number {
  let hash = 0;
  for (const char of id) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function ease(value: number): number {
  return 1 - (1 - value) ** 3;
}

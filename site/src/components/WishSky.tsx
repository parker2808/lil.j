import { useEffect, useRef, useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { playChime } from "../lib/music.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { Wish } from "../types.ts";
import { Reveal } from "./Reveal.tsx";

type WishSkyProps = {
  wishes: Wish[];
  wishPrivate: boolean;
  onSend: (text: string) => void;
  onKeepPrivate: () => void;
};

type Particle = {
  x: number;
  y: number;
  homeX: number;
  homeY: number;
  size: number;
  color: string;
};

type Spark = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  color: string;
};

const HUES = ["#fff7fb", "#f7c6dc", "#e7d4ff", "#c9e2f8", "#ffd0e4", "#f8d4c6"];

let flownId: string | null = null;
let seeded = false;

export function WishSky({ wishes, wishPrivate, onSend, onKeepPrivate }: WishSkyProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [value, setValue] = useState("");
  const [empty, setEmpty] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [hiddenId, setHiddenId] = useState<string | null>(null);
  const [flying, setFlying] = useState(false);
  const skyRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reading = wishes.find((wish) => wish.id === openId);

  useEffect(() => {
    if (!shaking) return;
    const timer = window.setTimeout(() => setShaking(false), 480);
    return () => window.clearTimeout(timer);
  }, [shaking]);

  useEffect(() => {
    const wish = wishes[wishes.length - 1];
    if (!seeded) {
      seeded = true;
      flownId = wish?.id ?? null;
      return;
    }
    if (!wish || wish.id === flownId) return;
    const id = wish.id;
    flownId = id;
    if (reduced) {
      playChime();
      return;
    }
    const sky = skyRef.current;
    const canvas = canvasRef.current;
    const form = formRef.current;
    if (!sky || !canvas || !form) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cancelled = false;
    let chimed = false;
    setHiddenId(id);
    setFlying(true);
    const spot = slot(id);
    const skyBox = sky.getBoundingClientRect();
    const formBox = form.getBoundingClientRect();
    const fieldBox = starsRef.current?.getBoundingClientRect() ?? skyBox;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const width = Math.max(1, skyBox.width);
    const height = Math.max(1, skyBox.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const from = {
      x: formBox.left - skyBox.left + formBox.width / 2,
      y: formBox.top - skyBox.top + 8,
    };
    const to = {
      x: fieldBox.left - skyBox.left + (spot.left / 100) * fieldBox.width,
      y: fieldBox.top - skyBox.top + (spot.top / 100) * fieldBox.height,
    };
    const control = {
      x: (from.x + to.x) / 2 + (to.x >= from.x ? -90 : 90),
      y: Math.min(from.y, to.y) - Math.max(80, height * 0.12),
    };
    const samples = sampleWords(wish.text, Math.min(260, width - 48));
    const particles: Particle[] = samples.map((point) => ({
      x: from.x - 90 + point.x,
      y: from.y + point.y,
      homeX: from.x - 90 + point.x,
      homeY: from.y + point.y,
      size: 1.3 + Math.random() * 1.7,
      color: HUES[Math.floor(Math.random() * HUES.length)] ?? "#fff",
    }));
    const sparks: Spark[] = [];
    const trail: { x: number; y: number }[] = [];
    let raf = 0;
    let start = 0;
    const duration = 3400;

    const finish = () => {
      if (cancelled) return;
      ctx.clearRect(0, 0, width, height);
      setHiddenId(null);
      setFlying(false);
    };

    const tick = (now: number) => {
      if (cancelled) return;
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      ctx.clearRect(0, 0, width, height);
      const dissolve = ease(clamp01(t / 0.18));
      const gather = ease(clamp01((t - 0.16) / 0.22));
      const launch = ease(clamp01((t - 0.38) / 0.4));
      const bloom = clamp01((t - 0.78) / 0.22);
      const head = quad(from, control, to, launch);
      if (launch > 0.02) {
        trail.push({ x: head.x, y: head.y });
        if (trail.length > 22) trail.shift();
        if (Math.random() > 0.35) {
          const angle = Math.random() * Math.PI * 2;
          sparks.push({
            x: head.x,
            y: head.y,
            vx: Math.cos(angle) * (0.4 + Math.random() * 1.3),
            vy: Math.sin(angle) * (0.4 + Math.random() * 1.3) + 0.3,
            life: 0,
            max: 0.35 + Math.random() * 0.35,
            size: 1 + Math.random() * 1.6,
            color: HUES[sparks.length % HUES.length] ?? "#fff",
          });
        }
      }
      if (!chimed && t > 0.38) {
        chimed = true;
        playChime();
      }

      particles.forEach((particle, index) => {
        const sway = Math.sin(t * 18 + index) * 10 * (1 - gather);
        const spreadX = particle.homeX + sway + (index % 2 === 0 ? 1 : -1) * dissolve * 8;
        const spreadY = particle.homeY - dissolve * 12;
        const coreX = from.x;
        const coreY = from.y - 26;
        const gatheredX = spreadX + (coreX - spreadX) * gather;
        const gatheredY = spreadY + (coreY - spreadY) * gather;
        const targetX = gatheredX + (head.x - gatheredX) * launch;
        const targetY = gatheredY + (head.y - gatheredY) * launch;
        particle.x += (targetX - particle.x) * 0.28;
        particle.y += (targetY - particle.y) * 0.28;
        const fade = bloom > 0 ? 1 - bloom : 0.35 + gather * 0.65;
        ctx.globalAlpha = Math.max(0, fade);
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });

      if (trail.length > 1) {
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        for (let index = 1; index < trail.length; index += 1) {
          const prev = trail[index - 1];
          const next = trail[index];
          if (!prev || !next) continue;
          const fade = index / trail.length;
          ctx.globalAlpha = fade * (1 - bloom) * 0.85;
          ctx.strokeStyle = fade > 0.7 ? "#fff7fb" : "#f7c6dc";
          ctx.lineWidth = 1.2 + fade * 4.5;
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(next.x, next.y);
          ctx.stroke();
        }
      }

      for (let index = sparks.length - 1; index >= 0; index -= 1) {
        const spark = sparks[index];
        if (!spark) continue;
        spark.life += 0.016;
        spark.x += spark.vx;
        spark.y += spark.vy;
        if (spark.life >= spark.max) {
          sparks.splice(index, 1);
          continue;
        }
        ctx.globalAlpha = (1 - spark.life / spark.max) * (1 - bloom * 0.4);
        ctx.fillStyle = spark.color;
        ctx.beginPath();
        ctx.arc(spark.x, spark.y, spark.size, 0, Math.PI * 2);
        ctx.fill();
      }

      if (gather > 0.2 && bloom < 1) {
        const glow = 4 + gather * 7 + launch * 4;
        const gradient = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, glow * 4);
        gradient.addColorStop(0, "rgba(255,247,251,0.95)");
        gradient.addColorStop(0.45, "rgba(247,198,220,0.45)");
        gradient.addColorStop(1, "rgba(247,198,220,0)");
        ctx.globalAlpha = 1 - bloom * 0.3;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(head.x, head.y, glow * 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(head.x, head.y, glow * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      if (bloom > 0) {
        const radius = 18 + bloom * 86;
        const gradient = ctx.createRadialGradient(to.x, to.y, 0, to.x, to.y, radius);
        gradient.addColorStop(0, "rgba(255,247,251,0.9)");
        gradient.addColorStop(0.35, "rgba(247,198,220,0.45)");
        gradient.addColorStop(1, "rgba(199,186,246,0)");
        ctx.globalAlpha = (1 - bloom) * 0.95;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(to.x, to.y, radius, 0, Math.PI * 2);
        ctx.fill();
        const bits = 28;
        for (let index = 0; index < bits; index += 1) {
          const angle = (Math.PI * 2 * index) / bits + bloom;
          const dist = bloom * (26 + (index % 6) * 10);
          ctx.globalAlpha = 1 - bloom;
          ctx.fillStyle = HUES[index % HUES.length] ?? "#fff";
          ctx.beginPath();
          ctx.arc(to.x + Math.cos(angle) * dist, to.y + Math.sin(angle) * dist, 2.1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1;
      if (t < 1) raf = window.requestAnimationFrame(tick);
      else finish();
    };

    navigator.vibrate?.([10, 28, 12]);
    raf = window.requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      setFlying(false);
    };
  }, [reduced, wishes]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim().slice(0, 180);
    if (!text) {
      setEmpty(true);
      setShaking(true);
      return;
    }
    setEmpty(false);
    setValue("");
    setOpenId(null);
    onSend(text);
    const field = event.currentTarget.querySelector("input");
    if (field instanceof HTMLInputElement) field.blur();
  }

  const note = empty ? t(content.wish.empty) : reading ? reading.text : wishes.length > 0 ? t(content.wish.sent) : "";

  return (
    <section className="scene wish-scene">
      <div className={flying ? "wish-sky is-flying" : "wish-sky"} ref={skyRef}>
        <canvas ref={canvasRef} className="wish-flight" aria-hidden="true" />
        <div className="wish-copy">
          <p className="kicker">{t(content.wish.kicker)}</p>
          <Reveal text={t(content.wish.title)} />
          <p className="lede">{t(content.wish.lede)}</p>
          <p className={empty ? "wish-read is-empty" : "wish-read"} role="status">
            {note}
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
        {!wishPrivate && (
          <button type="button" className="btn btn-quiet later wish-keep" onClick={onKeepPrivate}>
            {t(content.wish.keep)}
          </button>
        )}
        <form className={shaking ? "wish-form shake" : "wish-form"} onSubmit={submit} ref={formRef}>
          <div className="wish-field">
            <label>
              <input
                value={value}
                placeholder=" "
                maxLength={180}
                autoComplete="off"
                enterKeyHint="send"
                aria-invalid={empty}
                onChange={(event) => {
                  setValue(event.target.value);
                  setEmpty(false);
                }}
              />
              <span>{t(content.wish.placeholder)}</span>
            </label>
            <button
              type="submit"
              className="wish-go"
              aria-label={t(content.wish.send)}
              onPointerDown={(event) => event.preventDefault()}
            >
              <svg viewBox="0 0 20 20" aria-hidden="true">
                <path
                  d="M4 10h11M11 5l5 5-5 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
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
  ctx.font = "600 16px Inter, ui-sans-serif, sans-serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(text.slice(0, 42), 0, 24);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const points: { x: number; y: number }[] = [];
  for (let y = 0; y < canvas.height; y += 3) {
    for (let x = 0; x < canvas.width; x += 3) {
      if ((data[(y * canvas.width + x) * 4 + 3] ?? 0) > 40) points.push({ x, y });
    }
  }
  if (points.length > 80) {
    const step = Math.ceil(points.length / 80);
    return points.filter((_, index) => index % step === 0);
  }
  return points.length > 0 ? points : [{ x: width / 2, y: 18 }];
}

function slot(id: string): { left: number; top: number } {
  const hash = hashOf(id);
  return { left: 12 + (hash % 76), top: 18 + ((hash >>> 8) % 64) };
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

function quad(
  from: { x: number; y: number },
  control: { x: number; y: number },
  to: { x: number; y: number },
  t: number,
) {
  const u = 1 - t;
  return {
    x: u * u * from.x + 2 * u * t * control.x + t * t * to.x,
    y: u * u * from.y + 2 * u * t * control.y + t * t * to.y,
  };
}

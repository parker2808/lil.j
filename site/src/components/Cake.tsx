import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate } from "../lib/pure.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { Progress } from "../types.ts";
import { Typewriter } from "./Typewriter.tsx";

type CakeProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onBack: () => void;
  onNext: () => void;
};

const COLORS = ["#f6b7d0", "#d4c4f6", "#c5dff5", "#f8d0c2", "#fff4f8", "#e7b7c4"];

const SPRINKLES: { x: number; y: number; rot: number; fill: string }[] = [
  { x: 132, y: 78, rot: -28, fill: "#f6b7d0" },
  { x: 154, y: 70, rot: 18, fill: "#fff" },
  { x: 176, y: 84, rot: 48, fill: "#c5dff5" },
  { x: 198, y: 68, rot: -12, fill: "#d4c4f6" },
  { x: 214, y: 86, rot: 24, fill: "#f8d0c2" },
  { x: 148, y: 92, rot: 70, fill: "#fff" },
  { x: 188, y: 96, rot: -40, fill: "#e7b7c4" },
  { x: 168, y: 64, rot: 8, fill: "#f3c6dc" },
];

export function Cake({ progress, update, onBack, onNext }: CakeProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const count = Math.max(1, Math.min(8, content.cake.candles || 5));
  const out = progress.candlesOut.filter((index) => index >= 0 && index < count);
  const allOut = out.length >= count;
  const [arrivedDone] = useState(allOut);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [micFailed, setMicFailed] = useState(false);
  const [fresh, setFresh] = useState<number[]>([]);
  const blowRef = useRef<() => void>(() => {});
  const doneRef = useRef(allOut);

  useEffect(() => {
    doneRef.current = allOut;
  }, [allOut]);

  const extinguish = useCallback(
    (index?: number) => {
      const existing = out;
      const target =
        index ?? Array.from({ length: count }, (_, item) => item).find((item) => !existing.includes(item));
      if (target === undefined || existing.includes(target)) return;
      setFresh((current) => (current.includes(target) ? current : [...current, target]));
      update((current) => {
        const known = current.candlesOut.filter((item) => item >= 0 && item < count);
        if (known.includes(target)) return current;
        return { ...current, candlesOut: [...known, target] };
      });
    },
    [count, out, update],
  );

  useEffect(() => {
    blowRef.current = () => extinguish();
  }, [extinguish]);

  useEffect(() => {
    if (!listening) return;
    let stopped = false;
    let raf = 0;
    let context: AudioContext | null = null;
    let stream: MediaStream | null = null;
    let armed = true;
    let lastUi = 0;

    async function listen() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-mic");
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: true },
          video: false,
        });
        if (stopped) return;
        const Ctx =
          window.AudioContext ??
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!Ctx) throw new Error("no-audio");
        context = new Ctx();
        await context.resume();
        const source = context.createMediaStreamSource(stream);
        const analyser = context.createAnalyser();
        analyser.fftSize = 1024;
        source.connect(analyser);
        const data = new Uint8Array(analyser.fftSize);
        const loop = (time: number) => {
          if (stopped) return;
          analyser.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i += 1) {
            const sample = ((data[i] ?? 128) - 128) / 128;
            sum += sample * sample;
          }
          const rms = Math.sqrt(sum / data.length);
          if (time - lastUi > 100) {
            lastUi = time;
            setLevel(rms);
          }
          if (!doneRef.current && rms > 0.11 && armed) {
            armed = false;
            blowRef.current();
          }
          if (rms < 0.045) armed = true;
          if (doneRef.current) {
            setListening(false);
            return;
          }
          raf = window.requestAnimationFrame(loop);
        };
        raf = window.requestAnimationFrame(loop);
      } catch {
        if (!stopped) {
          setMicFailed(true);
          setListening(false);
        }
      }
    }

    void listen();
    return () => {
      stopped = true;
      window.cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
      void context?.close();
      setLevel(0);
    };
  }, [listening]);

  const status = micFailed ? t(content.cake.micError) : listening ? t(content.cake.listening) : t(content.cake.tapHint);

  return (
    <section className="scene cake-scene">
      <button type="button" className="back" onClick={onBack}>
        ← {t(content.ui.back)}
      </button>
      <p className="kicker">{t(content.cake.kicker)}</p>
      <h1>{t(content.cake.title)}</h1>
      <p className="lede">{t(content.cake.lede)}</p>
      <div className="cake-stage">
        <div className="candle-row">
          {Array.from({ length: count }, (_, index) => {
            const dark = out.includes(index);
            return (
              <button
                key={index}
                type="button"
                className={dark ? "candle is-out" : "candle"}
                onClick={() => extinguish(index)}
                aria-label={fillTemplate(t(dark ? content.ui.candleOut : content.ui.candleOn), { n: index + 1 })}
              >
                <span className="flame" aria-hidden="true">
                  <span className="flame-outer" />
                  <span className="flame-inner" />
                </span>
                {dark && fresh.includes(index) && (
                  <span className="smoke" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                )}
                <span className="stick" aria-hidden="true" />
              </button>
            );
          })}
        </div>
        <CakeArt />
      </div>
      {!allOut && (
        <div className="mic-box">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => {
              setMicFailed(false);
              setListening((value) => !value);
            }}
          >
            {listening ? t(content.cake.micStop) : t(content.cake.mic)}
          </button>
          <p className="hint">{status}</p>
          {listening && (
            <div className="meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.min(1, level * 5)})` }} />
            </div>
          )}
        </div>
      )}
      {allOut && (
        <div className="letter-block">
          <h2>{t(content.cake.letterTitle)}</h2>
          <Typewriter text={t(content.cake.letter)} skip={reduced || arrivedDone} skipLabel={t(content.cake.skip)} />
          <button type="button" className="btn" onClick={onNext}>
            {t(content.cake.next)}
          </button>
        </div>
      )}
      {allOut && !arrivedDone && !reduced && <Confetti />}
    </section>
  );
}

function CakeArt() {
  return (
    <svg className="cake-art" viewBox="0 0 360 320" aria-hidden="true">
      <defs>
        <linearGradient id="spongeTop" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8d4c6" />
          <stop offset="48%" stopColor="#f0b4c4" />
          <stop offset="100%" stopColor="#e094ae" />
        </linearGradient>
        <linearGradient id="spongeBot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3c4b8" />
          <stop offset="100%" stopColor="#d989a4" />
        </linearGradient>
        <linearGradient id="icing" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8fb" />
          <stop offset="100%" stopColor="#f6c5dc" />
        </linearGradient>
        <radialGradient id="underGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(246, 183, 208, 0.75)" />
          <stop offset="70%" stopColor="rgba(212, 196, 246, 0.28)" />
          <stop offset="100%" stopColor="rgba(212, 196, 246, 0)" />
        </radialGradient>
        <linearGradient id="plate" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff8fb" />
          <stop offset="100%" stopColor="#f3d5e4" />
        </linearGradient>
      </defs>
      <ellipse cx="180" cy="286" rx="148" ry="26" fill="url(#underGlow)" />
      <ellipse cx="180" cy="268" rx="136" ry="18" fill="url(#plate)" />
      <ellipse cx="180" cy="262" rx="116" ry="9" fill="#fff4f8" />
      <ellipse cx="180" cy="262" rx="116" ry="9" fill="none" stroke="rgba(231, 183, 196, 0.7)" />

      <path
        d="M48 176 h264 a16 16 0 0 1 16 16 v34 c0 22 -66 34 -148 34 s-148 -12 -148 -34 v-34 a16 16 0 0 1 16 -16z"
        fill="url(#spongeBot)"
      />
      <path d="M64 214 h232" stroke="#e7a0b8" strokeWidth="11" strokeLinecap="round" />
      <path d="M64 214 h232" stroke="#fff4f8" strokeWidth="2.2" strokeLinecap="round" />
      <ellipse cx="64" cy="214" rx="7" ry="5.5" fill="#fff4f8" />
      <path d="M58 214 c-8 10 -2 22 8 18 c6 -8 4 -16 0 -18z" fill="#e7a0b8" />

      <path d="M70 176 c8 22 8 36 16 36 s12 -16 16 -36" fill="url(#icing)" />
      <path d="M118 176 c10 28 12 48 20 48 s12 -22 18 -48" fill="url(#icing)" />
      <path d="M176 178 c8 20 10 34 16 34 s10 -16 16 -34" fill="url(#icing)" />
      <path d="M226 176 c8 26 10 42 18 42 s12 -18 16 -42" fill="url(#icing)" />
      <path d="M274 178 c6 16 8 28 14 28 s8 -12 12 -28" fill="url(#icing)" />
      <ellipse cx="180" cy="176" rx="136" ry="20" fill="url(#icing)" />
      <ellipse cx="180" cy="172" rx="108" ry="10" fill="rgba(255,255,255,0.35)" />

      <path
        d="M96 118 h168 a14 14 0 0 1 14 14 v30 c0 16 -44 26 -98 26 s-98 -10 -98 -26 v-30 a14 14 0 0 1 14 -14z"
        fill="url(#spongeTop)"
      />
      <path d="M112 138 h136" stroke="rgba(255, 236, 214, 0.28)" strokeWidth="4" strokeLinecap="round" />
      <path d="M112 118 c6 18 8 30 14 30 s8 -14 14 -30" fill="url(#icing)" />
      <path d="M156 118 c7 22 9 36 15 36 s9 -16 14 -36" fill="url(#icing)" />
      <path d="M206 120 c6 16 8 28 13 28 s8 -12 12 -28" fill="url(#icing)" />
      <path d="M242 118 c5 14 6 24 11 24 s7 -10 11 -24" fill="url(#icing)" />
      <ellipse cx="180" cy="116" rx="98" ry="18" fill="url(#icing)" />
      <ellipse cx="168" cy="112" rx="62" ry="7" fill="rgba(255,255,255,0.45)" />

      {SPRINKLES.map((bit) => (
        <rect
          key={`${bit.x}-${bit.y}`}
          x={bit.x}
          y={bit.y}
          width="11"
          height="3.2"
          rx="1.4"
          fill={bit.fill}
          transform={`rotate(${bit.rot} ${bit.x + 5} ${bit.y + 1.6})`}
        />
      ))}
      <circle cx="128" cy="108" r="4.2" fill="#d4c4f6" />
      <circle cx="230" cy="112" r="3.4" fill="#fff" />
      <circle cx="206" cy="100" r="3" fill="#c5dff5" />
    </svg>
  );
}

function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const pieces = Array.from({ length: 90 }, () => ({
      x: Math.random(),
      y: -0.1 - Math.random() * 0.4,
      vx: (Math.random() - 0.5) * 0.004,
      vy: 0.003 + Math.random() * 0.004,
      size: 5 + Math.random() * 6,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)] ?? "#fff",
    }));

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (canvas.width !== Math.floor(width * dpr) || canvas.height !== Math.floor(height * dpr)) {
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      let alive = false;
      for (const piece of pieces) {
        piece.x += piece.vx;
        piece.y += piece.vy;
        piece.rot += piece.spin;
        piece.vy += 0.00008;
        if (piece.y < 1.1) alive = true;
        ctx.save();
        ctx.translate(piece.x * width, piece.y * height);
        ctx.rotate(piece.rot);
        ctx.fillStyle = piece.color;
        ctx.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
        ctx.restore();
      }
      if (alive) raf = window.requestAnimationFrame(draw);
    };
    raf = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(raf);
  }, []);

  return <canvas ref={ref} className="confetti" aria-hidden="true" />;
}

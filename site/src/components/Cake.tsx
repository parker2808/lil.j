import { useCallback, useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import type { Progress } from "../types.ts";
import { Typewriter } from "./Typewriter.tsx";

type CakeProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onBack: () => void;
  onNext: () => void;
};

const COLORS = ["#e6c48a", "#efb4c0", "#f7f1e8", "#c4536a", "#f3d48a"];

export function Cake({ progress, update, onBack, onNext }: CakeProps) {
  const reduced = useReducedMotion();
  const count = Math.max(1, Math.min(8, content.cake.candles || 5));
  const out = progress.candlesOut.filter((index) => index >= 0 && index < count);
  const allOut = out.length >= count;
  const [arrivedDone] = useState(allOut);
  const [listening, setListening] = useState(false);
  const [level, setLevel] = useState(0);
  const [micError, setMicError] = useState("");
  const blowRef = useRef<() => void>(() => {});
  const doneRef = useRef(allOut);

  useEffect(() => {
    doneRef.current = allOut;
  }, [allOut]);

  const extinguish = useCallback(
    (index?: number) => {
      update((current) => {
        const existing = current.candlesOut.filter((item) => item >= 0 && item < count);
        const target =
          index ??
          Array.from({ length: count }, (_, item) => item).find((item) => !existing.includes(item));
        if (target === undefined || existing.includes(target)) return current;
        return { ...current, candlesOut: [...existing, target] };
      });
    },
    [count, update],
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
          setMicError(content.cake.micError);
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

  return (
    <section className="scene">
      <button type="button" className="back" onClick={onBack}>
        ← {content.ui.back}
      </button>
      <p className="kicker">{content.cake.kicker}</p>
      <h1>{content.cake.title}</h1>
      <p className="lede">{content.cake.lede}</p>
      <div className="cake-wrap" aria-hidden="false">
        <div className="candles">
          {Array.from({ length: count }, (_, index) => {
            const dark = out.includes(index);
            return (
              <button
                key={index}
                type="button"
                className={dark ? "candle is-out" : "candle"}
                onClick={() => extinguish(index)}
                aria-label={dark ? `Nến ${index + 1} đã tắt` : `Tắt nến ${index + 1}`}
              >
                <span className="flame" />
                <span className="stick" />
              </button>
            );
          })}
        </div>
        <div className="frost" />
        <div className="sponge" />
        <div className="sponge bottom" />
        <div className="plate" />
      </div>
      {!allOut && (
        <div className="mic-box">
          <button
            type="button"
            className="btn btn-gold"
            onClick={() => {
              setMicError("");
              setListening((value) => !value);
            }}
          >
            {listening ? content.cake.micStop : content.cake.mic}
          </button>
          <p className="hint">{micError || (listening ? content.cake.listening : content.cake.tapHint)}</p>
          {listening && (
            <div className="meter" aria-hidden="true">
              <span style={{ transform: `scaleX(${Math.min(1, level * 5)})` }} />
            </div>
          )}
        </div>
      )}
      {allOut && (
        <div className="letter-block">
          <h2>{content.cake.letterTitle}</h2>
          <Typewriter text={content.cake.letter} skip={reduced || arrivedDone} skipLabel={content.cake.skip} />
          <button type="button" className="btn" onClick={onNext}>
            {content.cake.next}
          </button>
        </div>
      )}
      {allOut && !arrivedDone && !reduced && <Confetti />}
    </section>
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

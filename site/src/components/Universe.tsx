import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { STAR_LAYOUT } from "../lib/pure.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Reveal } from "./Reveal.tsx";

type UniverseProps = {
  already: boolean;
  onDone: () => void;
};

export function Universe({ already, onDone }: UniverseProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const instant = already || reduced;
  const [lit, setLit] = useState(instant ? STAR_LAYOUT.length : 0);
  const [draw, setDraw] = useState(instant);
  const [named, setNamed] = useState(instant);
  const lineRef = useRef<SVGPolylineElement>(null);

  useLayoutEffect(() => {
    if (!instant) return;
    onDone();
  }, [instant, onDone]);

  useEffect(() => {
    if (instant) return;
    const timers: number[] = [];
    STAR_LAYOUT.forEach((_, index) => {
      timers.push(window.setTimeout(() => setLit(index + 1), 320 * (index + 1)));
    });
    const after = 320 * STAR_LAYOUT.length + 360;
    timers.push(window.setTimeout(() => setDraw(true), after));
    timers.push(window.setTimeout(() => setNamed(true), after + 2800));
    timers.push(window.setTimeout(() => onDone(), after + 4000));
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [instant, onDone]);

  useEffect(() => {
    const line = lineRef.current;
    if (!line || !draw) return;
    const length = line.getTotalLength();
    line.style.strokeDasharray = `${length}`;
    if (instant) {
      line.style.transition = "none";
      line.style.strokeDashoffset = "0";
      line.style.opacity = "1";
      return;
    }
    line.style.transition = "none";
    line.style.strokeDashoffset = `${length}`;
    line.style.opacity = "1";
    const frame = window.requestAnimationFrame(() => {
      line.style.transition = "stroke-dashoffset 2.6s ease";
      line.style.strokeDashoffset = "0";
    });
    return () => window.cancelAnimationFrame(frame);
  }, [draw, instant]);

  const points = [...STAR_LAYOUT, STAR_LAYOUT[0]].map((star) => `${star.x},${star.y}`).join(" ");

  return (
    <section className="scene universe">
      <p className="kicker">{content.meta.herName}</p>
      <Reveal text={t(content.meta.title)} />
      <p className="lede">{named ? t(content.ui.formed) : t(content.ui.waiting)}</p>
      <div className="sky-map" aria-hidden="true">
        <svg className={draw ? "links is-drawn" : "links"} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {draw && <polyline ref={lineRef} points={points} />}
        </svg>
        {named && <p className="constellation-name">{content.meta.constellationName}</p>}
        {STAR_LAYOUT.map((star, index) => (
          <span
            key={star.id}
            className={index < lit ? "star is-on" : "star"}
            style={{ left: `${star.x}%`, top: `${star.y}%`, ["--delay" as string]: `${index * 0.28}s` }}
          >
            <span className="star-core" />
          </span>
        ))}
      </div>
    </section>
  );
}

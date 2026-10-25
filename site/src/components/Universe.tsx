import { useEffect, useRef } from "react";
import { content } from "../content.ts";
import { clearProgress } from "../lib/progress.ts";
import { fillTemplate, STAR_LAYOUT } from "../lib/pure.ts";
import type { Progress } from "../types.ts";

type UniverseProps = {
  progress: Progress;
  onOpenStar: (id: string) => void;
  onCake: () => void;
  onLetters: () => void;
  onFinale: () => void;
};

export function Universe({ progress, onOpenStar, onCake, onLetters, onFinale }: UniverseProps) {
  const lineRef = useRef<SVGPolylineElement>(null);
  const played = useRef(false);
  const chapters = STAR_LAYOUT.map((star) => {
    const chapter = content.chapters.find((item) => item.id === star.id);
    return { ...star, chapter };
  }).filter((star) => star.chapter);
  const opened = progress.openedChapters;
  const total = STAR_LAYOUT.length;
  const count = STAR_LAYOUT.filter((star) => opened.includes(star.id)).length;
  const complete = count === total;
  const points = [...STAR_LAYOUT, STAR_LAYOUT[0]]
    .map((star) => `${star?.x ?? 0},${star?.y ?? 0}`)
    .join(" ");

  useEffect(() => {
    const line = lineRef.current;
    if (!line || !complete) return;
    const length = line.getTotalLength();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    line.style.strokeDasharray = `${length}`;
    if (played.current || reduce) {
      line.style.transition = "none";
      line.style.strokeDashoffset = "0";
      line.style.opacity = "1";
      played.current = true;
      return;
    }
    played.current = true;
    line.style.transition = "none";
    line.style.strokeDashoffset = `${length}`;
    line.style.opacity = "1";
    const frame = window.requestAnimationFrame(() => {
      line.style.transition = "stroke-dashoffset 2.6s ease";
      line.style.strokeDashoffset = "0";
    });
    return () => window.cancelAnimationFrame(frame);
  }, [complete]);

  function reset() {
    if (window.confirm(content.ui.resetConfirm)) {
      clearProgress();
      window.location.reload();
    }
  }

  return (
    <section className="scene universe">
      <p className="kicker">{content.meta.herName}</p>
      <h1>{content.meta.title}</h1>
      <p className="lede">{complete ? content.ui.formed : content.ui.waiting}</p>
      <p className="count">{fillTemplate(content.ui.lit, { n: count })}</p>
      <div className="sky-map">
        <svg className="links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {complete && <polyline ref={lineRef} points={points} />}
        </svg>
        {complete && <p className="constellation-name">{content.meta.constellationName}</p>}
        {chapters.map((star, index) => {
          const isOn = opened.includes(star.id);
          const title = star.chapter?.title ?? star.id;
          return (
            <button
              key={star.id}
              type="button"
              className={isOn ? "star is-on" : "star"}
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                ["--delay" as string]: `${index * 0.28}s`,
              }}
              onClick={() => onOpenStar(star.id)}
              aria-label={`${title}, ${isOn ? content.ui.starOpened : content.ui.starClosed}`}
            >
              <span className="star-core" />
              <span className="star-label">{star.chapter?.star}</span>
            </button>
          );
        })}
      </div>
      {complete && (
        <div className="doors">
          <button type="button" className="btn" onClick={onCake}>
            {content.ui.doorCake}
          </button>
          <button type="button" className="btn" onClick={onLetters}>
            {content.ui.doorLetters}
          </button>
          <button type="button" className="btn btn-gold" onClick={onFinale}>
            {content.ui.doorFinale}
          </button>
        </div>
      )}
      <button type="button" className="reset" onClick={reset}>
        {content.ui.reset}
      </button>
    </section>
  );
}

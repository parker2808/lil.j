import { useMemo, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate, formatZoned } from "../lib/pure.ts";
import { CATALOG, CONSTELLATIONS, projectSky, starRadius } from "../lib/stars.ts";
import { Reveal } from "./Reveal.tsx";

type BirthSkyProps = {
  onSeen: () => void;
};

const HERO_ID = "sco";

const HERO = layoutGroup(HERO_ID, 12, 48, 32, 36, 1.15);

/** Real stick-figures, parked in separate slots so the birthday sky stays readable. */
const NOTE_SLOTS: Record<string, [number, number, number, number]> = {
  cas: [32, 6, 30, 14],
  lyr: [68, 12, 22, 16],
  aql: [8, 24, 18, 14],
  cyg: [54, 34, 28, 26],
};

function layoutGroup(
  id: string,
  x0: number,
  y0: number,
  w: number,
  h: number,
  scale = 1,
): {
  stars: { id: string; x: number; y: number; r: number }[];
  lines: { x1: number; y1: number; x2: number; y2: number }[];
} {
  const stars = CATALOG.filter((star) => star.group === id);
  const ras = stars.map((star) => star.ra);
  const decs = stars.map((star) => star.dec);
  const minRa = Math.min(...ras);
  const maxRa = Math.max(...ras);
  const minDec = Math.min(...decs);
  const maxDec = Math.max(...decs);
  const spanRa = maxRa - minRa || 1;
  const spanDec = maxDec - minDec || 1;
  const placed = stars.map((star) => ({
    id: star.id,
    x: stars.length === 1 ? x0 + w / 2 : x0 + ((star.ra - minRa) / spanRa) * w,
    y: stars.length === 1 ? y0 + h / 2 : y0 + ((maxDec - star.dec) / spanDec) * h,
    r: starRadius(star.mag) * scale,
  }));
  const byId = new Map(placed.map((star) => [star.id, star]));
  const lines = (CONSTELLATIONS.find((item) => item.id === id)?.lines ?? []).flatMap(([from, to]) => {
    const start = byId.get(from);
    const end = byId.get(to);
    if (!start || !end) return [];
    return [{ x1: start.x, y1: start.y, x2: end.x, y2: end.y }];
  });
  return { stars: placed, lines };
}

export function BirthSky({ onSeen }: BirthSkyProps) {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const [opened, setOpened] = useState<string[]>([]);
  const when = useMemo(() => new Date(content.birth.when), []);
  const sky = useMemo(
    () => projectSky(content.birth.lat, content.birth.lon, when, content.constellations),
    [when],
  );
  const noteIds = content.birth.notes.map((note) => note.id);
  const visibleNotes = noteIds.filter((id) => sky.labels.some((label) => label.id === id));
  const shown = new Set(visibleNotes);
  const figures = visibleNotes.flatMap((id) => {
    const slot = NOTE_SLOTS[id];
    if (!slot) return [];
    return [{ id, ...layoutGroup(id, slot[0], slot[1], slot[2], slot[3]) }];
  });
  const formatted = formatZoned(content.birth.when, locale);
  const caption = fillTemplate(t(content.birth.caption), {
    when: formatted,
    place: t(content.birth.place),
  });
  const progress = fillTemplate(t(content.birth.progress), {
    n: opened.length,
    total: visibleNotes.length,
  });
  const note = content.birth.notes.find((item) => item.id === active) ?? null;
  const label = sky.labels.find((item) => item.id === active) ?? null;
  const heroName = t(content.constellations[HERO_ID] ?? { vi: HERO_ID, en: HERO_ID });
  const heroTop = Math.min(...HERO.stars.map((star) => star.y));
  const heroX = HERO.stars.reduce((sum, star) => sum + star.x, 0) / HERO.stars.length;
  const heroY = HERO.stars.reduce((sum, star) => sum + star.y, 0) / HERO.stars.length;

  function select(id: string) {
    setActive(id);
    if (!shown.has(id) || opened.includes(id)) return;
    const next = [...opened, id];
    setOpened(next);
    if (next.length >= visibleNotes.length) onSeen();
  }

  return (
    <section className="scene birth-scene">
      <p className="kicker">{t(content.birth.kicker)}</p>
      <Reveal text={t(content.birth.title)} />
      <p className="lede">{t(content.birth.lede)}</p>
      <div className="birth-chips">
        <p className="birth-caption">{caption}</p>
        <p className="birth-progress" aria-live="polite">
          {progress}
        </p>
      </div>
      <div className="chart">
        <svg viewBox="0 0 100 100" role="img" aria-label={t(content.birth.title)}>
          <defs>
            <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,244,250,0.16)" />
              <stop offset="72%" stopColor="rgba(255,244,250,0.04)" />
              <stop offset="100%" stopColor="rgba(255,244,250,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" className="chart-ring" fill="url(#chartGlow)" />
          {HERO.lines.map((line, index) => (
            <line
              key={`hero-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={active === HERO_ID ? "chart-line is-hero is-hot" : "chart-line is-hero"}
            />
          ))}
          {figures.flatMap((figure) =>
            figure.lines.map((line, index) => (
              <line
                key={`${figure.id}-${index}`}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className={figure.id === active ? "chart-line is-hot" : "chart-line"}
              />
            )),
          )}
          {HERO.stars.map((star) => (
            <circle
              key={star.id}
              cx={star.x}
              cy={star.y}
              r={star.r}
              className={active === HERO_ID ? "chart-star is-hero is-hot" : "chart-star is-hero"}
            />
          ))}
          {figures.flatMap((figure) =>
            figure.stars.map((star) => (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={star.r}
                className={
                  figure.id === active
                    ? "chart-star is-hot"
                    : opened.includes(figure.id)
                      ? "chart-star"
                      : "chart-star is-hint"
                }
              />
            )),
          )}
        </svg>
        <button
          type="button"
          className={active === HERO_ID ? "constellation-hit is-on" : "constellation-hit"}
          style={{ left: `${heroX}%`, top: `${heroY}%` }}
          aria-label={`${heroName}. ${t(content.birth.sign)}`}
          onClick={() => select(HERO_ID)}
        />
        <p className="chart-hero-name" style={{ left: `${heroX}%`, top: `${heroTop}%` }}>
          <span>{heroName}</span>
          <small>{t(content.birth.sign)}</small>
        </p>
        {figures.map((figure) => {
          const unread = !opened.includes(figure.id);
          const x = figure.stars.reduce((sum, star) => sum + star.x, 0) / figure.stars.length;
          const y = figure.stars.reduce((sum, star) => sum + star.y, 0) / figure.stars.length;
          const name = sky.labels.find((item) => item.id === figure.id);
          return (
            <button
              key={figure.id}
              type="button"
              className={
                figure.id === active
                  ? "constellation-hit is-on"
                  : unread
                    ? "constellation-hit is-hint"
                    : "constellation-hit"
              }
              style={{ left: `${x}%`, top: `${y}%` }}
              aria-label={t(content.birth.notes.find((noteItem) => noteItem.id === figure.id)?.title ?? name?.name)}
              onClick={() => select(figure.id)}
            />
          );
        })}
      </div>
      {active === HERO_ID ? (
        <article className="star-note chart-float">
          <p className="kicker">{t(content.birth.sign)}</p>
          <h2>{heroName}</h2>
        </article>
      ) : note ? (
        <article className="star-note chart-float">
          <p className="kicker">{label ? t(label.name) : ""}</p>
          <h2>{t(note.title)}</h2>
          <p>{t(note.body)}</p>
        </article>
      ) : null}
    </section>
  );
}

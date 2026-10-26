import { useMemo, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fillTemplate, formatZoned } from "../lib/pure.ts";
import { projectSky, starRadius, type SkyLabel } from "../lib/stars.ts";
import { Reveal } from "./Reveal.tsx";

type BirthSkyProps = {
  onSeen: () => void;
};

const HUES = ["#fff7fb", "#f7c6dc", "#d7c6f6", "#c9e2f8", "#f8d4c6"];

export function BirthSky({ onSeen }: BirthSkyProps) {
  const { t, locale } = useI18n();
  const [active, setActive] = useState<string | null>(null);
  const when = useMemo(() => new Date(content.birth.when), []);
  const sky = useMemo(() => projectSky(content.birth.lat, content.birth.lon, when), [when]);
  const formatted = formatZoned(content.birth.when, locale);
  const caption = fillTemplate(t(content.birth.caption), {
    when: formatted,
    place: t(content.birth.place),
  });
  const label = sky.labels.find((item) => item.id === active) ?? null;

  function select(item: SkyLabel) {
    setActive(item.id);
    onSeen();
  }

  const compass = [
    { key: "n", text: t(content.birth.north), x: 50, y: 11 },
    { key: "e", text: t(content.birth.east), x: 90, y: 52 },
    { key: "s", text: t(content.birth.south), x: 50, y: 92 },
    { key: "w", text: t(content.birth.west), x: 10, y: 52 },
  ];

  return (
    <section className="scene birth-scene">
      <p className="kicker">{t(content.birth.kicker)}</p>
      <Reveal text={t(content.birth.title)} />
      <p className="lede">{t(content.birth.lede)}</p>
      <p className="birth-caption">{caption}</p>
      <div className="chart">
        <svg viewBox="0 0 100 100" role="img" aria-label={t(content.birth.title)}>
          <defs>
            <radialGradient id="chartGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,244,250,0.18)" />
              <stop offset="72%" stopColor="rgba(255,244,250,0.04)" />
              <stop offset="100%" stopColor="rgba(255,244,250,0)" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="50" r="46" className="chart-ring" fill="url(#chartGlow)" />
          {sky.lines.map((line, index) => (
            <line
              key={`${line.group}-${index}`}
              x1={line.x1}
              y1={line.y1}
              x2={line.x2}
              y2={line.y2}
              className={line.group === active ? "chart-line is-hot" : "chart-line"}
            />
          ))}
          {sky.stars
            .filter((star) => star.visible)
            .map((star, index) => (
              <circle
                key={star.id}
                cx={star.x}
                cy={star.y}
                r={starRadius(star.mag)}
                fill={HUES[index % HUES.length]}
                className={star.group === active ? "chart-star is-hot" : "chart-star"}
                style={{ animationDelay: `${(index % 8) * 0.28}s` }}
              />
            ))}
          {compass.map((mark) => (
            <text key={mark.key} x={mark.x} y={mark.y} className="chart-compass" textAnchor="middle">
              {mark.text}
            </text>
          ))}
        </svg>
        {sky.labels.map((item) => (
          <button
            key={item.id}
            type="button"
            className={item.id === active ? "constellation-hit is-on" : "constellation-hit"}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-label={t(item.name)}
            onClick={() => select(item)}
            onPointerEnter={(event) => {
              if (event.pointerType === "mouse") select(item);
            }}
          />
        ))}
        {label && (
          <p
            className="chart-float"
            style={{ left: `${Math.min(78, Math.max(22, label.x))}%`, top: `${Math.max(14, Math.min(86, label.y - 6))}%` }}
          >
            {t(label.name)}
          </p>
        )}
      </div>
      <p className="constellation-caption" aria-live="polite">
        {label ? t(label.name) : "\u00a0"}
      </p>
    </section>
  );
}

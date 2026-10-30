import { LogoMark } from "./LogoMark.tsx";
import { useEffect, useMemo, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fadeMusic } from "../lib/music.ts";
import { formatDotted } from "../lib/pure.ts";
import { CATALOG, CONSTELLATIONS, starRadius } from "../lib/stars.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Petals, StarFall } from "./Fireworks.tsx";
import { Reveal } from "./Reveal.tsx";

type FinalLetterProps = {
  already: boolean;
  onDone: () => void;
  onRestart: () => void;
};

type Token = { text: string; kind: "word" | "char" | "space" | "para" | "line" };

export function FinalLetter({ already, onDone, onRestart }: FinalLetterProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const text = t(content.finalLetter.body);
  const tokens = useMemo(() => tokenize(text), [text]);
  const [shown, setShown] = useState(0);
  const [replay, setReplay] = useState(false);
  const caretRef = useRef<HTMLSpanElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const skipAll = ((already && !replay) || reduced) && shown === 0;
  const count = skipAll ? tokens.length : shown;
  const done = count >= tokens.length;
  const dateLabel = formatDotted(content.finalLetter.date, t(content.ui.dottedDate));

  useEffect(() => {
    fadeMusic(8000);
  }, []);

  useEffect(() => {
    if (done) {
      onDone();
      return;
    }
    const delay = delayFor(tokens[count]);
    const timer = window.setTimeout(() => setShown((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [count, done, onDone, tokens]);

  useEffect(() => {
    if (!done) return;
    const stage = endRef.current?.closest(".stage");
    const end = endRef.current;
    if (!(stage instanceof HTMLElement) || !end) return;
    const endBox = end.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const limit = stageBox.bottom - 56;
    if (endBox.bottom > limit) stage.scrollTop += endBox.bottom - limit;
  }, [done]);

  useEffect(() => {
    if (done || reduced) return;
    const caret = caretRef.current;
    const stage = caret?.closest(".stage");
    if (!caret || !(stage instanceof HTMLElement)) return;
    const caretBox = caret.getBoundingClientRect();
    const stageBox = stage.getBoundingClientRect();
    const limit = stageBox.top + stageBox.height * 0.62;
    if (caretBox.bottom > limit) {
      stage.scrollTo({ top: stage.scrollTop + caretBox.bottom - limit, behavior: "smooth" });
    }
  }, [count, done, reduced]);

  function skip() {
    setReplay(true);
    setShown(tokens.length);
  }

  return (
    <section className="scene letter-scene">
      {done && <StarFall />}
      <p className="kicker">{t(content.finalLetter.kicker)}</p>
      <Reveal text={t(content.finalLetter.title)} />
      <p className="lede">{t(content.finalLetter.lede)}</p>
      <article
        className="hand-sheet"
        aria-live="polite"
        onClick={() => {
          if (!done) skip();
        }}
      >
        <header className="letter-head">
          <time className="letter-date" dateTime={content.finalLetter.date}>
            {dateLabel}
          </time>
          <span className="letter-seal" aria-hidden="true">
            <LogoMark />
          </span>
        </header>
        <div className="letter-body">
          {tokens.slice(0, count).map((token, index) => {
            if (token.kind === "para") return <span key={`p-${index}`} className="ink-break" />;
            if (token.kind === "line") return <span key={`l-${index}`} className="ink-line" />;
            if (token.kind === "space") return <span key={`s-${index}`}>{token.text}</span>;
            return (
              <span key={`w-${index}`} className="ink-word">
                {token.text}
              </span>
            );
          })}
          {!done && <span ref={caretRef} className="ink-caret" aria-hidden="true" />}
        </div>
        {done && <p className="letter-sign">{t(content.finalLetter.signature)}</p>}
        {done && <ClosingConstellation />}
      </article>
      {!done && (
        <button type="button" className="btn btn-quiet" onClick={skip}>
          {t(content.finalLetter.skip)}
        </button>
      )}
      {done && <Petals />}
      {done && (
        <div className="letter-actions" ref={endRef}>
          <p className="letter-close">{t(content.finalLetter.closing)}</p>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setReplay(true);
              setShown(0);
            }}
          >
            {t(content.finalLetter.replay)}
          </button>
          <button type="button" className="btn btn-quiet start-over" onClick={onRestart}>
            {t(content.ui.startOver)}
          </button>
        </div>
      )}
    </section>
  );
}

function ClosingConstellation() {
  const { t } = useI18n();
  const figure = useMemo(() => layoutScorpio(), []);
  const name = t(content.constellations.sco);
  return (
    <figure className="letter-constellation">
      <svg viewBox="0 0 100 100" role="img" aria-label={name}>
        {figure.lines.map((line, index) => (
          <line key={`${line.x1}-${index}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
        {figure.stars.map((star) => (
          <circle key={star.id} cx={star.x} cy={star.y} r={star.r} />
        ))}
      </svg>
      <figcaption>{name}</figcaption>
    </figure>
  );
}

function layoutScorpio(): {
  stars: { id: string; x: number; y: number; r: number }[];
  lines: { x1: number; y1: number; x2: number; y2: number }[];
} {
  const stars = CATALOG.filter((star) => star.group === "sco");
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
    x: 8 + ((star.ra - minRa) / spanRa) * 84,
    y: 8 + ((maxDec - star.dec) / spanDec) * 84,
    r: starRadius(star.mag) * 1.35,
  }));
  const byId = new Map(placed.map((star) => [star.id, star]));
  const lines = (CONSTELLATIONS.find((item) => item.id === "sco")?.lines ?? []).flatMap(([from, to]) => {
    const start = byId.get(from);
    const end = byId.get(to);
    if (!start || !end) return [];
    return [{ x1: start.x, y1: start.y, x2: end.x, y2: end.y }];
  });
  return { stars: placed, lines };
}

function tokenize(body: string): Token[] {
  const lines = body.split("\n");
  const tokens: Token[] = [];
  lines.forEach((line, index) => {
    if (!line.trim()) {
      tokens.push({ text: "", kind: "para" });
      return;
    }
    const glyphs = [...line];
    if (glyphs.length <= 28) {
      glyphs.forEach((glyph) => {
        tokens.push({ text: glyph, kind: glyph.trim() ? "char" : "space" });
      });
    } else {
      line.split(/(\s+)/).filter(Boolean).forEach((part) => {
        tokens.push({ text: part, kind: part.trim() ? "word" : "space" });
      });
    }
    const next = lines[index + 1];
    if (next?.trim()) tokens.push({ text: "", kind: "line" });
  });
  return tokens;
}

function delayFor(token: Token | undefined): number {
  if (!token) return 48;
  if (token.kind === "para") return 320;
  if (token.kind === "line") return 90;
  if (token.kind === "space") return 18;
  const pause = /[.!?…]$/.test(token.text) ? 200 : /[,;:]$/.test(token.text) ? 100 : 0;
  const base = token.kind === "char" ? 46 : 50 + (token.text.length % 3) * 6;
  return base + pause;
}

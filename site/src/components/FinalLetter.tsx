import { useEffect, useMemo, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fadeMusic } from "../lib/music.ts";
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
  const dateLabel = formatBirth(content.birth.when);

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
          <time className="letter-date" dateTime={content.birth.when.slice(0, 10)}>
            {dateLabel}
          </time>
          <span className="letter-seal" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M12 3.2 13.8 8.6 19.4 9.1 15.2 12.8 16.5 18.2 12 15.4 7.5 18.2 8.8 12.8 4.6 9.1 10.2 8.6Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
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
        {done && (
          <svg className="letter-sign" viewBox="0 0 168 70" aria-hidden="true">
            <path d="M10 58 L30 16 L50 58 M18 42 H42" />
            <path d="M66 58 V34 C66 20 98 18 100 36 V58" />
            <path d="M118 14 V58 M118 38 C118 22 156 20 158 40 V58" />
          </svg>
        )}
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

function formatBirth(when: string): string {
  const [year, month, day] = when.slice(0, 10).split("-");
  if (!year || !month || !day) return when.slice(0, 10);
  return `${day}.${month}.${year}`;
}

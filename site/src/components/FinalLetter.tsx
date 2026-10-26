import { useEffect, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { fadeMusic } from "../lib/music.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Petals, StarFall } from "./Fireworks.tsx";
import { Reveal } from "./Reveal.tsx";

type FinalLetterProps = {
  already: boolean;
  onDone: () => void;
};

export function FinalLetter({ already, onDone }: FinalLetterProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const text = t(content.finalLetter.body);
  const lines = text.split("\n");
  const [shown, setShown] = useState(already || reduced ? lines.length : 0);
  const done = shown >= lines.length;

  useEffect(() => {
    fadeMusic(8000);
  }, []);

  useEffect(() => {
    const parts = text.split("\n");
    if (shown >= parts.length) {
      onDone();
      return;
    }
    const line = parts[shown] ?? "";
    const delay = reduced ? 0 : line.trim() ? 760 : 280;
    const timer = window.setTimeout(() => setShown((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [onDone, reduced, shown, text]);

  return (
    <section className="scene letter-scene">
      <StarFall />
      <p className="kicker">{t(content.finalLetter.kicker)}</p>
      <Reveal text={t(content.finalLetter.title)} />
      <p className="lede">{t(content.finalLetter.lede)}</p>
      <div className="hand-sheet" aria-live="polite">
        {lines.slice(0, shown).map((line, index) => (
          <p key={`${index}-${line}`} className={line.trim() ? "hand-line is-ink" : "hand-line is-blank"}>
            {line.trim() ? line : "\u00a0"}
          </p>
        ))}
      </div>
      {!done && (
        <button type="button" className="btn btn-quiet" onClick={() => setShown(lines.length)}>
          {t(content.finalLetter.skip)}
        </button>
      )}
      {done && <Petals />}
      {done && (
        <>
          <p className="letter-close">{t(content.finalLetter.closing)}</p>
          <button type="button" className="btn" onClick={() => setShown(0)}>
            {t(content.finalLetter.replay)}
          </button>
        </>
      )}
    </section>
  );
}

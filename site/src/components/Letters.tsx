import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { content } from "../content.ts";
import { skipAhead } from "../lib/progress.ts";
import { useI18n } from "../lib/locale-context.ts";
import { todayKey } from "../lib/pure.ts";
import type { Progress } from "../types.ts";
import { Reveal } from "./Reveal.tsx";

type LettersProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onSheet?: (open: boolean) => void;
};

export function Letters({ progress, update, onSheet }: LettersProps) {
  const { t } = useI18n();
  const today = todayKey();
  const [openId, setOpenId] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const active = content.openWhen.find((letter) => letter.id === openId) ?? null;

  useEffect(() => {
    onSheet?.(Boolean(active));
    if (!active) return () => onSheet?.(false);
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      onSheet?.(false);
    };
  }, [active, onSheet]);

  function openLetter(id: string) {
    update((current) => {
      if (current.openWhen[id] === today) return current;
      return { ...current, openWhen: { ...current.openWhen, [id]: today } };
    });
    setOpenId(id);
  }

  return (
    <section className="scene letters-scene">
      <p className="kicker">{t(content.lettersCopy.kicker)}</p>
      <Reveal text={t(content.lettersCopy.title)} />
      <p className="lede">{t(content.lettersCopy.lede)}</p>
      <button type="button" className="btn btn-quiet later" onClick={() => update((current) => skipAhead(current, "letters"))}>
        {t(content.lettersCopy.later)}
      </button>
      <div className="seal-grid">
        {content.openWhen.map((letter) => {
          const seen = Boolean(progress.openWhen[letter.id]);
          return (
            <button
              key={letter.id}
              type="button"
              className={seen ? "seal-card is-read" : "seal-card"}
              onClick={() => openLetter(letter.id)}
            >
              <span className="mini-env" aria-hidden="true">
                <span className="mini-flap" />
                {seen && <span className="mini-seal">{content.meta.monogram}</span>}
              </span>
              <span className="seal-label">{t(letter.label)}</span>
            </button>
          );
        })}
      </div>
      {active &&
        createPortal(
          <div className="sheet-backdrop" onClick={() => setOpenId(null)}>
            <div
              className="sheet"
              role="dialog"
              aria-modal="true"
              aria-labelledby="sheet-title"
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="sheet-title">{t(active.label)}</h2>
              <p className="ow-body">{t(active.body)}</p>
              <p className="sheet-note">{t(content.lettersCopy.openedNote)}</p>
              <button ref={closeRef} type="button" className="btn btn-gold" onClick={() => setOpenId(null)}>
                {t(content.lettersCopy.close)}
              </button>
            </div>
          </div>,
          document.body,
        )}
    </section>
  );
}

import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { todayKey } from "../lib/pure.ts";
import type { Progress } from "../types.ts";

type LettersProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onBack: () => void;
  onNext: () => void;
};

export function Letters({ progress, update, onBack, onNext }: LettersProps) {
  const { t } = useI18n();
  const today = todayKey();

  function openLetter(id: string) {
    update((current) => {
      if (current.openWhen[id] === today) return current;
      return { ...current, openWhen: { ...current.openWhen, [id]: today } };
    });
  }

  return (
    <section className="scene">
      <button type="button" className="back" onClick={onBack}>
        ← {t(content.ui.back)}
      </button>
      <p className="kicker">{t(content.lettersCopy.kicker)}</p>
      <h1>{t(content.lettersCopy.title)}</h1>
      <p className="lede">{t(content.lettersCopy.lede)}</p>
      <div className="letter-box">
        {content.openWhen.map((letter) => {
          const open = progress.openWhen[letter.id] === today;
          return (
            <article key={letter.id} className={open ? "ow is-open" : "ow"}>
              <h2>{t(letter.label)}</h2>
              {open ? (
                <>
                  <p className="ow-body">{t(letter.body)}</p>
                  <p className="hint">{t(content.lettersCopy.openedNote)}</p>
                </>
              ) : (
                <button type="button" className="wax wax-small" onClick={() => openLetter(letter.id)}>
                  <span aria-hidden="true">{content.meta.monogram}</span>
                  <span className="sr-only">
                    {t(letter.label)}. {t(content.lettersCopy.sealed)}
                  </span>
                </button>
              )}
              {!open && <p className="hint">{t(content.lettersCopy.sealed)}</p>}
            </article>
          );
        })}
      </div>
      <button type="button" className="btn" onClick={onNext}>
        {t(content.lettersCopy.next)}
      </button>
    </section>
  );
}

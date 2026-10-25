import { content } from "../content.ts";
import { todayKey } from "../lib/pure.ts";
import type { Progress } from "../types.ts";

type LettersProps = {
  progress: Progress;
  update: (recipe: (progress: Progress) => Progress) => void;
  onBack: () => void;
  onNext: () => void;
};

export function Letters({ progress, update, onBack, onNext }: LettersProps) {
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
        ← {content.ui.back}
      </button>
      <p className="kicker">{content.lettersCopy.kicker}</p>
      <h1>{content.lettersCopy.title}</h1>
      <p className="lede">{content.lettersCopy.lede}</p>
      <div className="letter-box">
        {content.openWhen.map((letter) => {
          const open = progress.openWhen[letter.id] === today;
          return (
            <article key={letter.id} className={open ? "ow is-open" : "ow"}>
              <h2>{letter.label}</h2>
              {open ? (
                <>
                  <p className="ow-body">{letter.body}</p>
                  <p className="hint">{content.lettersCopy.openedNote}</p>
                </>
              ) : (
                <button type="button" className="wax wax-small" onClick={() => openLetter(letter.id)}>
                  <span aria-hidden="true">{content.meta.monogram}</span>
                  <span className="sr-only">
                    {letter.label}. {content.lettersCopy.sealed}
                  </span>
                </button>
              )}
              {!open && <p className="hint">{content.lettersCopy.sealed}</p>}
            </article>
          );
        })}
      </div>
      <button type="button" className="btn" onClick={onNext}>
        {content.lettersCopy.next}
      </button>
    </section>
  );
}

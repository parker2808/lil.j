import { useEffect, useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { nicknamesMatch } from "../lib/pure.ts";
import { Reveal } from "./Reveal.tsx";

type GateProps = {
  onUnlock: () => void;
};

export function Gate({ onUnlock }: GateProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const [shaking, setShaking] = useState(false);
  const [empty, setEmpty] = useState(false);
  const hint = hintIndex >= 0 ? content.gate.hints[hintIndex % content.gate.hints.length] : undefined;

  useEffect(() => {
    if (!shaking) return;
    const timer = window.setTimeout(() => setShaking(false), 480);
    return () => window.clearTimeout(timer);
  }, [shaking]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!value.trim()) {
      setEmpty(true);
      setShaking(true);
      return;
    }
    setEmpty(false);
    if (nicknamesMatch(value, content.gate.password)) {
      onUnlock();
      return;
    }
    setHintIndex((index) => index + 1);
    setShaking(true);
  }

  return (
    <section className="gate">
      <p className="kicker">{t(content.meta.title)}</p>
      <div className="gate-mark" aria-hidden="true">
        <span className="gate-orbit">
          <span className="gate-ring" />
          <span className="gate-spin">
            <span className="gate-star" />
          </span>
        </span>
        <span className="gate-moon">
          <svg viewBox="0 0 72 72">
            <path d="M28 16 V42 Q28 54 46 54" />
            <circle cx="28" cy="16" r="2.4" />
            <circle cx="28" cy="32" r="1.6" />
            <circle cx="34" cy="48" r="1.6" />
            <circle cx="46" cy="54" r="2.4" />
          </svg>
        </span>
      </div>
      <Reveal text={t(content.gate.question)} />
      <form onSubmit={onSubmit} className={shaking ? "gate-form shake" : "gate-form"}>
        <div className="gate-field">
          <label>
            <input
              id="nickname"
              value={value}
              placeholder=" "
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              onChange={(event) => setValue(event.target.value)}
            />
            <span>{t(content.gate.placeholder)}</span>
          </label>
          <button
            type="submit"
            className="gate-go"
            aria-label={t(content.gate.submit)}
            onPointerDown={(event) => event.preventDefault()}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M4 10h11M11 5l5 5-5 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
      <p className="hint" role="status">
        {empty ? t(content.gate.empty) : t(hint)}
      </p>
    </section>
  );
}

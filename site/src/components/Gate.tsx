import { useEffect, useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { nicknamesMatch } from "../lib/pure.ts";

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
      <div className="monogram-orb" aria-hidden="true">
        {content.meta.monogram}
      </div>
      <h1>{t(content.gate.question)}</h1>
      <form onSubmit={onSubmit} className={shaking ? "gate-card shake" : "gate-card"}>
        <label className="field">
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
        <button type="submit" className="btn btn-gold">
          {t(content.gate.submit)}
        </button>
      </form>
      <p className="hint" role="status">
        {empty ? t(content.gate.empty) : t(hint)}
      </p>
    </section>
  );
}

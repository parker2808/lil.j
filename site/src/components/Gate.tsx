import { useEffect, useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { nicknamesMatch } from "../lib/pure.ts";

type GateProps = {
  onUnlock: () => void;
};

export function Gate({ onUnlock }: GateProps) {
  const [value, setValue] = useState("");
  const [hintIndex, setHintIndex] = useState(-1);
  const [shaking, setShaking] = useState(false);
  const [empty, setEmpty] = useState(false);
  const hint = hintIndex >= 0 ? content.gate.hints[hintIndex % content.gate.hints.length] : "";

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
      <p className="kicker">{content.meta.title}</p>
      <h1>{content.gate.question}</h1>
      <form onSubmit={onSubmit} className={shaking ? "shake" : undefined}>
        <label className="sr-only" htmlFor="nickname">
          {content.gate.placeholder}
        </label>
        <input
          id="nickname"
          className="line-input"
          value={value}
          placeholder={content.gate.placeholder}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="go"
          onChange={(event) => setValue(event.target.value)}
        />
        <button type="submit" className="btn btn-gold">
          {content.gate.submit}
        </button>
      </form>
      <p className="hint" role="status">
        {empty ? content.gate.empty : hint}
      </p>
      <p className="seal-caption">{content.envelope.sealCaption}</p>
    </section>
  );
}

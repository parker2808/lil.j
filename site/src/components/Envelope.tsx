import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Hearts } from "./Hearts.tsx";

type EnvelopeProps = {
  open: boolean;
  onOpen: () => void;
};

export function Envelope({ open, onOpen }: EnvelopeProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const [cracking, setCracking] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function crack() {
    if (open || cracking) return;
    if (reduced) {
      onOpen();
      return;
    }
    setCracking(true);
    timer.current = window.setTimeout(onOpen, 480);
  }

  return (
    <section className="scene envelope-scene">
      <Hearts active={open} />
      <p className="kicker">{t(content.meta.title)}</p>
      <p className="seal-caption">{t(content.envelope.sealCaption)}</p>
      <div className={open ? "envelope is-open" : "envelope"}>
        <div className="env-pocket">
          <div className="env-paper" aria-hidden={!open}>
            <p className="greet">{t(content.envelope.greeting)}</p>
            <p>{t(content.envelope.body)}</p>
          </div>
          <div className="env-front" />
          <div className="env-flap" />
          {!open && (
            <button type="button" className={cracking ? "wax is-crack" : "wax"} onClick={crack} disabled={cracking}>
              <span aria-hidden="true">{content.meta.monogram}</span>
              <span className="sr-only">{t(content.envelope.openHint)}</span>
            </button>
          )}
        </div>
      </div>
      {!open && <p className="hint">{t(content.envelope.openHint)}</p>}
    </section>
  );
}

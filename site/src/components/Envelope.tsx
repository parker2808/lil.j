import { content } from "../content.ts";
import { Hearts } from "./Hearts.tsx";

type EnvelopeProps = {
  open: boolean;
  onOpen: () => void;
  onEnter: () => void;
};

export function Envelope({ open, onOpen, onEnter }: EnvelopeProps) {
  return (
    <section className="scene envelope-scene">
      <Hearts active={open} />
      <p className="kicker">{content.meta.title}</p>
      <p className="seal-caption">{content.envelope.sealCaption}</p>
      <div className={open ? "envelope is-open" : "envelope"}>
        <div className="env-pocket">
          <div className="env-paper" aria-hidden={!open}>
            <p className="greet">{content.envelope.greeting}</p>
            <p>{content.envelope.body}</p>
            {open && (
              <button type="button" className="btn btn-gold" onClick={onEnter}>
                {content.envelope.enter}
              </button>
            )}
          </div>
          <div className="env-front" />
          <div className="env-flap" />
          {!open && (
            <button type="button" className="wax" onClick={onOpen}>
              <span aria-hidden="true">{content.meta.monogram}</span>
              <span className="sr-only">{content.envelope.openHint}</span>
            </button>
          )}
        </div>
      </div>
      {!open && <p className="hint">{content.envelope.openHint}</p>}
    </section>
  );
}

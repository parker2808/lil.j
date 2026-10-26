import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { Hearts } from "./Hearts.tsx";

type EnvelopeProps = {
  open: boolean;
  onOpen: () => void;
};

export function Envelope({ open, onOpen }: EnvelopeProps) {
  const { t } = useI18n();

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
            <button type="button" className="wax" onClick={onOpen}>
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

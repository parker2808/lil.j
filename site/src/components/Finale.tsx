import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { Reveal } from "./Reveal.tsx";

type FinaleProps = {
  saidYes: boolean;
  onYes: () => void;
  onLater: () => void;
};

export function Finale({ saidYes, onYes, onLater }: FinaleProps) {
  const { t } = useI18n();

  return (
    <section className="scene finale">
      {saidYes ? (
        <div className="finale-copy">
          <Reveal text={t(content.finale.yesTitle)} />
          <p className="lede">{t(content.finale.yesBody)}</p>
        </div>
      ) : (
        <>
          <Reveal as="p" className="finale-lead" text={t(content.finale.lead)} />
          <Reveal as="h2" className="finale-question" text={t(content.finale.question)} />
          <div className="finale-actions">
            <button type="button" className="btn btn-gold yes-btn" onClick={onYes}>
              {t(content.finale.yes)}
            </button>
            <button type="button" className="btn btn-quiet later" onClick={onLater}>
              {t(content.finale.later)}
            </button>
          </div>
        </>
      )}
    </section>
  );
}

import { useLayoutEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Reveal } from "./Reveal.tsx";
import { Hearts } from "./Hearts.tsx";

type FinaleProps = {
  saidYes: boolean;
  onYes: () => void;
  onLater: () => void;
};

export function Finale({ saidYes, onYes, onLater }: FinaleProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const laterRef = useRef<HTMLButtonElement>(null);
  const lock = useRef(false);
  const [pos, setPos] = useState({ x: 24, y: 24 });
  const [teaseIndex, setTeaseIndex] = useState(-1);

  useLayoutEffect(() => {
    if (saidYes) return;
    const stage = stageRef.current;
    const button = laterRef.current;
    if (!stage || !button) return;
    setPos({
      x: Math.max(8, stage.clientWidth - button.offsetWidth - 16),
      y: Math.max(8, stage.clientHeight - button.offsetHeight - 16),
    });
  }, [saidYes]);

  function jump(clientX?: number, clientY?: number) {
    if (lock.current) return;
    const stage = stageRef.current;
    const button = laterRef.current;
    if (!stage || !button) return;
    lock.current = true;
    window.setTimeout(() => {
      lock.current = false;
    }, reduced ? 0 : 280);
    const maxX = Math.max(8, stage.clientWidth - button.offsetWidth - 8);
    const maxY = Math.max(8, stage.clientHeight - button.offsetHeight - 8);
    let x = 8;
    let y = 8;
    const rect = stage.getBoundingClientRect();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      x = 8 + Math.random() * Math.max(0, maxX - 8);
      y = 8 + Math.random() * Math.max(0, maxY - 8);
      if (clientX == null || clientY == null) break;
      const dx = x + button.offsetWidth / 2 - (clientX - rect.left);
      const dy = y + button.offsetHeight / 2 - (clientY - rect.top);
      if (dx * dx + dy * dy > 140 * 140) break;
    }
    setPos({ x, y });
    if (content.finale.teases.length > 0) {
      setTeaseIndex((index) => (index + 1) % content.finale.teases.length);
    }
  }

  return (
    <section className="scene finale">
      <Hearts active={saidYes} />
      {saidYes ? (
        <div className="finale-copy">
          <Reveal text={t(content.finale.yesTitle)} />
          <p className="lede">{t(content.finale.yesBody)}</p>
          <p className="finale-celebrate">{t(content.finale.celebrate)}</p>
        </div>
      ) : (
        <>
          <Reveal as="p" className="finale-lead" text={t(content.finale.lead)} />
          <Reveal as="h2" className="finale-question" text={t(content.finale.question)} />
          <button type="button" className="btn btn-gold yes-btn" onClick={onYes}>
            {t(content.finale.yes)}
          </button>
          <div className="finale-stage" ref={stageRef}>
            <button
              ref={laterRef}
              type="button"
              className="btn later no-btn"
              style={{ left: pos.x, top: pos.y }}
              onPointerEnter={(event) => jump(event.clientX, event.clientY)}
              onPointerDown={(event) => {
                event.preventDefault();
                jump(event.clientX, event.clientY);
              }}
              onClick={onLater}
            >
              {t(content.finale.later)}
            </button>
          </div>
          <p className="finale-tease" role="status" aria-live="polite">
            {teaseIndex >= 0 ? t(content.finale.teases[teaseIndex]) : ""}
          </p>
        </>
      )}
    </section>
  );
}

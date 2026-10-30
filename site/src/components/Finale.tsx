import { useLayoutEffect, useRef, useState, type SyntheticEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Reveal } from "./Reveal.tsx";
import { Hearts } from "./Hearts.tsx";

type FinaleProps = {
  saidYes: boolean;
  onYes: () => void;
};

export function Finale({ saidYes, onYes }: FinaleProps) {
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

  function blockFinaleBubble(event: SyntheticEvent) {
    event.stopPropagation();
  }

  return (
    <section className="scene finale" onPointerDown={blockFinaleBubble} onClick={blockFinaleBubble}>
      <Hearts active={saidYes} />
      {saidYes ? (
        <div className="finale-copy is-yes">
          <div className="finale-bloom" aria-hidden="true">
            <span className="bloom-ring" />
            <span className="bloom-ring is-late" />
            {Array.from({ length: 10 }, (_, i) => (
              <i key={i} style={{ ["--a" as string]: `${i * 36}deg` }} />
            ))}
            <svg viewBox="0 0 48 44">
              <defs>
                <linearGradient id="bloom-heart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#ffc27a" />
                  <stop offset="0.55" stopColor="#ff9a3d" />
                  <stop offset="1" stopColor="#f07a1f" />
                </linearGradient>
              </defs>
              <path
                d="M24 41C10 31 3 23 3 14.5 3 8.4 7.9 3.5 14 3.5c4.2 0 7.7 2.2 10 5.6 2.3-3.4 5.8-5.6 10-5.6 6.1 0 11 4.9 11 11C45 23 38 31 24 41Z"
                fill="url(#bloom-heart)"
              />
              <path d="M12 10.5c-2.4 1-3.8 3.3-3.8 5.8" fill="none" stroke="#fff" strokeOpacity="0.75" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <Reveal text={t(content.finale.yesTitle)} />
          <p className="lede">{t(content.finale.yesBody)}</p>
          <p className="finale-celebrate"><span>{t(content.finale.celebrate)}</span></p>
        </div>
      ) : (
        <>
          <Reveal as="p" className="finale-lead" text={t(content.finale.lead)} />
          <Reveal as="h2" className="finale-question" text={t(content.finale.question)} />
          <button type="button" className="btn btn-gold yes-btn" onClick={onYes}>
            {t(content.finale.yes)}
          </button>
          <div className="finale-stage" ref={stageRef} onPointerDown={blockFinaleBubble} onClick={blockFinaleBubble}>
            <button
              ref={laterRef}
              type="button"
              className="btn later no-btn"
              style={{ left: pos.x, top: pos.y }}
              onPointerEnter={(event) => {
                blockFinaleBubble(event);
                jump(event.clientX, event.clientY);
              }}
              onPointerDown={(event) => {
                blockFinaleBubble(event);
                event.preventDefault();
                jump(event.clientX, event.clientY);
              }}
              onClick={(event) => {
                blockFinaleBubble(event);
                event.preventDefault();
                jump(event.clientX, event.clientY);
              }}
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

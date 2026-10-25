import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { Hearts } from "./Hearts.tsx";

type FinaleProps = {
  saidYes: boolean;
  onYes: () => void;
  onBack: () => void;
};

export function Finale({ saidYes, onYes, onBack }: FinaleProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const noRef = useRef<HTMLButtonElement>(null);
  const lock = useRef(false);
  const [pos, setPos] = useState({ x: 24, y: 24 });

  useEffect(() => {
    const stage = stageRef.current;
    const button = noRef.current;
    if (!stage || !button) return;
    setPos({
      x: Math.max(8, stage.clientWidth - button.offsetWidth - 16),
      y: Math.max(8, stage.clientHeight - button.offsetHeight - 16),
    });
  }, []);
  const [tease, setTease] = useState("");
  const [teaseIndex, setTeaseIndex] = useState(0);

  function jump(clientX?: number, clientY?: number) {
    if (lock.current) return;
    const stage = stageRef.current;
    const button = noRef.current;
    if (!stage || !button) return;
    lock.current = true;
    window.setTimeout(() => {
      lock.current = false;
    }, 280);
    const maxX = Math.max(8, stage.clientWidth - button.offsetWidth - 8);
    const maxY = Math.max(8, stage.clientHeight - button.offsetHeight - 8);
    let x = Math.random() * maxX;
    let y = Math.random() * maxY;
    const rect = stage.getBoundingClientRect();
    for (let attempt = 0; attempt < 8; attempt += 1) {
      x = Math.random() * maxX;
      y = Math.random() * maxY;
      if (clientX == null || clientY == null) break;
      const dx = x + button.offsetWidth / 2 - (clientX - rect.left);
      const dy = y + button.offsetHeight / 2 - (clientY - rect.top);
      if (dx * dx + dy * dy > 140 * 140) break;
    }
    setPos({ x, y });
    const lines = content.finale.teases;
    if (lines.length) {
      setTease(lines[teaseIndex % lines.length] ?? "");
      setTeaseIndex((index) => index + 1);
    }
  }

  return (
    <section className="scene finale">
      <Hearts active={saidYes} />
      <button type="button" className="back" onClick={onBack}>
        ← {content.ui.back}
      </button>
      {saidYes ? (
        <>
          <h1>{content.finale.yesTitle}</h1>
          <p className="lede">{content.finale.yesBody}</p>
        </>
      ) : (
        <>
          <h1>{content.finale.question}</h1>
          <button type="button" className="btn btn-gold yes-btn" onClick={onYes}>
            {content.finale.yes}
          </button>
          <div className="finale-stage" ref={stageRef}>
            <button
              ref={noRef}
              type="button"
              className="btn no-btn"
              style={{ left: pos.x, top: pos.y }}
              onPointerEnter={(event) => jump(event.clientX, event.clientY)}
              onPointerDown={(event) => {
                event.preventDefault();
                jump(event.clientX, event.clientY);
              }}
              onFocus={() => jump()}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  jump();
                }
              }}
            >
              {content.finale.no}
            </button>
          </div>
          <p className="hint" role="status">
            {tease}
          </p>
        </>
      )}
    </section>
  );
}

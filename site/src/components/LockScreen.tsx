import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { content } from "../content.ts";
import { countdownParts, msUntilUnlock } from "../lib/lock.ts";
import { useI18n } from "../lib/locale-context.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";
import { Reveal } from "./Reveal.tsx";

const SLOTS = 20;

type LockScreenProps = {
  onOpen: () => void;
};

function OdoDigit({ digit, reduced, delay }: { digit: number; reduced: boolean; delay: number }) {
  const [index, setIndex] = useState(0);
  const [instant, setInstant] = useState(false);
  const prev = useRef(0);

  useEffect(() => {
    if (reduced) return;
    const from = prev.current;
    prev.current = digit;
    setInstant(false);
    setIndex(digit < from ? digit + 10 : digit);
  }, [digit, reduced]);

  useEffect(() => {
    if (!instant) return;
    const frame = window.requestAnimationFrame(() => setInstant(false));
    return () => window.cancelAnimationFrame(frame);
  }, [instant]);

  if (reduced) {
    return (
      <div className="odo-window">
        <div className="odo-num">{digit}</div>
      </div>
    );
  }

  return (
    <div className="odo-window">
      <motion.div
        className="odo-strip"
        initial={false}
        animate={{ y: `${-index * (100 / SLOTS)}%` }}
        transition={
          instant ? { duration: 0 } : { type: "spring", stiffness: 220, damping: 28, mass: 0.5, delay }
        }
        onAnimationComplete={() => {
          if (index >= 10) {
            setInstant(true);
            setIndex(index - 10);
          }
        }}
      >
        {Array.from({ length: SLOTS }, (_, slot) => (
          <div key={slot} className="odo-num">
            {slot % 10}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function Reel({
  value,
  pad,
  reduced,
  className,
}: {
  value: number;
  pad: number;
  reduced: boolean;
  className: string;
}) {
  const text = String(Math.max(0, value)).padStart(pad, "0");
  return (
    <div className={className}>
      {text.split("").map((char, index) => (
        <OdoDigit key={`${text.length}-${index}`} digit={Number(char)} reduced={reduced} delay={reduced ? 0 : index * 0.05} />
      ))}
    </div>
  );
}

export function LockScreen({ onOpen }: LockScreenProps) {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const openRef = useRef(onOpen);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    openRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    const finish = () => {
      const next = Date.now();
      setNow(next);
      if (!content.lock?.unlockAt || Date.parse(content.lock.unlockAt) <= next) openRef.current();
    };
    const interval = window.setInterval(finish, 1000);
    const wait = msUntilUnlock(content.lock.unlockAt);
    const timeout = wait == null ? 0 : window.setTimeout(finish, wait);
    return () => {
      window.clearInterval(interval);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);

  const parts = countdownParts(content.lock.unlockAt, now);
  const dayPad = parts.days >= 100 ? 3 : 2;
  const live = [
    ["hours", parts.hours, t(content.lock.hours)],
    ["minutes", parts.minutes, t(content.lock.minutes)],
    ["seconds", parts.seconds, t(content.lock.seconds)],
  ] as const;
  const spoken = `${parts.days} ${t(content.lock.days)}, ${parts.hours} ${t(content.lock.hours)}, ${parts.minutes} ${t(content.lock.minutes)}, ${parts.seconds} ${t(content.lock.seconds)}`;

  return (
    <section className="scene lock-scene">
      <div className="gate-mark lock-mark" aria-hidden="true">
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
      <Reveal text={t(content.lock.title)} />
      <p className="lede">{t(content.lock.subtitle)}</p>
      <div className="together lock-clock">
        <div className="together-glow">
          <Reel value={parts.days} pad={dayPad} reduced={reduced} className="odo-hero" />
          <p className="together-unit">{t(content.lock.days)}</p>
          <div className="odo-live">
            {live.map(([key, value, label]) => (
              <div key={key} className="odo-live-cell">
                <Reel value={value} pad={2} reduced={reduced} className="odo-live-nums" />
                <span className="odo-live-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {spoken}
      </p>
    </section>
  );
}

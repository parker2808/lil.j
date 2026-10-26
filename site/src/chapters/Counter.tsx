import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { elapsedParts, fillTemplate } from "../lib/pure.ts";
import { useReducedMotion } from "../lib/useReducedMotion.ts";

const SLOTS = 20;

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
          instant
            ? { duration: 0 }
            : { type: "spring", stiffness: 220, damping: 28, mass: 0.5, delay }
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

export function Counter() {
  const { t } = useI18n();
  const reduced = useReducedMotion();
  const chapter = content.chapters.find((item) => item.id === "counter");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = elapsedParts(content.startDate, now);
  const sentence = fillTemplate(t(parts.future ? content.together.future : content.together.past), {
    days: parts.days,
    hours: parts.hours,
    minutes: parts.minutes,
    seconds: parts.seconds,
  });
  const live = [
    ["hours", parts.hours, t(content.ui.unitHours)],
    ["minutes", parts.minutes, t(content.ui.unitMinutes)],
    ["seconds", parts.seconds, t(content.ui.unitSeconds)],
  ] as const;

  return (
    <ChapterFrame kicker={t(chapter?.kicker)} title={t(chapter?.title)} lede={t(chapter?.lede)}>
      <motion.div
        className="together"
        initial={reduced ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="together-glow" aria-hidden="true">
          {parts.future && <p className="together-until">{t(content.together.until)}</p>}
          <Reel value={parts.days} pad={1} reduced={reduced} className="odo-hero" />
          <p className="together-unit">{t(content.ui.unitDays)}</p>
          <div className="odo-live">
            {live.map(([key, value, label], index) => (
              <div key={key} className="odo-live-cell">
                <Reel value={value} pad={2} reduced={reduced} className="odo-live-nums" />
                <span className="odo-live-label" style={{ animationDelay: reduced ? undefined : `${0.2 + index * 0.08}s` }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
      <p className="sr-only" aria-live="polite">
        {sentence}
      </p>
    </ChapterFrame>
  );
}

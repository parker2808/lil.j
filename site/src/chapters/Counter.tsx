import { useEffect, useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { elapsedParts, fillTemplate } from "../lib/pure.ts";
function Roll({ value }: { value: number }) {
  const text = String(value).padStart(2, "0");
  return (
    <span className="tick" aria-hidden="true">
      {text.split("").map((digit, index) => (
        <span key={`${index}-${digit}`} className="digit">
          {digit}
        </span>
      ))}
    </span>
  );
}

export function Counter() {
  const { t } = useI18n();
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
  const cells = [
    ["days", parts.days, t(content.ui.unitDays)],
    ["hours", parts.hours, t(content.ui.unitHours)],
    ["minutes", parts.minutes, t(content.ui.unitMinutes)],
    ["seconds", parts.seconds, t(content.ui.unitSeconds)],
  ] as const;

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <div className="clock" aria-hidden="true">
        {cells.map(([key, value, label]) => (
          <div key={key} className="tick-cell">
            <Roll value={value} />
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="sentence">{sentence}</p>
    </ChapterFrame>
  );
}

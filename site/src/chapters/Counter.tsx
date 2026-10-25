import { useEffect, useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { elapsedParts, fillTemplate } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

export function Counter({ onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "counter");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const parts = elapsedParts(content.startDate, now);
  const sentence = fillTemplate(parts.future ? content.together.future : content.together.past, {
    days: parts.days,
    hours: parts.hours,
    minutes: parts.minutes,
    seconds: parts.seconds,
  });
  const cells = [
    ["days", parts.days, "ngày"],
    ["hours", parts.hours, "giờ"],
    ["minutes", parts.minutes, "phút"],
    ["seconds", parts.seconds, "giây"],
  ] as const;

  return (
    <ChapterFrame
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      <div className="ticks" aria-hidden="true">
        {cells.map(([key, value, label]) => (
          <div key={key}>
            <span className="tick">{value}</span>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="sentence">{sentence}</p>
    </ChapterFrame>
  );
}

import { useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { Spark } from "../components/Fireworks.tsx";
import { useI18n } from "../lib/locale-context.ts";
import type { ChapterProps } from "../types.ts";

export function Dreams({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "dreams");
  const [cheer, setCheer] = useState(0);

  function toggle(id: string) {
    if (!progress.dreamsDone.includes(id)) setCheer((count) => count + 1);
    update((current) => {
      const has = current.dreamsDone.includes(id);
      return {
        ...current,
        dreamsDone: has ? current.dreamsDone.filter((item) => item !== id) : [...current.dreamsDone, id],
      };
    });
  }

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <Spark play={cheer} />
      <ol className="dreams">
        {content.dreams.map((dream, index) => {
          const done = progress.dreamsDone.includes(dream.id);
          return (
            <li key={dream.id}>
              <label className={done ? "dream is-done" : "dream"}>
                <input type="checkbox" checked={done} onChange={() => toggle(dream.id)} />
                <span className="dream-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>
                  <strong>{t(dream.text)}</strong>
                  <small>{t(dream.detail)}</small>
                </span>
              </label>
            </li>
          );
        })}
      </ol>
    </ChapterFrame>
  );
}

import { useEffect, useRef, useState } from "react";
import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { Spark } from "../components/Fireworks.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { queueDreams } from "../lib/sheet-sync.ts";
import type { ChapterProps } from "../types.ts";

export function Dreams({ progress, update }: ChapterProps) {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "dreams");
  const [cheer, setCheer] = useState(0);
  // Opening the scene sends nothing. Only her own ticks do.
  const touched = useRef(false);

  useEffect(() => {
    if (!touched.current) return;
    const picked = content.dreams.filter((dream) => progress.dreamsDone.includes(dream.id));
    queueDreams(
      picked.map((dream) => dream.id),
      picked.map((dream) => dream.text.vi),
    );
  }, [progress.dreamsDone]);

  function toggle(id: string) {
    touched.current = true;
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
      lede={t(content.dreamsCopy.note)}
      className="dreams-scene"
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
                  {done ? "✓" : String(index + 1).padStart(2, "0")}
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

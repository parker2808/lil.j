import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import type { ChapterProps } from "../types.ts";

export function Dreams({ progress, update, onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "dreams");

  function toggle(id: string) {
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
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      <ul className="dreams">
        {content.dreams.map((dream) => {
          const done = progress.dreamsDone.includes(dream.id);
          return (
            <li key={dream.id}>
              <label className={done ? "dream is-done" : "dream"}>
                <input type="checkbox" checked={done} onChange={() => toggle(dream.id)} />
                <span>
                  <strong>{dream.text}</strong>
                  <small>{dream.detail}</small>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </ChapterFrame>
  );
}

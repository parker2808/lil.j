import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { useI18n } from "../lib/locale-context.ts";
import { tiltFromId } from "../lib/pure.ts";

const TONES = new Set(["gold", "blush", "sage", "sky", "cream"]);

export function Friends() {
  const { t } = useI18n();
  const chapter = content.chapters.find((item) => item.id === "friends");

  return (
    <ChapterFrame
      kicker={t(chapter?.kicker)}
      title={t(chapter?.title)}
      lede={t(chapter?.lede)}
    >
      <ul className="wall">
        {content.friendNotes.map((note) => (
          <li
            key={note.id}
            className={`note tone-${TONES.has(note.tone) ? note.tone : "cream"}`}
            style={{ ["--tilt" as string]: `${tiltFromId(note.id)}deg` }}
          >
            <p>{t(note.text)}</p>
            <span>— {note.author}</span>
          </li>
        ))}
      </ul>
    </ChapterFrame>
  );
}

import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import { tiltFromId } from "../lib/pure.ts";
import type { ChapterProps } from "../types.ts";

const TONES = new Set(["gold", "blush", "sage", "sky", "cream"]);

export function Friends({ onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "friends");

  return (
    <ChapterFrame
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      <ul className="wall">
        {content.friendNotes.map((note) => (
          <li
            key={note.id}
            className={`note tone-${TONES.has(note.tone) ? note.tone : "cream"}`}
            style={{ ["--tilt" as string]: `${tiltFromId(note.id)}deg` }}
          >
            <p>{note.text}</p>
            <span>— {note.author}</span>
          </li>
        ))}
      </ul>
    </ChapterFrame>
  );
}

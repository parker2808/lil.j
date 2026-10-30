import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { chapterFor } from "../lib/story.ts";
import type { StepId } from "../lib/flow.ts";

export function StoryChapterLabel({ stepId }: { stepId: StepId }) {
  const { t } = useI18n();
  const chapter = chapterFor(stepId);
  if (!chapter) return <span className="chrome-spacer" />;
  return (
    <p className="story-chapter" title={`${t(content.ui.chapterWord)} ${chapter} · ${t(content.storyChapters[chapter])}`}>
      <span className="story-chapter-index">{t(content.ui.chapterWord)} {chapter} ·</span>
      <span className="story-chapter-title">{t(content.storyChapters[chapter])}</span>
    </p>
  );
}

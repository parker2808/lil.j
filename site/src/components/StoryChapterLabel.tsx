import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import { chapterFor } from "../lib/story.ts";
import type { StepId } from "../lib/flow.ts";

export function StoryChapterLabel({ stepId }: { stepId: StepId }) {
  const { t } = useI18n();
  const chapter = chapterFor(stepId);
  if (!chapter) return null;
  return (
    <p className="story-chapter">
      <span className="story-chapter-index">{chapter}</span>
      <span className="story-chapter-title">{t(content.storyChapters[chapter])}</span>
    </p>
  );
}

import type { StepId } from "./flow.ts";

export const STORY_CHAPTERS = [
  { id: "I", scenes: ["gate", "sky", "birth"] },
  { id: "II", scenes: ["gallery", "memory", "quiz", "scratch"] },
  { id: "III", scenes: ["counter", "dreams", "letters"] },
  { id: "IV", scenes: ["cake", "wish"] },
  { id: "V", scenes: ["envelope", "finale", "letter"] },
] as const;

export type StoryChapterId = (typeof STORY_CHAPTERS)[number]["id"];

const CHAPTER_BY_SCENE = new Map<string, StoryChapterId>(
  STORY_CHAPTERS.flatMap((chapter) => chapter.scenes.map((scene) => [scene, chapter.id] as const)),
);

export function chapterFor(stepId: StepId): StoryChapterId | null {
  return CHAPTER_BY_SCENE.get(stepId) ?? null;
}

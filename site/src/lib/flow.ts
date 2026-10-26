export const FLOW = [
  "gate",
  "sky",
  "birth",
  "gallery",
  "quiz",
  "counter",
  "cake",
  "wish",
  "letter",
] as const;

export type StepId = (typeof FLOW)[number];

export function clampStep(value: unknown): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(FLOW.length - 1, Math.floor(number)));
}

export function stepDone(
  id: StepId,
  progress: {
    gateUnlocked: boolean;
    skyDone: boolean;
    birthSeen: boolean;
    flippedPhotos: string[];
    quiz: Record<string, number>;
    counterSeen: boolean;
    candlesOut: number[];
    wishes: { text: string }[];
    letterDone: boolean;
  },
  candleCount: number,
  quizIds: string[],
): boolean {
  switch (id) {
    case "gate":
      return progress.gateUnlocked;
    case "sky":
      return progress.skyDone;
    case "birth":
      return progress.birthSeen;
    case "gallery":
      return progress.flippedPhotos.length > 0;
    case "quiz":
      return quizIds.every((qid) => typeof progress.quiz[qid] === "number");
    case "counter":
      return progress.counterSeen;
    case "cake": {
      const out = new Set(progress.candlesOut.filter((index) => index >= 0 && index < candleCount));
      return out.size >= candleCount;
    }
    case "wish":
      return progress.wishes.some((wish) => wish.text.trim().length > 0);
    case "letter":
      return progress.letterDone;
    default:
      return false;
  }
}

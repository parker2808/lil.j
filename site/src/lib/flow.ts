export const FLOW = [
  "gate",
  "sky",
  "birth",
  "gallery",
  "quiz",
  "counter",
  "cake",
  "envelope",
  "memory",
  "scratch",
  "letters",
  "friends",
  "dreams",
  "finale",
  "wish",
  "letter",
] as const;

/** The path before the chapters between cake and wish were restored. Used only to resume old saves. */
export const PREVIOUS_FLOW = [
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

export const FLOW_VERSION = 2;

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
    envelopeOpened: boolean;
    memoryBest: number | null;
    scratched: string[];
    openWhen: Record<string, string>;
    friendsSeen: boolean;
    dreamsDone: string[];
    saidYes: boolean;
    wishes: { text: string }[];
    letterDone: boolean;
  },
  candleCount: number,
  quizIds: string[],
  scratchIds: string[] = [],
  letterIds: string[] = [],
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
    case "envelope":
      return progress.envelopeOpened;
    case "memory":
      return progress.memoryBest != null;
    case "scratch":
      return scratchIds.length > 0 && scratchIds.every((id) => progress.scratched.includes(id));
    case "letters":
      return letterIds.length > 0 && letterIds.every((id) => Boolean(progress.openWhen[id]));
    case "friends":
      return progress.friendsSeen;
    case "dreams":
      return progress.dreamsDone.length > 0;
    case "finale":
      return progress.saidYes;
    case "wish":
      return progress.wishes.some((wish) => wish.text.trim().length > 0);
    case "letter":
      return progress.letterDone;
    default:
      return false;
  }
}

/** Friend notes stay in the repo. Flip this to put them back on the path, between the open-when letters and the dreams. */
export const INCLUDE_FRIENDS = false;

/**
 * Frozen historical paths. Story V2 will reorder the live FLOW.
 * These names stay put so a saved index can still be resolved by scene id.
 */
export const FLOW_V1 = [
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

export const FLOW_V2 = [
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

export const FLOW_V3 = [
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
  "dreams",
  "finale",
  "wish",
  "letter",
] as const;

export const FLOW_WITH_FRIENDS = FLOW_V2;
export const FLOW_WITHOUT_FRIENDS = FLOW_V3;

export const FLOW = INCLUDE_FRIENDS ? FLOW_WITH_FRIENDS : FLOW_WITHOUT_FRIENDS;

/** The 9-step path from before the middle chapters were restored. */
export const PREVIOUS_FLOW = FLOW_V1;

/** 2 = the 16-step path that included friend notes. 3 = that step removed. */
export const FLOW_VERSION = INCLUDE_FRIENDS ? 2 : 3;

export type StepId = (typeof FLOW_WITH_FRIENDS)[number];

export function clampStep(value: unknown): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(FLOW.length - 1, Math.floor(number)));
}

function pathForVersion(version: unknown): readonly string[] {
  if (version === 2) return FLOW_V2;
  if (version === 3) return FLOW_V3;
  return FLOW_V1;
}

export function migrateIndex(version: unknown, index: number): number {
  const current = Math.max(0, Math.floor(index));
  if (version === FLOW_VERSION) return clampStep(current);
  const saved = pathForVersion(version);
  const id = saved[current];
  if (!id) return clampStep(current);
  const placed = (FLOW as readonly string[]).indexOf(id);
  if (placed >= 0) return placed;
  if (id === "friends") {
    const dreams = (FLOW as readonly string[]).indexOf("dreams");
    return dreams >= 0 ? dreams : clampStep(current);
  }
  return clampStep(current);
}

export function stepDone(
  id: StepId,
  progress: {
    gateUnlocked: boolean;
    skyDone: boolean;
    birthSeen: boolean;
    flippedPhotos: string[];
    erasViewed?: string[];
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
    case "counter":
    case "friends":
      return true;
    case "birth":
      return progress.birthSeen;
    case "gallery":
      return (progress.erasViewed?.length ?? 0) > 0;
    case "quiz":
      return quizIds.every((qid) => typeof progress.quiz[qid] === "number");
    case "cake": {
      const out = new Set(progress.candlesOut.filter((index) => index >= 0 && index < candleCount));
      return out.size >= candleCount;
    }
    case "envelope":
      return progress.envelopeOpened;
    case "memory":
      return progress.memoryBest != null;
    case "scratch":
      return scratchIds.length > 0 && scratchIds.every((sid) => progress.scratched.includes(sid));
    case "letters":
      return letterIds.length > 0 && letterIds.every((lid) => Boolean(progress.openWhen[lid]));
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

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

/** Five chapters. Friends stay off this path. */
export const FLOW_V4 = [
  "gate",
  "sky",
  "birth",
  "gallery",
  "memory",
  "quiz",
  "scratch",
  "counter",
  "dreams",
  "letters",
  "cake",
  "wish",
  "envelope",
  "finale",
  "letter",
] as const;

export const FLOW_WITH_FRIENDS = FLOW_V2;
export const FLOW_WITHOUT_FRIENDS = FLOW_V3;

export const FLOW = INCLUDE_FRIENDS ? FLOW_WITH_FRIENDS : FLOW_V4;

/** The 9-step path from before the middle chapters were restored. */
export const PREVIOUS_FLOW = FLOW_V1;

/** 2 = 16 steps with friend notes. 3 = those notes removed. 4 = the five-chapter order. */
export const FLOW_VERSION = INCLUDE_FRIENDS ? 2 : 4;

export type StepId = (typeof FLOW_WITH_FRIENDS)[number];

export function clampStep(value: unknown): number {
  const number = typeof value === "number" ? value : Number.NaN;
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(FLOW.length - 1, Math.floor(number)));
}

export function pathForVersion(version: unknown): readonly string[] {
  if (version === 2) return FLOW_V2;
  if (version === 3) return FLOW_V3;
  if (version === 4) return FLOW_V4;
  return FLOW_V1;
}

/** Map a historical scene id onto the live path. Friend notes land on dreams. */
export function mapSceneId(id: string): StepId | null {
  if (id === "friends") {
    return (FLOW as readonly string[]).includes("dreams") ? "dreams" : null;
  }
  if ((FLOW as readonly string[]).includes(id)) return id as StepId;
  return null;
}

export function migrateIndex(version: unknown, index: number): number {
  if (version === FLOW_VERSION) return clampStep(index);
  const saved = pathForVersion(version);
  const current = clampHistorical(index, saved.length);
  const mapped = mapSceneId(saved[current] ?? "");
  if (!mapped) return 0;
  const placed = (FLOW as readonly string[]).indexOf(mapped);
  return placed >= 0 ? placed : 0;
}

function clampHistorical(index: number, length: number): number {
  if (!Number.isFinite(index) || length <= 0) return 0;
  return Math.max(0, Math.min(length - 1, Math.floor(index)));
}

type SceneState = {
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
  skippedSteps?: readonly StepId[];
  accessibleSteps?: readonly StepId[];
  wishPrivate?: boolean;
};

/** Real interaction data. A skip is not completion. */
export function stepDone(
  id: StepId,
  progress: SceneState,
  candleCount: number,
  quizIds: string[],
  scratchIds: string[] = [],
  letterIds: string[] = [],
): boolean {
  return sceneCompleted(id, progress, candleCount, quizIds, scratchIds, letterIds);
}

function sceneCompleted(
  id: StepId,
  progress: SceneState,
  candleCount: number,
  quizIds: string[],
  scratchIds: string[],
  letterIds: string[],
): boolean {
  switch (id) {
    case "gate":
      return progress.gateUnlocked;
    case "sky":
      return progress.skyDone;
    case "counter":
      return progress.counterSeen;
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
      return progress.wishPrivate === true || progress.wishes.some((wish) => wish.text.trim().length > 0);
    case "letter":
      return progress.letterDone;
    default:
      return false;
  }
}

/** Completed, explicitly skipped, or the next scene is already open. */
export function mayContinue(
  id: StepId,
  progress: SceneState,
  candleCount: number,
  quizIds: string[],
  scratchIds: string[] = [],
  letterIds: string[] = [],
): boolean {
  if (sceneCompleted(id, progress, candleCount, quizIds, scratchIds, letterIds)) return true;
  if (progress.skippedSteps?.includes(id)) return true;
  const index = (FLOW as readonly string[]).indexOf(id);
  const next = FLOW[index + 1];
  return Boolean(next && progress.accessibleSteps?.includes(next));
}

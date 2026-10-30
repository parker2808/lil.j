import { content } from "../content.ts";
import { FLOW, FLOW_VERSION, clampStep, mapSceneId, pathForVersion, type StepId } from "./flow.ts";
import type { Progress, Wish } from "../types.ts";

const liveEraIds = new Set(content.eras.map((era) => era.id));
const livePhotoIds = new Set(content.photos.map((photo) => photo.id));

export const PROGRESS_KEY = "lilj.progress.v1";

export function emptyProgress(): Progress {
  return {
    gateUnlocked: false,
    envelopeOpened: false,
    openedChapters: [],
    flippedPhotos: [],
    erasViewed: [],
    scratched: [],
    quiz: {},
    memoryBest: null,
    dreamsDone: [],
    candlesOut: [],
    saidYes: false,
    openWhen: {},
    // First visit stays quiet. Browsers block autoplay, so the music button asks for a tap.
    muted: true,
    step: 0,
    unlocked: 0,
    accessibleSteps: ["gate"],
    skippedSteps: [],
    wishPrivate: false,
    skyDone: false,
    birthSeen: false,
    counterSeen: false,
    friendsSeen: false,
    letterDone: false,
    wishes: [],
    flowVersion: FLOW_VERSION,
  };
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function liveIds(value: unknown, allowed: ReadonlySet<string>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of stringList(value)) {
    if (!allowed.has(item) || seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

function numberList(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is number => typeof item === "number" && Number.isFinite(item));
}

function stringMap(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, string> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "string") out[key] = item;
  }
  return out;
}

function quizMap(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, number> = {};
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === "number" && Number.isFinite(item)) out[key] = item;
  }
  return out;
}

function wishList(value: unknown): Wish[] {
  if (!Array.isArray(value)) return [];
  const wishes: Wish[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.id !== "string" || typeof record.text !== "string") continue;
    const text = record.text.trim();
    if (!text) continue;
    const at = typeof record.at === "number" && Number.isFinite(record.at) ? record.at : 0;
    wishes.push({ id: record.id, text: text.slice(0, 180), at });
  }
  return wishes.slice(-24);
}

function isStepId(value: string): value is StepId {
  return (FLOW as readonly string[]).includes(value);
}

function stepList(value: unknown): StepId[] {
  if (!Array.isArray(value)) return [];
  const out: StepId[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !isStepId(item) || out.includes(item)) continue;
    out.push(item);
  }
  return out;
}

export function derivedUnlocked(steps: readonly StepId[]): number {
  let max = 0;
  for (const id of steps) {
    const index = (FLOW as readonly string[]).indexOf(id);
    if (index > max) max = index;
  }
  return max;
}

function ordered(ids: Iterable<StepId>): StepId[] {
  const have = new Set(ids);
  return FLOW.filter((id) => have.has(id));
}

function sameSteps(left: readonly StepId[], right: readonly StepId[]): boolean {
  return left.length === right.length && left.every((id, index) => id === right[index]);
}

function isPlainObject(data: unknown): data is Record<string, unknown> {
  return Boolean(data) && typeof data === "object" && !Array.isArray(data);
}

function clampToLength(value: unknown, length: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || length <= 0) return null;
  return Math.max(0, Math.min(length - 1, Math.floor(value)));
}

function readFields(record: Record<string, unknown>, gateUnlocked: boolean): Omit<Progress, "step" | "unlocked" | "accessibleSteps" | "skippedSteps" | "wishPrivate" | "flowVersion"> {
  return {
    gateUnlocked,
    envelopeOpened: record.envelopeOpened === true,
    openedChapters: stringList(record.openedChapters),
    flippedPhotos: liveIds(record.flippedPhotos, livePhotoIds),
    erasViewed: liveIds(record.erasViewed, liveEraIds),
    scratched: stringList(record.scratched),
    quiz: quizMap(record.quiz),
    memoryBest: typeof record.memoryBest === "number" ? record.memoryBest : null,
    dreamsDone: stringList(record.dreamsDone),
    candlesOut: numberList(record.candlesOut),
    saidYes: record.saidYes === true,
    openWhen: stringMap(record.openWhen),
    muted: record.muted === true,
    skyDone: record.skyDone === true,
    birthSeen: record.birthSeen === true,
    counterSeen: record.counterSeen === true,
    friendsSeen: record.friendsSeen === true,
    letterDone: record.letterDone === true,
    wishes: wishList(record.wishes),
  };
}

function withPosition(fields: Omit<Progress, "step" | "unlocked" | "accessibleSteps" | "skippedSteps" | "wishPrivate" | "flowVersion">, step: number, accessibleSteps: StepId[], skippedSteps: StepId[], wishPrivate: boolean, flowVersion: number): Progress {
  const steps = ordered(accessibleSteps);
  const placed = (FLOW as readonly string[])[step] ? step : 0;
  return {
    ...fields,
    step: placed,
    accessibleSteps: steps,
    skippedSteps: ordered(skippedSteps),
    wishPrivate,
    unlocked: derivedUnlocked(steps),
    flowVersion,
  };
}

/** Same-version saves. A missing accessible set still means the old prefix, on this flow only. */
function normalizeCurrent(record: Record<string, unknown>): Progress {
  const gateUnlocked = record.gateUnlocked === true;
  const fields = readFields(record, gateUnlocked);
  const step = clampToLength(record.step, FLOW.length) ?? (gateUnlocked ? 1 : 0);
  const stored = stepList(record.accessibleSteps);
  const currentId = FLOW[step] ?? "gate";
  let accessible: StepId[];
  if (stored.length === 0) {
    const unlockedIndex = clampToLength(record.unlocked, FLOW.length) ?? step;
    const ids = new Set<StepId>();
    const prefix = Math.min(unlockedIndex, FLOW.length - 1);
    for (let index = 0; index <= prefix; index += 1) ids.add(FLOW[index]);
    ids.add(currentId);
    accessible = [...ids];
  } else {
    accessible = [...stored, currentId];
  }
  return withPosition(fields, step, accessible, stepList(record.skippedSteps), record.wishPrivate === true, FLOW_VERSION);
}

/**
 * Older paths migrate by scene id.
 * The saved prefix becomes the accessible set. It is never reread as a prefix of the new order.
 * `unlocked < step` keeps the current scene and does not grant the scenes in between.
 */
function migrateHistorical(record: Record<string, unknown>): Progress {
  const gateUnlocked = record.gateUnlocked === true;
  const fields = readFields(record, gateUnlocked);
  const path = pathForVersion(record.flowVersion);
  const stepIndex = clampToLength(record.step, path.length) ?? (gateUnlocked ? Math.min(1, path.length - 1) : 0);
  const unlockedIndex = clampToLength(record.unlocked, path.length) ?? stepIndex;
  const accessible = new Set<StepId>();
  for (let index = 0; index <= unlockedIndex; index += 1) {
    const mapped = mapSceneId(path[index] ?? "");
    if (mapped) accessible.add(mapped);
  }
  const current = mapSceneId(path[stepIndex] ?? "") ?? "gate";
  accessible.add(current);
  const step = (FLOW as readonly string[]).indexOf(current);
  return withPosition(fields, step >= 0 ? step : 0, [...accessible], stepList(record.skippedSteps), record.wishPrivate === true, FLOW_VERSION);
}

/** A newer build's save stays in memory for this tab and is not written back. */
function futureSession(record: Record<string, unknown>): Progress {
  const gateUnlocked = record.gateUnlocked === true;
  const fields = readFields(record, gateUnlocked);
  const step = clampToLength(record.step, FLOW.length) ?? 0;
  const currentId = FLOW[step] ?? "gate";
  const stored = stepList(record.accessibleSteps);
  const accessible = stored.length > 0 ? [...stored, currentId] : (["gate", currentId] as StepId[]);
  const version = typeof record.flowVersion === "number" && Number.isFinite(record.flowVersion) ? record.flowVersion : FLOW_VERSION + 1;
  return withPosition(fields, step, accessible, stepList(record.skippedSteps), record.wishPrivate === true, version);
}

export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const data: unknown = JSON.parse(raw);
    if (!isPlainObject(data)) return base;
    const version = data.flowVersion;
    if (typeof version === "number" && Number.isFinite(version) && version > FLOW_VERSION) return futureSession(data);
    if (version === FLOW_VERSION) return normalizeCurrent(data);
    return migrateHistorical(data);
  } catch {
    return base;
  }
}

export function saveProgress(progress: Progress): void {
  if (progress.flowVersion > FLOW_VERSION) return;
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Private mode can refuse storage. The visit still works for the session.
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(PROGRESS_KEY);
  } catch {
    // Ignore.
  }
}

/** Journey state goes back to the gate. The music choice stays in the same record. */
export function restartedProgress(muted: boolean): Progress {
  return { ...emptyProgress(), muted };
}

/** Record an explicit later choice and open the next scene. A second call for the same scene does not walk further. */
export function skipAhead(current: Progress, id: StepId): Progress {
  const from = clampStep(current.step);
  if (FLOW[from] !== id || from >= FLOW.length - 1) return current;
  const skippedSteps = current.skippedSteps.includes(id) ? current.skippedSteps : ordered([...current.skippedSteps, id]);
  return moveTo({ ...current, skippedSteps }, from + 1, false, true);
}

/**
 * Move along the path.
 * A dev jump may open every scene up to the target.
 * Any other move may open an already accessible scene, or the single next scene when `mayLeave` is true.
 * Two calls with the same target cannot walk two scenes forward.
 */
export function moveTo(current: Progress, target: number, jump: boolean, mayLeave: boolean): Progress {
  const next = clampStep(target);
  const from = clampStep(current.step);
  const nextId = FLOW[next] ?? "gate";
  if (jump) {
    const ids = new Set(current.accessibleSteps);
    for (let index = 0; index <= next; index += 1) ids.add(FLOW[index]);
    const accessibleSteps = ordered(ids);
    const gateUnlocked = next > 0 || current.gateUnlocked;
    if (next === from && sameSteps(accessibleSteps, current.accessibleSteps) && gateUnlocked === current.gateUnlocked) return current;
    return {
      ...current,
      step: next,
      accessibleSteps,
      unlocked: derivedUnlocked(accessibleSteps),
      gateUnlocked,
    };
  }
  if (current.accessibleSteps.includes(nextId)) {
    if (next === from) return current;
    const gateUnlocked = next > 0 || current.gateUnlocked;
    return { ...current, step: next, gateUnlocked };
  }
  if (next !== from + 1) return current;
  if (next !== derivedUnlocked(current.accessibleSteps) + 1) return current;
  if (!mayLeave) return current;
  const accessibleSteps = ordered(new Set([...current.accessibleSteps, nextId]));
  return {
    ...current,
    step: next,
    accessibleSteps,
    unlocked: derivedUnlocked(accessibleSteps),
    gateUnlocked: true,
  };
}

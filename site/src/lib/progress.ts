import { clampStep } from "./flow.ts";
import type { Progress, Wish } from "../types.ts";

export const PROGRESS_KEY = "lilj.progress.v1";

export function emptyProgress(): Progress {
  return {
    gateUnlocked: false,
    envelopeOpened: false,
    openedChapters: [],
    flippedPhotos: [],
    scratched: [],
    quiz: {},
    memoryBest: null,
    dreamsDone: [],
    candlesOut: [],
    saidYes: false,
    openWhen: {},
    muted: false,
    step: 0,
    unlocked: 0,
    skyDone: false,
    birthSeen: false,
    counterSeen: false,
    letterDone: false,
    wishes: [],
  };
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
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

export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return base;
    const record = data as Record<string, unknown>;
    const gateUnlocked = record.gateUnlocked === true;
    const legacy = typeof record.step !== "number";
    const step = legacy ? (gateUnlocked ? 1 : 0) : clampStep(record.step);
    let unlocked = legacy ? step : clampStep(record.unlocked);
    if (unlocked < step) unlocked = step;
    return {
      gateUnlocked,
      envelopeOpened: record.envelopeOpened === true,
      openedChapters: stringList(record.openedChapters),
      flippedPhotos: stringList(record.flippedPhotos),
      scratched: stringList(record.scratched),
      quiz: quizMap(record.quiz),
      memoryBest: typeof record.memoryBest === "number" ? record.memoryBest : null,
      dreamsDone: stringList(record.dreamsDone),
      candlesOut: numberList(record.candlesOut),
      saidYes: record.saidYes === true,
      openWhen: stringMap(record.openWhen),
      muted: record.muted === true,
      step,
      unlocked,
      skyDone: record.skyDone === true,
      birthSeen: record.birthSeen === true,
      counterSeen: record.counterSeen === true,
      letterDone: record.letterDone === true,
      wishes: wishList(record.wishes),
    };
  } catch {
    return base;
  }
}

export function saveProgress(progress: Progress): void {
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

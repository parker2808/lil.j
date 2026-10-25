import type { Progress } from "../types.ts";

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

export function loadProgress(): Progress {
  const base = emptyProgress();
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    if (!raw) return base;
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") return base;
    const record = data as Record<string, unknown>;
    return {
      gateUnlocked: record.gateUnlocked === true,
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

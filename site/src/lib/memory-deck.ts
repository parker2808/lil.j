import type { Copy } from "./i18n.ts";

/** Fixed seed for Story V2 screenshot and browser QA scripts. */
export const STORY_V2_MEMORY_SEED = 42_426;

export const MEMORY_PAIR_COUNT = 6;

export type MemoryPhotoInput = {
  id: string;
  src: string;
  alt: Copy;
};

export type MemoryCard = {
  uid: string;
  photoId: string;
  src: string;
  alt: Copy;
};

export function parseMemorySeed(value: string | null | undefined): number | undefined {
  if (value == null || value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return Math.floor(parsed) >>> 0;
}

export function readMemorySeedFromSearch(search: string): number | undefined {
  return parseMemorySeed(new URLSearchParams(search).get("seed"));
}

export function randomSeed(): number {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] ?? ((Math.random() * 2 ** 32) >>> 0);
  }
  return (Math.random() * 2 ** 32) >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleSeeded<T>(list: readonly T[], random: () => number): T[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const current = arr[i];
    arr[i] = arr[j] as T;
    arr[j] = current as T;
  }
  return arr;
}

/** Pick up to `count` distinct items; shuffle order when the pool is smaller than count. */
export function pickMemoryPhotos<T extends { id: string }>(
  pool: readonly T[],
  count: number,
  random: () => number,
): T[] {
  if (pool.length === 0 || count <= 0) return [];
  if (pool.length <= count) return [...pool];
  return shuffleSeeded([...pool], random).slice(0, count);
}

export function buildMemoryDeck(
  pool: readonly MemoryPhotoInput[],
  pairCount: number = MEMORY_PAIR_COUNT,
  seed?: number,
): MemoryCard[] {
  const effectiveSeed = seed ?? randomSeed();
  const random = mulberry32(effectiveSeed);
  const chosen = pickMemoryPhotos(pool, pairCount, random);
  const cards = chosen.flatMap((photo) => [
    { uid: `${photo.id}-a`, photoId: photo.id, src: photo.src, alt: photo.alt },
    { uid: `${photo.id}-b`, photoId: photo.id, src: photo.src, alt: photo.alt },
  ]);
  return shuffleSeeded(cards, random);
}

/** Stable fingerprint for tests: chosen ids (sorted) and deal order. */
export function memoryDeckLayout(deck: readonly MemoryCard[]): { photoIds: string[]; order: string[] } {
  const photoIds = [...new Set(deck.map((card) => card.photoId))].sort();
  return { photoIds, order: deck.map((card) => card.photoId) };
}

export function assertDeckPairs(deck: readonly MemoryCard[]): void {
  const counts = new Map<string, number>();
  for (const card of deck) {
    counts.set(card.photoId, (counts.get(card.photoId) ?? 0) + 1);
  }
  for (const count of counts.values()) {
    if (count !== 2) throw new Error(`Expected each photo twice, got counts ${JSON.stringify([...counts.entries()])}`);
  }
}

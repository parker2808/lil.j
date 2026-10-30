import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const {
  STORY_V2_MEMORY_SEED,
  MEMORY_PAIR_COUNT,
  buildMemoryDeck,
  memoryDeckLayout,
  assertDeckPairs,
} = await import("../src/lib/memory-deck.ts");

const raw = JSON.parse(readFileSync(new URL("../content.json", import.meta.url), "utf8"));
const pool = raw.eras.flatMap((era) =>
  era.photos.map((photo) => ({
    id: photo.id,
    src: photo.src,
    alt: era.title,
  })),
);

describe("memory deck", () => {
  it("uses different layouts for different seeds", () => {
    const a = memoryDeckLayout(buildMemoryDeck(pool, MEMORY_PAIR_COUNT, 1001));
    const b = memoryDeckLayout(buildMemoryDeck(pool, MEMORY_PAIR_COUNT, 2002));
    const samePhotos = JSON.stringify(a.photoIds) === JSON.stringify(b.photoIds);
    const sameOrder = JSON.stringify(a.order) === JSON.stringify(b.order);
    assert.equal(samePhotos && sameOrder, false);
  });

  it("repeats the same layout for the same seed", () => {
    const first = memoryDeckLayout(buildMemoryDeck(pool, MEMORY_PAIR_COUNT, STORY_V2_MEMORY_SEED));
    const second = memoryDeckLayout(buildMemoryDeck(pool, MEMORY_PAIR_COUNT, STORY_V2_MEMORY_SEED));
    assert.deepEqual(first, second);
  });

  it("deals exactly two of every chosen photo", () => {
    const deck = buildMemoryDeck(pool, MEMORY_PAIR_COUNT, STORY_V2_MEMORY_SEED);
    assert.equal(deck.length, MEMORY_PAIR_COUNT * 2);
    assertDeckPairs(deck);
    const { photoIds } = memoryDeckLayout(deck);
    assert.equal(photoIds.length, MEMORY_PAIR_COUNT);
  });
});

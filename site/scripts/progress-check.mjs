import assert from "node:assert/strict";

const store = new Map();
globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, String(value));
  },
  removeItem(key) {
    store.delete(key);
  },
};

const { FLOW, FLOW_V1, FLOW_V2, FLOW_V3, FLOW_VERSION, migrateIndex } = await import("../src/lib/flow.ts");
const { PROGRESS_KEY, clearProgress, emptyProgress, loadProgress, saveProgress } = await import("../src/lib/progress.ts");

assert.deepEqual([...FLOW_V1], ["gate", "sky", "birth", "gallery", "quiz", "counter", "cake", "wish", "letter"]);
assert.equal(FLOW_V1.length, 9);
assert.equal(FLOW_V2.length, 16);
assert.equal(FLOW_V2.includes("friends"), true);
assert.equal(FLOW_V3.length, 15);
assert.equal(FLOW_V3.includes("friends"), false);
assert.equal(FLOW_V2.indexOf("friends"), 11);
assert.deepEqual([...FLOW], [...FLOW_V3]);
assert.equal(FLOW_VERSION, 3);

function put(value) {
  store.set(PROGRESS_KEY, JSON.stringify(value));
}

function base(version, step, unlocked, extra = {}) {
  return {
    gateUnlocked: step > 0,
    envelopeOpened: false,
    openedChapters: ["stale"],
    flippedPhotos: [],
    erasViewed: [],
    scratched: ["card-a"],
    quiz: { q1: 0 },
    memoryBest: 8,
    dreamsDone: [],
    candlesOut: [0],
    saidYes: false,
    openWhen: { sad: "2026-10-01" },
    muted: true,
    step,
    unlocked,
    skyDone: false,
    birthSeen: false,
    counterSeen: false,
    friendsSeen: false,
    letterDone: false,
    wishes: [{ id: "w1", text: "stay", at: 1 }],
    flowVersion: version,
    ...extra,
  };
}

put(base(3, 8, 8));
const v3 = loadProgress();
assert.equal(v3.step, migrateIndex(3, 8));
assert.equal(FLOW[v3.step], "memory");
assert.equal(v3.memoryBest, 8);
assert.deepEqual(v3.scratched, ["card-a"]);
assert.deepEqual(v3.quiz, { q1: 0 });
assert.equal(v3.openWhen.sad, "2026-10-01");
assert.equal(v3.wishes[0].text, "stay");
assert.deepEqual(v3.candlesOut, [0]);
assert.equal(v3.muted, true);
assert.equal(v3.flowVersion, FLOW_VERSION);

put(base(2, FLOW_V2.indexOf("friends"), FLOW_V2.indexOf("friends")));
const fromFriends = loadProgress();
assert.equal(FLOW[fromFriends.step], "dreams");

put(base(2, FLOW_V2.indexOf("wish"), FLOW_V2.indexOf("wish")));
assert.equal(FLOW[loadProgress().step], "wish");

put(base(1, FLOW_V1.indexOf("wish"), FLOW_V1.indexOf("wish")));
assert.equal(FLOW[loadProgress().step], "wish");

put(base(1, FLOW_V1.indexOf("letter"), FLOW_V1.indexOf("letter")));
assert.equal(FLOW[loadProgress().step], "letter");

put(base(3, 4, 1));
const raised = loadProgress();
assert.equal(raised.step, 4);
assert.equal(raised.unlocked, 4);

put(base(3, 99, 99));
assert.equal(loadProgress().step, FLOW.length - 1);

store.set(PROGRESS_KEY, "{");
assert.deepEqual(loadProgress(), emptyProgress());

store.set(PROGRESS_KEY, "null");
assert.deepEqual(loadProgress(), emptyProgress());

store.set(PROGRESS_KEY, JSON.stringify(["nope"]));
const arrayRecord = loadProgress();
assert.equal(arrayRecord.step, 0);
assert.equal(arrayRecord.muted, false);
assert.equal(arrayRecord.flowVersion, FLOW_VERSION);

clearProgress();
assert.equal(store.has(PROGRESS_KEY), false);
assert.deepEqual(loadProgress(), emptyProgress());

const saved = { ...emptyProgress(), step: 2, unlocked: 2, gateUnlocked: true, muted: false };
saveProgress(saved);
assert.equal(JSON.parse(store.get(PROGRESS_KEY)).muted, false);
assert.equal(loadProgress().step, 2);

console.log("progress-check ok");

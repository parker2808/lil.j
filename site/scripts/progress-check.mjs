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

const { FLOW, FLOW_V1, FLOW_V2, FLOW_V3, FLOW_V4, FLOW_VERSION, mayContinue, stepDone } = await import("../src/lib/flow.ts");
const { PROGRESS_KEY, clearProgress, emptyProgress, loadProgress, moveTo, saveProgress, skipAhead } = await import("../src/lib/progress.ts");

assert.deepEqual([...FLOW_V1], ["gate", "sky", "birth", "gallery", "quiz", "counter", "cake", "wish", "letter"]);
assert.equal(FLOW_V1.length, 9);
assert.equal(FLOW_V2.length, 16);
assert.equal(FLOW_V2.includes("friends"), true);
assert.equal(FLOW_V3.length, 15);
assert.equal(FLOW_V3.includes("friends"), false);
assert.equal(FLOW_V2.indexOf("friends"), 11);
assert.deepEqual([...FLOW], [...FLOW_V4]);
assert.equal(FLOW_VERSION, 4);
assert.equal(FLOW.indexOf("memory"), 4);
assert.equal(FLOW.indexOf("wish"), 11);

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
assert.equal(v3.step, 4);
assert.equal(FLOW[v3.step], "memory");
assert.equal(v3.memoryBest, 8);
assert.deepEqual(v3.scratched, ["card-a"]);
assert.deepEqual(v3.quiz, { q1: 0 });
assert.equal(v3.openWhen.sad, "2026-10-01");
assert.equal(v3.wishes[0].text, "stay");
assert.deepEqual(v3.candlesOut, [0]);
assert.equal(v3.muted, true);
assert.equal(v3.flowVersion, 4);
assert.equal(v3.accessibleSteps.includes("memory"), true);
saveProgress(v3);
const reloaded = loadProgress();
saveProgress(reloaded);
const reloadedAgain = loadProgress();
assert.equal(reloaded.step, v3.step);
assert.deepEqual(reloaded.accessibleSteps, v3.accessibleSteps);
assert.equal(reloadedAgain.step, v3.step);
assert.deepEqual(reloadedAgain.accessibleSteps, v3.accessibleSteps);

put(base(3, 13, 13));
const wish = loadProgress();
assert.equal(wish.step, 11);
assert.equal(FLOW[wish.step], "wish");

put(base(3, 6, 6));
const cake = loadProgress();
assert.equal(FLOW[cake.step], "cake");
assert.equal(cake.accessibleSteps.includes("cake"), true);
assert.equal(cake.accessibleSteps.includes("quiz"), true);
assert.equal(cake.accessibleSteps.includes("counter"), true);
assert.equal(cake.accessibleSteps.includes("memory"), false);
assert.equal(cake.accessibleSteps.includes("scratch"), false);

put(base(2, FLOW_V2.indexOf("friends"), FLOW_V2.indexOf("friends")));
const fromFriends = loadProgress();
assert.equal(FLOW[fromFriends.step], "dreams");
assert.equal(fromFriends.accessibleSteps.includes("friends"), false);
assert.equal(fromFriends.accessibleSteps.includes("dreams"), true);

put(base(2, FLOW_V2.indexOf("wish"), FLOW_V2.indexOf("wish")));
assert.equal(FLOW[loadProgress().step], "wish");

put(base(1, FLOW_V1.indexOf("wish"), FLOW_V1.indexOf("wish")));
assert.equal(FLOW[loadProgress().step], "wish");

put(base(1, FLOW_V1.indexOf("letter"), FLOW_V1.indexOf("letter")));
assert.equal(FLOW[loadProgress().step], "letter");

put(base(3, 4, 1));
const kept = loadProgress();
assert.equal(FLOW[kept.step], "quiz");
assert.equal(kept.accessibleSteps.includes("quiz"), true);
assert.equal(kept.accessibleSteps.includes("sky"), true);
assert.equal(kept.accessibleSteps.includes("birth"), false);
assert.equal(kept.accessibleSteps.includes("gallery"), false);
assert.equal(kept.accessibleSteps.includes("memory"), false);

put(base(3, 99, 99));
assert.equal(FLOW[loadProgress().step], "letter");

const explicit = { ...base(4, FLOW.indexOf("cake"), 14), accessibleSteps: ["gate", "cake"] };
put(explicit);
const explicitLoaded = loadProgress();
assert.deepEqual(explicitLoaded.accessibleSteps, ["gate", "cake"]);
assert.equal(explicitLoaded.accessibleSteps.includes("memory"), false);
saveProgress(explicitLoaded);
assert.deepEqual(loadProgress().accessibleSteps, ["gate", "cake"]);

const futureRaw = JSON.stringify(base(9, 2, 2));
store.set(PROGRESS_KEY, futureRaw);
const future = loadProgress();
assert.equal(future.flowVersion, 9);
saveProgress(future);
assert.equal(store.get(PROGRESS_KEY), futureRaw);

let cursor = emptyProgress();
cursor = moveTo(cursor, 1, false, true);
cursor = moveTo(cursor, 1, false, true);
assert.equal(cursor.step, 1);
assert.equal(cursor.accessibleSteps.includes("birth"), false);

let locked = emptyProgress();
locked = moveTo(locked, 5, false, true);
assert.equal(locked.step, 0);
assert.deepEqual(locked.accessibleSteps, ["gate"]);

let opened = emptyProgress();
opened = moveTo(opened, 1, false, true);
opened = moveTo(opened, 2, false, true);
opened = moveTo(opened, 1, false, false);
assert.equal(opened.step, 1);
opened = moveTo(opened, 2, false, false);
assert.equal(opened.step, 2);
assert.equal(opened.birthSeen, false);
assert.equal(opened.memoryBest, null);

const jumped = moveTo(emptyProgress(), FLOW.indexOf("cake"), true, false);
assert.equal(FLOW[jumped.step], "cake");
assert.equal(jumped.accessibleSteps.includes("cake"), true);
assert.equal(jumped.accessibleSteps.includes("memory"), true);

store.set(PROGRESS_KEY, "{");
assert.deepEqual(loadProgress(), emptyProgress());

store.set(PROGRESS_KEY, "null");
assert.deepEqual(loadProgress(), emptyProgress());

store.set(PROGRESS_KEY, JSON.stringify(["nope"]));
assert.deepEqual(loadProgress(), emptyProgress());

clearProgress();
assert.equal(store.has(PROGRESS_KEY), false);
assert.deepEqual(loadProgress(), emptyProgress());

const saved = { ...emptyProgress(), step: 2, unlocked: 2, gateUnlocked: true, muted: false };
saveProgress(saved);
assert.equal(JSON.parse(store.get(PROGRESS_KEY)).muted, false);
assert.equal(loadProgress().step, 2);

function standing(id) {
  const step = FLOW.indexOf(id);
  return {
    ...emptyProgress(),
    step,
    unlocked: step,
    accessibleSteps: FLOW.slice(0, step + 1),
    gateUnlocked: true,
    memoryBest: null,
    scratched: [],
    openWhen: {},
  };
}

const memory = standing("memory");
const afterMemory = skipAhead(memory, "memory");
const memoryAgain = skipAhead(afterMemory, "memory");
assert.equal(afterMemory.memoryBest, null);
assert.deepEqual(afterMemory.scratched, []);
assert.deepEqual(afterMemory.openWhen, {});
assert.equal(afterMemory.skippedSteps.includes("memory"), true);
assert.equal(FLOW[afterMemory.step], "quiz");
assert.equal(memoryAgain.step, afterMemory.step);
assert.equal(memoryAgain.skippedSteps.includes("quiz"), false);
assert.equal(stepDone("memory", afterMemory, 5, [], [], []), false);
assert.equal(mayContinue("memory", afterMemory, 5, [], [], []), true);

const afterScratch = skipAhead(standing("scratch"), "scratch");
assert.deepEqual(afterScratch.scratched, []);
assert.equal(afterScratch.skippedSteps.includes("scratch"), true);
assert.equal(FLOW[afterScratch.step], "counter");

const afterLetters = skipAhead(standing("letters"), "letters");
assert.deepEqual(afterLetters.openWhen, {});
assert.equal(afterLetters.skippedSteps.includes("letters"), true);
assert.equal(FLOW[afterLetters.step], "cake");

console.log("progress-check ok");

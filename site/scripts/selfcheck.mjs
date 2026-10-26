import assert from "node:assert/strict";
import { stepDone } from "../src/lib/flow.ts";
import { elapsedParts, fillTemplate, formatZoned, nicknamesMatch, todayKey } from "../src/lib/pure.ts";
import { altAz, projectSky } from "../src/lib/stars.ts";

assert.equal(nicknamesMatch("  Bé   YÊU ", "bé yêu"), true);
assert.equal(nicknamesMatch("be yeu", "bé yêu"), false);
assert.equal(nicknamesMatch("bé yêu", "bé yêu"), true);

const parts = elapsedParts("2024-02-14T19:30:00+07:00", new Date("2024-02-15T19:30:05+07:00"));
assert.equal(parts.future, false);
assert.equal(parts.days, 1);
assert.equal(parts.hours, 0);
assert.equal(parts.minutes, 0);
assert.equal(parts.seconds, 5);

const future = elapsedParts("2026-01-02T00:00:00Z", new Date("2026-01-01T00:00:00Z"));
assert.equal(future.future, true);
assert.equal(future.days, 1);

assert.equal(fillTemplate("Đã bên nhau {days} ngày {hours} giờ", { days: 3, hours: 4 }), "Đã bên nhau 3 ngày 4 giờ");
assert.equal(todayKey(new Date(2026, 9, 5, 23, 30)), "2026-10-05");
assert.match(formatZoned("2002-08-18T21:30:00+07:00", "vi"), /21:30/);
assert.match(formatZoned("2002-08-18T21:30:00+07:00", "en"), /21:30/);

const born = new Date("2002-08-18T21:30:00+07:00");
const polaris = altAz(2.5303, 89.2642, 21.0278, 105.8342, born);
assert.ok(polaris.alt > 18 && polaris.alt < 24, `polaris alt ${polaris.alt}`);
assert.ok(polaris.az < 20 || polaris.az > 340, `polaris az ${polaris.az}`);
const sky = projectSky(21.0278, 105.8342, born);
const visible = sky.stars.filter((star) => star.visible);
assert.ok(visible.length >= 12, `visible stars ${visible.length}`);
assert.equal(visible.some((star) => star.id === "vega"), true);
assert.equal(visible.some((star) => star.id === "antares"), true);
assert.equal(sky.stars.find((star) => star.id === "rigel")?.visible, false);

const blank = {
  gateUnlocked: false,
  skyDone: false,
  birthSeen: false,
  flippedPhotos: [],
  quiz: {},
  counterSeen: false,
  candlesOut: [],
  envelopeOpened: false,
  memoryBest: null,
  scratched: [],
  openWhen: {},
  friendsSeen: false,
  dreamsDone: [],
  saidYes: false,
  wishes: [],
  letterDone: false,
};
assert.equal(stepDone("envelope", blank, 5, []), false);
assert.equal(stepDone("envelope", { ...blank, envelopeOpened: true }, 5, []), true);
assert.equal(stepDone("memory", blank, 5, []), false);
assert.equal(stepDone("memory", { ...blank, memoryBest: 6 }, 5, []), true);
assert.equal(stepDone("scratch", blank, 5, [], ["a", "b"]), false);
assert.equal(stepDone("scratch", { ...blank, scratched: ["a"] }, 5, [], ["a", "b"]), false);
assert.equal(stepDone("scratch", { ...blank, scratched: ["b", "a"] }, 5, [], ["a", "b"]), true);
assert.equal(stepDone("letters", { ...blank, openWhen: { sad: "today" } }, 5, [], [], ["sad", "miss"]), false);
assert.equal(stepDone("letters", { ...blank, openWhen: { sad: "today", miss: "today" } }, 5, [], [], ["sad", "miss"]), true);
assert.equal(stepDone("dreams", blank, 5, []), false);
assert.equal(stepDone("dreams", { ...blank, dreamsDone: ["d1"] }, 5, []), true);
assert.equal(stepDone("finale", blank, 5, []), false);
assert.equal(stepDone("finale", { ...blank, saidYes: true }, 5, []), true);
assert.equal(stepDone("quiz", { ...blank, quiz: { a: 0 } }, 5, ["a", "b"]), false);
assert.equal(stepDone("quiz", { ...blank, quiz: { a: 1, b: 0 } }, 5, ["a", "b"]), true);
assert.equal(stepDone("cake", { ...blank, candlesOut: [0, 1, 2, 2] }, 5, []), false);
assert.equal(stepDone("cake", { ...blank, candlesOut: [0, 1, 2, 3, 4] }, 5, []), true);
assert.equal(stepDone("wish", { ...blank, wishes: [{ text: "  " }] }, 1, []), false);
assert.equal(stepDone("wish", { ...blank, wishes: [{ text: "ở bên" }] }, 1, []), true);

console.log("selfcheck ok");

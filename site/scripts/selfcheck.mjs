import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FLOW, FLOW_V3, FLOW_VERSION, FLOW_WITH_FRIENDS, INCLUDE_FRIENDS, PREVIOUS_FLOW, migrateIndex, stepDone } from "../src/lib/flow.ts";
import { readLocale } from "../src/lib/i18n.ts";
import { cloudinarySrcSet, cloudinaryUrl } from "../src/lib/images.ts";
import { countdownParts, isBeforeUnlock, unlockTime } from "../src/lib/lock.ts";
import { nextTrackIndex } from "../src/lib/music.ts";
import { elapsedParts, fillTemplate, formatDotted, formatZoned, nicknamesMatch, todayKey } from "../src/lib/pure.ts";
import { altAz, projectSky } from "../src/lib/stars.ts";

const content = JSON.parse(readFileSync(new URL("../content.json", import.meta.url), "utf8"));

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
assert.equal(formatDotted("2023-04-02", "{d}.{m}.{y}"), "02.04.2023");
assert.equal(unlockTime("2026-11-18T00:00:00+07:00"), Date.UTC(2026, 10, 17, 17, 0, 0));
assert.equal(isBeforeUnlock("2026-11-18T00:00:00+07:00", Date.UTC(2026, 10, 17, 16, 59, 59)), true);
assert.equal(isBeforeUnlock("2026-11-18T00:00:00+07:00", Date.UTC(2026, 10, 17, 17, 0, 0)), false);
assert.deepEqual(countdownParts("2026-11-18T00:00:00+07:00", Date.UTC(2026, 10, 17, 16, 0, 0)), {
  days: 0,
  hours: 1,
  minutes: 0,
  seconds: 0,
});
assert.equal(content.lock.unlockAt, "2026-11-18T00:00:00+07:00");
assert.equal(content.startDate, "2026-07-01T00:00:00+07:00");
const togetherAtUnlock = elapsedParts(content.startDate, new Date("2026-11-18T00:00:00+07:00"));
assert.equal(togetherAtUnlock.future, false);
assert.equal(togetherAtUnlock.days, 140);
assert.equal(togetherAtUnlock.hours, 0);
assert.equal(togetherAtUnlock.minutes, 0);
assert.equal(new Date("2026-09-06T12:00:00+07:00").getUTCDay(), 0);
assert.equal(content.constellations.lyr.en, "Lyra");
assert.equal(content.ui.musicHint.en, "Tap for music");
assert.equal(content.music.credit, undefined);
assert.deepEqual(
  content.music.tracks.map((track) => (track.artist ? `${track.title} · ${track.artist}` : track.title)),
  [
    "From The Start · Laufey",
    "Bewitched · Laufey",
    "Valentine · Laufey",
    "Glue Song · beabadoobee",
    "Echoes of the Stars · sleepvolume",
    "Twinkle Twinkle Little Star (Grand Piano)",
  ],
);
assert.equal(content.music.birthday.title, "Happy Birthday Music Box Loop");
assert.equal(content.music.birthday.src, "/music/happy-birthday-music-box.mp3");
assert.equal(
  content.music.tracks.some((track) => track.src === content.music.birthday.src),
  false,
);
for (const track of [...content.music.tracks, content.music.birthday]) {
  assert.match(track.src, /^\/music\/.+\.mp3$/);
}
assert.equal(content.birth.when, "2002-11-18T16:45:00+07:00");
assert.match(formatZoned(content.birth.when, "en"), /16:45/);
assert.match(formatZoned(content.birth.when, "vi"), /16:45/);
for (let current = 0; current < 3; current += 1) {
  for (let n = 0; n < 20; n += 1) {
    const next = nextTrackIndex(3, current);
    assert.notEqual(next, current);
    assert.ok(next >= 0 && next < 3);
  }
}
assert.equal(nextTrackIndex(1, 0, () => 0.9), 0);
assert.equal(nextTrackIndex(3, 0, () => 0), 1);
assert.equal(nextTrackIndex(3, 0, () => 0.999), 2);
assert.equal(nextTrackIndex(3, 2, () => 0), 0);

const born = new Date("2002-08-18T21:30:00+07:00");
const polaris = altAz(2.5303, 89.2642, 21.0278, 105.8342, born);
assert.ok(polaris.alt > 18 && polaris.alt < 24, `polaris alt ${polaris.alt}`);
assert.ok(polaris.az < 20 || polaris.az > 340, `polaris az ${polaris.az}`);
const sky = projectSky(21.0278, 105.8342, born, content.constellations);
const birthSky = projectSky(content.birth.lat, content.birth.lon, new Date(content.birth.when), content.constellations);
const birthUp = new Set(birthSky.labels.map((label) => label.id));
for (const id of ["cas", "lyr", "cyg", "aql", "sco"]) assert.equal(birthUp.has(id), true, `${id} should be up`);
for (const id of ["ori", "tau", "aur"]) assert.equal(birthUp.has(id), false, `${id} should have set`);
assert.deepEqual(
  content.birth.notes.map((note) => note.id),
  ["cas", "lyr", "cyg", "aql"],
);
assert.equal(sky.labels.find((item) => item.id === "lyr")?.name.en, "Lyra");
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
assert.equal(readLocale(), "en");
assert.equal(stepDone("gallery", blank, 5, []), false);
assert.equal(stepDone("gallery", { ...blank, erasViewed: ["first"] }, 5, []), true);

assert.equal(cloudinaryUrl("/photos/01.svg", 720), "/photos/01.svg");
assert.equal(cloudinarySrcSet("/photos/01.svg", [360, 720]), undefined);
const remote = "https://res.cloudinary.com/demo/image/upload/v123/folder/a.jpg";
assert.equal(
  cloudinaryUrl(remote, 720),
  "https://res.cloudinary.com/demo/image/upload/c_limit,w_720/f_auto/q_auto/v123/folder/a.jpg",
);
const transformed = "https://res.cloudinary.com/demo/image/upload/c_limit,w_400/f_auto/q_auto/v123/folder/a.jpg";
assert.equal(
  cloudinaryUrl(transformed, 360),
  "https://res.cloudinary.com/demo/image/upload/c_limit,w_360/f_auto/q_auto/v123/folder/a.jpg",
);
assert.equal(
  cloudinaryUrl("https://res.cloudinary.com/demo/image/upload/w_photos/c_keep.jpg", 200),
  "https://res.cloudinary.com/demo/image/upload/c_limit,w_200/f_auto/q_auto/w_photos/c_keep.jpg",
);
assert.equal(
  cloudinaryUrl("lilj/care/01_IMG_4956", 720),
  "https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_720/f_auto/q_auto/lilj/care/01_IMG_4956",
);
assert.equal(
  cloudinarySrcSet("lilj/care/01_IMG_4956", [360, 720]),
  "https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_360/f_auto/q_auto/lilj/care/01_IMG_4956 360w, https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_720/f_auto/q_auto/lilj/care/01_IMG_4956 720w",
);
const eraPhotos = content.eras.flatMap((era) => era.photos);
assert.equal(eraPhotos.length, 39);
for (const photo of eraPhotos) {
  assert.equal(photo.date, undefined);
  assert.equal(photo.caption.vi, "");
  assert.equal(photo.caption.en, "");
  assert.match(photo.src, /^lilj\/(?:care|pout|surprise|ordinary|more)\/\d{2}_/);
}
assert.deepEqual(
  content.eras.flatMap((era) => era.photos.slice(0, 2).map((photo) => photo.id)).slice(0, 6),
  ["care-01", "care-02", "pout-01", "pout-02", "surprise-01", "surprise-02"],
);

assert.equal(INCLUDE_FRIENDS, false);
assert.equal(FLOW_VERSION, 4);
assert.equal(FLOW.length, 15);
assert.equal(FLOW.includes("friends"), false);
assert.equal(FLOW[4], "memory");
assert.equal(FLOW[11], "wish");
assert.equal(FLOW_WITH_FRIENDS.length, 16);
assert.equal(migrateIndex(3, 8), 4);
assert.equal(FLOW[migrateIndex(3, 8)], "memory");
assert.equal(migrateIndex(3, 13), 11);
assert.equal(FLOW[migrateIndex(3, 13)], "wish");
assert.equal(FLOW[migrateIndex(2, FLOW_WITH_FRIENDS.indexOf("friends"))], "dreams");
assert.equal(FLOW[migrateIndex(2, FLOW_WITH_FRIENDS.indexOf("wish"))], "wish");
assert.equal(FLOW[migrateIndex(2, FLOW_WITH_FRIENDS.indexOf("letter"))], "letter");
assert.equal(FLOW[migrateIndex(1, PREVIOUS_FLOW.indexOf("wish"))], "wish");
assert.equal(FLOW[migrateIndex(1, PREVIOUS_FLOW.indexOf("letter"))], "letter");
assert.equal(FLOW[migrateIndex(3, FLOW_V3.indexOf("letters"))], "letters");
assert.equal(migrateIndex(3, 0), 0);
assert.equal(migrateIndex(3, 99), FLOW.length - 1);
assert.equal(migrateIndex(4, 0), 0);
assert.equal(migrateIndex(4, 99), FLOW.length - 1);

console.log("selfcheck ok");

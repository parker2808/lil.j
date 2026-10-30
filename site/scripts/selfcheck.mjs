import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { FLOW, FLOW_V3, FLOW_VERSION, FLOW_WITH_FRIENDS, INCLUDE_FRIENDS, PREVIOUS_FLOW, migrateIndex, stepDone } from "../src/lib/flow.ts";
import { STORY_CHAPTERS, chapterFor } from "../src/lib/story.ts";
import { readLocale } from "../src/lib/i18n.ts";
import { eraAnchor, project, separatePoints } from "../src/lib/galaxy.ts";
import { cloudinarySrcSet, cloudinaryUrl } from "../src/lib/images.ts";
import { countdownParts, isBeforeUnlock, unlockTime } from "../src/lib/lock.ts";
import { nextTrackIndex } from "../src/lib/music.ts";
import { emptyProgress, skipAhead } from "../src/lib/progress.ts";
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
assert.equal(content.ui.musicHint.en, "Put some music on with me");
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
assert.equal(stepDone("wish", { ...blank, wishes: [], wishPrivate: true }, 1, []), true);
assert.equal(readLocale(), "vi");
{
  const store = new Map([["lilj.locale.v1", "en"]]);
  globalThis.localStorage = {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => store.set(key, value),
    removeItem: (key) => store.delete(key),
  };
  assert.equal(readLocale(), "en");
  store.set("lilj.locale.v1", "vi");
  assert.equal(readLocale(), "vi");
  store.delete("lilj.locale.v1");
  assert.equal(readLocale(), "vi");
}
const indexHtml = readFileSync(new URL("../index.html", import.meta.url), "utf8");
assert.match(indexHtml, /<html lang="vi">/);
const viteConfig = readFileSync(new URL("../vite.config.ts", import.meta.url), "utf8");
assert.match(viteConfig, /title\.vi/);
assert.match(viteConfig, /description\.vi/);
assert.equal(stepDone("sky", blank, 5, []), false);
assert.equal(stepDone("sky", { ...blank, skyDone: true }, 5, []), true);
assert.equal(stepDone("counter", blank, 5, []), false);
assert.equal(stepDone("counter", { ...blank, counterSeen: true }, 5, []), true);
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
const sampleId = "lilj/galaxy-v3/childhood/g-childhood-02cb6fb950";
assert.equal(
  cloudinaryUrl(sampleId, 720),
  `https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_720/f_auto/q_auto/${sampleId}`,
);
assert.equal(
  cloudinarySrcSet(sampleId, [360, 720]),
  `https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_360/f_auto/q_auto/${sampleId} 360w, https://res.cloudinary.com/oiounrmh/image/upload/c_limit,w_720/f_auto/q_auto/${sampleId} 720w`,
);
const eraPhotos = content.eras.flatMap((era) => era.photos);
assert.equal(content.eras.length, 13);
assert.equal(eraPhotos.length, 162);
assert.equal(content.memoryPhotoIds.length, 6);
assert.equal(new Set(content.memoryPhotoIds).size, 6);
assert.ok(content.memoryPhotoIds.every((id) => eraPhotos.some((photo) => photo.id === id)));
let filledCaptions = 0;
for (const era of content.eras) {
  assert.equal(era.date, undefined);
  era.photos.forEach((photo, index) => {
    assert.equal(photo.date, undefined);
    assert.equal(typeof photo.caption?.vi, "string");
    assert.equal(typeof photo.caption?.en, "string");
    assert.equal(Boolean(photo.caption.vi.trim()), Boolean(photo.caption.en.trim()), photo.id);
    assert.match(photo.src, /^lilj\/galaxy-v3\/[a-z0-9-]+\/[a-z0-9-]+$/);
    if (index === 0) {
      assert.ok(photo.caption.vi.trim(), photo.id);
      filledCaptions += 1;
    } else {
      assert.equal(photo.caption.vi, "");
      assert.equal(photo.caption.en, "");
    }
  });
}
assert.equal(filledCaptions, 13);
for (const [width, height] of [[398, 340], [398, 280]]) {
  for (let step = 0; step < 8; step += 1) {
    const spin = (step / 8) * Math.PI * 2;
    const camera = { spin, zoom: 1, focusX: 0, focusY: 0, parallaxX: 0, parallaxY: 0 };
    const anchors = content.eras.map((_, index) => eraAnchor(index, content.eras.length));
    const origin = project(0, 0, 0, camera, width, height);
    const points = anchors.map((anchor) => {
      const point = project(anchor.x, anchor.y, 0, camera, width, height);
      const vx = point.x - origin.x;
      const vy = point.y - origin.y;
      const len = Math.hypot(vx, vy) || 1;
      const halfW = 26;
      const halfH = 22;
      return {
        x: Math.min(width - halfW - 2, Math.max(halfW + 2, point.x + (vx / len) * 22)),
        y: Math.min(height - halfH - 2, Math.max(halfH + 2, point.y + (vy / len) * 22)),
        halfW,
        halfH,
      };
    });
    separatePoints(points, width, height);
    for (let i = 0; i < points.length; i += 1) {
      for (let j = i + 1; j < points.length; j += 1) {
        const overlapX = points[i].halfW + points[j].halfW + 4 - Math.abs(points[i].x - points[j].x);
        const overlapY = points[i].halfH + points[j].halfH + 4 - Math.abs(points[i].y - points[j].y);
        assert.ok(overlapX <= 0.6 || overlapY <= 0.6, `${width}x${height} spin ${spin.toFixed(2)}`);
      }
    }
  }
}
const togetherAtBirthday = elapsedParts("2026-07-01T00:00:00+07:00", new Date("2026-11-18T00:00:00+07:00"));
assert.equal(togetherAtBirthday.future, false);
assert.equal(togetherAtBirthday.days, 140);
assert.equal(togetherAtBirthday.hours, 0);
assert.equal(content.quiz.length, 5);
assert.deepEqual(
  content.quiz.map((question) => [question.id, question.answer]),
  [
    ["q1", 0],
    ["q2", 0],
    ["q3", 2],
    ["q4", 0],
    ["q5", 0],
  ],
);
assert.equal(content.scratches.length, 6);
assert.equal(content.firstMeeting, null);
assert.equal(content.birth.timeConfirmed, false);
assert.ok(content.birth.caption.vi.includes("minh họa"));
assert.equal(content.startDate, "2026-07-01T00:00:00+07:00");
assert.equal(content.finalLetter.date, "2026-11-18");
assert.equal(content.finalLetter.signature.vi, "Parker");
assert.equal(content.finalLetter.signature.en, "Parker");
const finaleLater = skipAhead({ ...emptyProgress(), step: 13, unlocked: 13, accessibleSteps: FLOW.slice(0, 14) }, "finale");
assert.equal(finaleLater.saidYes, false);
assert.equal(finaleLater.step, 14);
assert.deepEqual(finaleLater.skippedSteps, ["finale"]);
assert.equal(skipAhead(finaleLater, "finale").step, 14);
assert.equal(content.eras[0].title.vi, "Em hồi bé");
assert.equal(content.eras[12].title.vi, "Thử một kiểu khác");
assert.equal(content.galleryCopy.eraProgress.vi.startsWith("Chương "), true);
assert.equal(content.galleryCopy.eraProgress.en.startsWith("Chapter "), true);

assert.equal(STORY_CHAPTERS.length, 5);
assert.equal(chapterFor("gate"), "I");
assert.equal(chapterFor("memory"), "II");
assert.equal(chapterFor("letters"), "III");
assert.equal(chapterFor("wish"), "IV");
assert.equal(chapterFor("letter"), "V");
assert.equal(chapterFor("friends"), null);
for (const id of FLOW) assert.ok(chapterFor(id), id);
assert.equal(content.storyChapters.I.vi, "Một vũ trụ mang tên em");
assert.equal(content.storyChapters.V.en, "More ahead");

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

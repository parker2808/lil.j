import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";
import { FLOW } from "../src/lib/flow.ts";
import { STORY_V2_MEMORY_SEED } from "../src/lib/memory-deck.ts";
import { PROGRESS_KEY } from "../src/lib/progress.ts";

const content = JSON.parse(readFileSync(new URL("../content.json", import.meta.url), "utf8"));
const base = process.env.STORY_URL || "http://127.0.0.1:4173";
const devUrl = `${base}/?dev=1&seed=${STORY_V2_MEMORY_SEED}`;
const ownServer = !process.env.STORY_URL;
const results = [];

function note(name, detail) {
  results.push({ name, detail });
  console.log(`ok ${name}: ${detail}`);
}

function fail(name, detail) {
  throw new Error(`${name}: ${detail}`);
}

function chromePath() {
  return process.env.CHROME_PATH || "/usr/bin/google-chrome-stable";
}

function startPreview() {
  const child = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: new URL("..", import.meta.url),
    stdio: "ignore",
  });
  return child;
}

async function waitForServer() {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(base);
      if (response.status < 500) return;
    } catch {
      // booting
    }
    await delay(200);
  }
  fail("server", "preview did not start");
}

async function saved(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), PROGRESS_KEY);
}

async function currentStep(page) {
  return page.locator("[data-step]").first().getAttribute("data-step");
}

async function advance(page) {
  const from = await currentStep(page);
  const target = FLOW[FLOW.indexOf(from) + 1];
  if (!target) fail("advance", `no scene after ${from}`);
  await page.evaluate(() => {
    const button = document.querySelector(".sticky-next");
    if (button instanceof HTMLButtonElement) button.click();
  });
  try {
    await page.waitForSelector(`[data-step="${target}"]`, { timeout: 8000 });
  } catch {
    const step = await currentStep(page);
    const next = await page.locator(".sticky-next").count();
    fail("advance", `from ${from} stayed on ${step}, next buttons ${next}`);
  }
  await page.waitForFunction(() => !document.body.innerText.includes("Đang mở"));
}

async function prepare(page, locale = "vi") {
  await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
  await page.evaluate((nextLocale) => {
    localStorage.clear();
    localStorage.setItem("lilj.locale.v1", nextLocale);
  }, locale);
}

async function enterGate(page) {
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-step="gate"]');
  await page.locator("#nickname").fill(content.gate.password);
  await page.locator(".gate-go").click();
  await page.waitForSelector('[data-step="sky"]');
}

async function passSky(page) {
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passBirth(page) {
  await page.waitForSelector(".constellation-hit");
  const count = await page.locator(".constellation-hit").count();
  for (let index = 0; index < count; index += 1) {
    await page.locator(".constellation-hit").nth(index).click();
  }
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passGallery(page) {
  await page.locator(".era-legend button").first().click();
  await page.waitForSelector(".stack-deck");
  const presses = Math.max(0, content.eras[0].photos.length - 1);
  for (let index = 0; index < presses; index += 1) {
    await page.keyboard.press("ArrowRight");
    await delay(40);
  }
  await page.waitForFunction(() => {
    const raw = localStorage.getItem("lilj.progress.v1");
    return raw ? JSON.parse(raw).erasViewed.length > 0 : false;
  });
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function matchMemory(page) {
  await page.waitForSelector('[data-step="memory"]');
  const cards = await page.locator(".mem").count();
  if (cards === 0) {
    if (content.memoryPhotoIds.length !== 0) fail("memory", "deck is empty while memoryPhotoIds is set");
    await page.getByRole("button", { name: /Chơi sau|Play later/ }).click();
    await page.waitForSelector('[data-step="quiz"]');
    const record = await saved(page);
    if (record.memoryBest != null) fail("memory", "empty deck recorded a win");
    if (!record.skippedSteps.includes("memory")) fail("memory", "empty deck was not skipped");
    return;
  }
  for (let guard = 0; guard < 8; guard += 1) {
    const record = await saved(page);
    if (record.memoryBest != null) break;
    const src = await page.evaluate(() => {
      const groups = new Map();
      for (const card of document.querySelectorAll(".mem")) {
        if (card.classList.contains("is-matched")) continue;
        const photo = card.querySelector("img")?.getAttribute("src") ?? "";
        const button = card.querySelector("button.hit");
        if (!(button instanceof HTMLButtonElement) || button.disabled) continue;
        groups.set(photo, (groups.get(photo) ?? 0) + 1);
      }
      return [...groups.entries()].find(([, count]) => count >= 2)?.[0] ?? "";
    });
    if (!src) break;
    const cards = page.locator(".mem").filter({ has: page.locator(`img[src="${src}"]`) });
    await cards.nth(0).locator(".hit").click();
    await cards.nth(1).locator(".hit").click();
    await delay(80);
  }
  const record = await saved(page);
  if (record.memoryBest == null) fail("memory", "pairs did not finish");
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passQuiz(page) {
  await page.locator(".option").first().waitFor({ timeout: 5000 }).catch(async () => {
    const step = await currentStep(page);
    const record = await saved(page);
    const text = await page.locator(".stage").innerText();
    fail("quiz", `dom ${step} saved ${record.step} :: ${text.slice(0, 180).replace(/\s+/g, " ")}`);
  });
  for (let index = 0; index < content.quiz.length; index += 1) {
    await page.locator(".option").first().click();
    await page.locator(".sticky-next").click();
    await delay(30);
  }
  await page.locator(".sticky-next").click();
  await page.waitForSelector('[data-step="scratch"]');
}

async function scratchAll(page) {
  await page.waitForSelector(".scratch-canvas");
  await page.waitForFunction(() => !document.body.innerText.includes("Đang mở"));
  for (let guard = 0; guard < 8; guard += 1) {
    const record = await saved(page);
    if (record.scratched.length >= content.scratches.length) break;
    const canvas = page.locator(".scratch-canvas").first();
    if ((await canvas.count()) === 0) break;
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    if (!box) break;
    for (let y = 12; y < box.height - 8; y += 18) {
      await page.mouse.move(box.x + 8, box.y + y);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width - 8, box.y + y, { steps: 12 });
      await page.mouse.up();
    }
    await delay(40);
  }
  const record = await saved(page);
  if (record.scratched.length < content.scratches.length) fail("scratch", `revealed ${record.scratched.length}`);
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passCounter(page) {
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passDreams(page) {
  await page.locator(".dreams input").first().check();
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function openLetters(page) {
  const count = await page.locator(".seal-card").count();
  for (let index = 0; index < count; index += 1) {
    await page.locator(".seal-card").nth(index).click();
    await page.waitForSelector(".sheet");
    await page.keyboard.press("Escape");
    await page.waitForSelector(".sheet", { state: "detached" });
  }
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function passCake(page) {
  await page.locator(".candle").first().waitFor();
  const candles = page.locator(".candle");
  const count = await candles.count();
  for (let index = 0; index < count; index += 1) await candles.nth(index).click();
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function sendWish(page) {
  await page.locator(".wish-field input").fill("ở bên");
  await page.locator(".wish-go").click();
  await page.locator(".sticky-next").waitFor();
  const record = await saved(page);
  if (record.wishes.length === 0) fail("wish", "wish was not stored");
  await advance(page);
}

async function openEnvelope(page) {
  await page.locator(".wax").click();
  await page.locator(".sticky-next").waitFor();
  const record = await saved(page);
  if (!record.envelopeOpened) fail("envelope", "invitation did not open");
  if (await page.getByRole("button", { name: /Nhận lời|Accept the invitation/ }).count()) {
    fail("envelope", "an RSVP button is showing");
  }
  await advance(page);
}

async function sayYes(page) {
  await page.getByRole("button", { name: /Em đồng ý|I'd love to/ }).click();
  const record = await saved(page);
  if (!record.saidYes) fail("finale", "yes did not record");
  await page.locator(".sticky-next").waitFor();
  await advance(page);
}

async function finishLetter(page) {
  await page.waitForSelector(".letter-sign");
  await page.waitForSelector(".letter-constellation");
  if ((await page.locator(".sticky-next").count()) !== 0) fail("letter", "Next is showing after the letter");
  const date = await page.locator(".letter-date").getAttribute("datetime");
  if (date !== "2026-11-18") fail("letter", `date ${date}`);
  const signature = await page.locator(".letter-sign").innerText();
  if (signature.trim() !== "Parker") fail("letter", "signature");
}

async function fullPlay(page) {
  await prepare(page);
  await enterGate(page);
  await passSky(page);
  await passBirth(page);
  await passGallery(page);
  await matchMemory(page);
  await passQuiz(page);
  await scratchAll(page);
  await passCounter(page);
  await passDreams(page);
  await openLetters(page);
  await passCake(page);
  await sendWish(page);
  await openEnvelope(page);
  await sayYes(page);
  await finishLetter(page);
  const first = await saved(page);
  const expectedSkip = content.memoryPhotoIds.length === 0 ? ["memory"] : [];
  if (first.step !== 14 || JSON.stringify(first.skippedSteps) !== JSON.stringify(expectedSkip)) {
    fail("full", JSON.stringify({ step: first.step, skipped: first.skippedSteps }));
  }
  await page.reload({ waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  const again = await saved(page);
  if (again.step !== first.step) fail("reload", `step ${again.step}`);
  note("full-play", "gate to letter, reload twice stays on the letter");
}

async function skipPlay(page) {
  await prepare(page);
  await enterGate(page);
  await passSky(page);
  await passBirth(page);
  await passGallery(page);
  await page.getByRole("button", { name: /Chơi sau|Play later/ }).click();
  await page.waitForSelector('[data-step="quiz"]');
  const afterMemory = await saved(page);
  if (afterMemory.memoryBest != null) fail("skip-memory", "memoryBest was written");
  if (!afterMemory.skippedSteps.includes("memory")) fail("skip-memory", "memory was not skipped");
  await passQuiz(page);
  await page.getByRole("button", { name: /Khám phá sau|Explore later/ }).click();
  await page.waitForSelector('[data-step="counter"]');
  const afterScratch = await saved(page);
  if (afterScratch.scratched.length !== 0) fail("skip-scratch", "scratched was written");
  await passCounter(page);
  await passDreams(page);
  await page.getByRole("button", { name: /Để dành những lá thư|Save the letters/ }).click();
  await page.waitForSelector('[data-step="cake"]');
  const afterLetters = await saved(page);
  if (Object.keys(afterLetters.openWhen).length !== 0) fail("skip-letters", "openWhen was written");
  await passCake(page);
  await page.getByRole("button", { name: /Giữ điều ước|Keep this wish/ }).click();
  const afterWish = await saved(page);
  if (afterWish.wishes.length !== 0 || afterWish.wishPrivate !== true) fail("private-wish", "wish record changed");
  if ((await page.locator(".wish-read").innerText()).trim()) fail("private-wish", "sent line is showing");
  await page.locator(".sticky-next").click();
  await page.waitForSelector('[data-step="envelope"]');
  await openEnvelope(page);
  const later = page.getByRole("button", { name: /^Để sau$|^Later$/ });
  const place = () => later.evaluate((el) => `${el.style.left}|${el.style.top}`);
  let moved = false;
  for (let attempt = 0; attempt < 4 && !moved; attempt += 1) {
    const before = await place();
    const box = await later.boundingBox();
    if (!box) fail("finale-dodge", "later has no box");
    await page.mouse.move(box.x + box.width / 2, box.y + 8);
    await delay(40);
    moved = (await place()) !== before;
  }
  if (!moved) fail("finale-dodge", "later stayed put");
  await later.click();
  await page.waitForFunction(() => document.querySelector("[data-step]")?.getAttribute("data-step") === "finale");
  await page.getByRole("button", { name: /Em đồng ý|I'd love to/ }).click();
  await page.locator(".sticky-next").waitFor();
  await advance(page);
  const afterFinale = await saved(page);
  if (!afterFinale.saidYes) fail("skip-finale", "yes was not recorded");
  await finishLetter(page);
  note("skip-play", "memory, scratch, letters skipped; finale dodge does not navigate");
}

function historical(version, step, unlocked) {
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
  };
}

async function migrate(page) {
  await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
  const raw = historical(3, 8, 8);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: PROGRESS_KEY, value: raw });
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-step="memory"]');
  const once = await saved(page);
  if (once.step !== 4 || FLOW[once.step] !== "memory") fail("migrate-v3", `step ${once.step}`);
  if (once.memoryBest !== 8 || once.wishes[0]?.text !== "stay") fail("migrate-v3", "interaction data changed");
  await page.reload({ waitUntil: "networkidle" });
  await page.reload({ waitUntil: "networkidle" });
  const twice = await saved(page);
  if (twice.step !== once.step || JSON.stringify(twice.accessibleSteps) !== JSON.stringify(once.accessibleSteps)) {
    fail("migrate-v3", "reload moved the save");
  }

  const cake = historical(3, 6, 6);
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: PROGRESS_KEY, value: cake });
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  const cakeSaved = await saved(page);
  if (cakeSaved.accessibleSteps.includes("memory")) fail("migrate-cake", "cake granted memory");

  const future = { ...historical(9, 2, 2), marker: "keep-future" };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: PROGRESS_KEY, value: future });
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  await delay(200);
  const kept = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
  if (!kept?.includes("keep-future") || !kept.includes('"flowVersion":9')) fail("migrate-future", "future save was overwritten");

  await page.evaluate((key) => localStorage.setItem(key, "[1,2,3]"), PROGRESS_KEY);
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  const empty = await saved(page);
  if (empty.step !== 0 || empty.flowVersion !== 4) fail("migrate-corrupt", "corrupt storage was not empty");
  note("migration", "v3 memory, cake without memory, future version, corrupt array");
}

async function locks(browser) {
  const unlockAt = Date.parse(content.lock.unlockAt);
  async function visit(now) {
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      reducedMotion: "reduce",
    });
    if (now != null) {
      await context.addInitScript((stamp) => {
        const fixed = stamp;
        Date.now = () => fixed;
      }, now);
    }
    const page = await context.newPage();
    await page.goto(base, { waitUntil: "domcontentloaded" });
    await page.evaluate(() => localStorage.clear());
    await page.goto(base, { waitUntil: "networkidle" });
    const step = await currentStep(page);
    const lock = await page.locator(".lock-scene").count();
    await context.close();
    return { step, lock };
  }
  const before = await visit(null);
  if (before.lock !== 1) fail("lock-before", "countdown is missing");
  const at = await visit(unlockAt);
  if (at.lock !== 0 || at.step !== "gate") fail("lock-at", JSON.stringify(at));
  const after = await visit(unlockAt + 60_000);
  if (after.lock !== 0 || after.step !== "gate") fail("lock-after", JSON.stringify(after));
  note("lock", "before shows the countdown, at and after open the gate");
}

async function locales(page) {
  await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.removeItem("lilj.locale.v1"));
  await page.reload({ waitUntil: "networkidle" });
  const fresh = await page.locator('.lang button[aria-pressed="true"]').innerText();
  if (fresh !== "VI") fail("locale", `default ${fresh}`);
  await page.evaluate(() => localStorage.setItem("lilj.locale.v1", "en"));
  await page.reload({ waitUntil: "networkidle" });
  const english = await page.locator('.lang button[aria-pressed="true"]').innerText();
  if (english !== "EN") fail("locale", `saved ${english}`);
  note("locale", "default VI, saved EN stays");
}

async function audio(page) {
  const flow = FLOW;
  const step = flow.indexOf("cake");
  const record = {
    gateUnlocked: true,
    envelopeOpened: false,
    openedChapters: [],
    flippedPhotos: [],
    erasViewed: ["care"],
    scratched: [],
    quiz: {},
    memoryBest: null,
    dreamsDone: [],
    candlesOut: [0, 1, 2, 3, 4],
    saidYes: false,
    openWhen: {},
    muted: true,
    step,
    unlocked: step,
    accessibleSteps: flow.slice(0, step + 1),
    skippedSteps: [],
    wishPrivate: false,
    skyDone: true,
    birthSeen: true,
    counterSeen: true,
    friendsSeen: false,
    letterDone: false,
    wishes: [],
    flowVersion: 4,
  };
  await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
  await page.evaluate((value) => {
    localStorage.setItem("lilj.locale.v1", "vi");
    localStorage.setItem("lilj.progress.v1", JSON.stringify(value));
  }, record);
  await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
  await page.waitForSelector('[data-step="cake"]');
  await page.locator(".music").click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("lilj.progress.v1")).muted === false);
  await page.locator(".sticky-next").click();
  await page.waitForSelector('[data-step="wish"]');
  if ((await saved(page)).muted !== false) fail("audio", "wish reset mute");
  await page.locator(".dev-jump button").nth(12).click();
  await page.waitForSelector('[data-step="envelope"]');
  if ((await saved(page)).muted !== false) fail("audio", "envelope reset mute");
  note("audio", "unmute on the cake is still off on the wish and the envelope");
}

async function journey(page) {
  await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
  const record = await saved(page);
  const accessible = record.accessibleSteps;
  await page.getByRole("button", { name: /Hành trình|Journey/ }).click();
  await page.waitForSelector("#journey-menu");
  const focused = await page.evaluate(() => document.activeElement?.getAttribute("aria-current"));
  if (focused !== "step") fail("journey", "current scene was not focused");
  await page.keyboard.press("Escape");
  await page.waitForSelector("#journey-menu", { state: "detached" });
  const back = await page.evaluate(() => document.activeElement?.getAttribute("aria-label"));
  if (back !== "Hành trình" && back !== "Journey") fail("journey", `focus returned to ${back}`);
  const after = await saved(page);
  if (JSON.stringify(after.accessibleSteps) !== JSON.stringify(accessible)) fail("journey", "menu changed access");
  note("a11y", "journey menu focuses the current scene, Escape returns, access stays");
}

async function chapterList(browser) {
  const views = [
    { name: "430x932", width: 430, height: 932, top: "59px", bottom: "34px", left: "0px", right: "0px" },
    { name: "430x739", width: 430, height: 739, top: "59px", bottom: "34px", left: "0px", right: "0px" },
  ];
  for (const view of views) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    await context.addInitScript((safe) => {
      const apply = () => {
        const root = document.documentElement;
        if (!root) return;
        root.style.setProperty("--safe-top", safe.top);
        root.style.setProperty("--safe-bottom", safe.bottom);
        root.style.setProperty("--safe-left", safe.left);
        root.style.setProperty("--safe-right", safe.right);
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    }, view);
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
    const record = historical(4, FLOW.indexOf("gallery"), FLOW.indexOf("gallery"));
    record.accessibleSteps = FLOW.slice(0, FLOW.indexOf("gallery") + 1);
    record.gateUnlocked = true;
    record.flowVersion = 4;
    await page.evaluate(({ key, value }) => {
      localStorage.setItem("lilj.locale.v1", "vi");
      localStorage.setItem(key, JSON.stringify(value));
    }, { key: PROGRESS_KEY, value: record });
    await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
    await page.waitForSelector(".era-legend button");
    const names = await page.locator(".era-legend-name").allInnerTexts();
    if (names.length !== 13) fail(`legend-${view.name}`, `rows ${names.length}`);
    if (names[0] !== "Em hồi bé" || names[12] !== "Thử một kiểu khác") {
      fail(`legend-${view.name}`, names.join(" | "));
    }
    await page.waitForFunction(() => {
      const button = document.querySelector(".cluster");
      return button instanceof HTMLElement && button.style.transform.includes("translate");
    });
    const clusters = await page.evaluate(() => {
      const boxes = [...document.querySelectorAll(".cluster")].map((node) => node.getBoundingClientRect());
      let overlaps = 0;
      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const ix = Math.min(boxes[i].right, boxes[j].right) - Math.max(boxes[i].left, boxes[j].left);
          const iy = Math.min(boxes[i].bottom, boxes[j].bottom) - Math.max(boxes[i].top, boxes[j].top);
          if (ix > 2 && iy > 2) overlaps += 1;
        }
      }
      return { count: boxes.length, overlaps };
    });
    if (clusters.count !== 13 || clusters.overlaps !== 0) {
      fail(`clusters-${view.name}`, JSON.stringify(clusters));
    }
    const fit = await page.evaluate(() => {
      const stage = document.querySelector(".stage");
      const row = document.querySelectorAll(".era-legend button")[12];
      const footer = document.querySelector("footer");
      if (!(stage instanceof HTMLElement) || !(row instanceof HTMLElement) || !(footer instanceof HTMLElement)) return null;
      stage.scrollTop = stage.scrollHeight;
      const rowBox = row.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      const fade = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--stage-fade")) || 0;
      return {
        rowTop: rowBox.top,
        rowBottom: rowBox.bottom,
        rowHeight: rowBox.height,
        stageTop: stageBox.top,
        stageBottom: stageBox.bottom,
        footerTop: footerBox.top,
        fade,
        canScroll: stage.scrollHeight > stage.clientHeight + 1,
      };
    });
    if (!fit) fail(`legend-${view.name}`, "missing stage");
    if (!fit.canScroll) fail(`legend-${view.name}`, "list does not scroll");
    if (fit.rowHeight < 44) fail(`legend-${view.name}`, `row height ${fit.rowHeight}`);
    if (fit.rowTop < fit.stageTop - 1) fail(`legend-${view.name}`, `row above stage ${JSON.stringify(fit)}`);
    if (fit.rowBottom > fit.footerTop + 1) fail(`legend-${view.name}`, `row under footer ${JSON.stringify(fit)}`);
    if (fit.rowBottom > fit.stageBottom - fit.fade + 1) fail(`legend-${view.name}`, `row in fade ${JSON.stringify(fit)}`);
    await page.locator(".era-legend button").first().click();
    await page.waitForSelector(".stack-caption");
    const caption = (await page.locator(".stack-caption").innerText()).replace(/\s+/g, " ").trim();
    if (!caption.startsWith("Tóc buộc hai bên")) fail(`caption-${view.name}`, caption);
    const captionFit = await page.evaluate(() => {
      const stage = document.querySelector(".stage");
      const node = document.querySelector(".stack-caption");
      if (!(stage instanceof HTMLElement) || !(node instanceof HTMLElement)) return null;
      node.scrollIntoView({ block: "nearest" });
      const box = node.getBoundingClientRect();
      const stageBox = stage.getBoundingClientRect();
      return { top: box.top, bottom: box.bottom, stageTop: stageBox.top, stageBottom: stageBox.bottom, height: box.height };
    });
    if (!captionFit || captionFit.height < 20) fail(`caption-${view.name}`, "caption has no box");
    if (captionFit.top < captionFit.stageTop - 1 || captionFit.bottom > captionFit.stageBottom + 1) {
      fail(`caption-${view.name}`, JSON.stringify(captionFit));
    }
    const progress = await page.locator(".stack-count").innerText();
    if (!progress.includes("Chương")) fail(`caption-${view.name}`, progress);
    await context.close();
  }
  note("legend", "row 13 scrolls clear of the footer at 430x932 and 430x739");
}

async function layouts(browser) {
  const views = [
    { name: "320x568", width: 320, height: 568, top: "47px", bottom: "34px", left: "0px", right: "0px" },
    { name: "390x844", width: 390, height: 844, top: "47px", bottom: "34px", left: "0px", right: "0px" },
    { name: "430x932", width: 430, height: 932, top: "59px", bottom: "34px", left: "0px", right: "0px" },
    { name: "430x739", width: 430, height: 739, top: "59px", bottom: "34px", left: "0px", right: "0px" },
    { name: "844x390", width: 844, height: 390, top: "0px", bottom: "21px", left: "47px", right: "47px" },
    { name: "1280x800", width: 1280, height: 800, top: "0px", bottom: "0px", left: "0px", right: "0px" },
  ];
  for (const view of views) {
    const context = await browser.newContext({
      viewport: { width: view.width, height: view.height },
      isMobile: view.width < 500,
      hasTouch: view.width < 500,
      reducedMotion: "reduce",
    });
    await context.addInitScript((safe) => {
      const apply = () => {
        const root = document.documentElement;
        if (!root) return;
        root.style.setProperty("--safe-top", safe.top);
        root.style.setProperty("--safe-bottom", safe.bottom);
        root.style.setProperty("--safe-left", safe.left);
        root.style.setProperty("--safe-right", safe.right);
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    }, view);
    const page = await context.newPage();
    await page.goto(`${devUrl}`, { waitUntil: "domcontentloaded" });
    const record = historical(4, 14, 14);
    record.accessibleSteps = [...FLOW];
    record.letterDone = true;
    record.gateUnlocked = true;
    record.flowVersion = 4;
    await page.evaluate(({ key, value }) => {
      localStorage.setItem("lilj.locale.v1", "vi");
      localStorage.setItem(key, JSON.stringify(value));
    }, { key: PROGRESS_KEY, value: record });
    await page.goto(`${devUrl}`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-step="letter"]');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 2) fail(`layout-${view.name}`, `horizontal overflow ${overflow}`);
    await context.close();
  }
  note("layout", views.map((view) => view.name).join(", "));
}

async function main() {
  const preview = ownServer ? startPreview() : null;
  const browser = await chromium.launch({
    executablePath: chromePath(),
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });
  try {
    await waitForServer();
    const context = await browser.newContext({
      viewport: { width: 430, height: 932 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    await context.addInitScript(() => {
      const apply = () => {
        const root = document.documentElement;
        if (!root) return;
        root.style.setProperty("--safe-top", "59px");
        root.style.setProperty("--safe-bottom", "34px");
        root.style.setProperty("--safe-left", "0px");
        root.style.setProperty("--safe-right", "0px");
      };
      apply();
      document.addEventListener("DOMContentLoaded", apply);
    });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await migrate(page);
    await locales(page);
    await fullPlay(page);
    await journey(page);
    await skipPlay(page);
    await context.close();
    const audioContext = await browser.newContext({
      viewport: { width: 430, height: 932 },
      isMobile: true,
      hasTouch: true,
      reducedMotion: "reduce",
    });
    await audioContext.addInitScript(() => {
      HTMLMediaElement.prototype.play = () => Promise.resolve();
    });
    const audioPage = await audioContext.newPage();
    audioPage.setDefaultTimeout(20000);
    await audio(audioPage);
    await audioContext.close();
    await locks(browser);
    await chapterList(browser);
    await layouts(browser);
    console.log(JSON.stringify({ ok: true, results }, null, 2));
  } finally {
    await browser.close();
    preview?.kill();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

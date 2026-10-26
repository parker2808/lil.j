import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";
import { FLOW, FLOW_VERSION } from "../src/lib/flow.ts";

const content = JSON.parse(readFileSync(new URL("../content.json", import.meta.url), "utf8"));

const VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x667", width: 375, height: 667 },
  { name: "390x844", width: 390, height: 844 },
  { name: "430x932", width: 430, height: 932 },
  { name: "844x390", width: 844, height: 390 },
];

const pickedViews = (process.env.OVERLAP_VIEWPORTS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const viewports = pickedViews.length ? VIEWPORTS.filter((item) => pickedViews.includes(item.name)) : VIEWPORTS;
const locales = (process.env.OVERLAP_LOCALES || "vi,en").split(",").map((item) => item.trim()).filter(Boolean);
const devModes = (process.env.OVERLAP_DEV || "1,0").split(",").map((item) => item.trim()).filter(Boolean);
const states = (process.env.OVERLAP_STATES || "done,pending").split(",").map((item) => item.trim()).filter(Boolean);
const onlySteps = (process.env.OVERLAP_STEPS || "").split(",").map((item) => item.trim()).filter(Boolean);

const base = process.env.OVERLAP_URL || "http://127.0.0.1:4173";
const ownServer = !process.env.OVERLAP_URL;

function safeFor(viewport) {
  if (viewport.width > viewport.height) return { top: "0px", bottom: "21px", left: "47px", right: "47px" };
  return { top: "47px", bottom: "34px", left: "0px", right: "0px" };
}

function progressFor(stepIndex, done) {
  const quiz = {};
  if (done) {
    for (const question of content.quiz) quiz[question.id] = question.answer;
  }
  const candles = Math.max(1, Math.min(8, content.cake.candles || 5));
  return {
    gateUnlocked: done || stepIndex > 0,
    envelopeOpened: done,
    openedChapters: [],
    flippedPhotos: done ? [content.photos[0].id] : [],
    scratched: done ? content.scratches.map((card) => card.id) : [],
    quiz,
    memoryBest: done ? 8 : null,
    dreamsDone: done ? [content.dreams[0].id] : [],
    candlesOut: done ? Array.from({ length: candles }, (_, index) => index) : [],
    saidYes: done,
    openWhen: done ? Object.fromEntries(content.openWhen.map((letter) => [letter.id, "2026-10-26"])) : {},
    muted: true,
    step: stepIndex,
    unlocked: FLOW.length - 1,
    skyDone: done,
    birthSeen: done,
    counterSeen: done,
    friendsSeen: false,
    letterDone: done,
    wishes: done
      ? [{ id: "overlap-wish", text: "A long wish that must stay on the sky and wrap instead of running off the screen", at: 1 }]
      : [],
    flowVersion: FLOW_VERSION,
  };
}

function chromePath() {
  const candidates = [process.env.CHROME_PATH, "/usr/bin/google-chrome-stable", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);
  const found = candidates.find((path) => existsSync(path));
  if (!found) throw new Error("Could not find Chrome. Set CHROME_PATH.");
  return found;
}

async function waitForServer(url) {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.status < 500) return;
    } catch {
      // The preview server is still booting.
    }
    await delay(250);
  }
  throw new Error(`Nothing answered at ${url}`);
}

function startPreview() {
  const child = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
    cwd: fileURLToPath(new URL("..", import.meta.url)),
    stdio: "ignore",
  });
  return child;
}

async function settle(page, step) {
  await page.evaluate(() => Promise.race([document.fonts?.ready ?? Promise.resolve(), new Promise((resolve) => setTimeout(resolve, 1200))]));
  await page.waitForFunction(
    (id) => {
      const pane = document.querySelector(`[data-step="${id}"]`);
      const header = document.querySelector(".chrome");
      const footer = document.querySelector(".flow");
      if (!pane || !header) return false;
      const root = getComputedStyle(document.documentElement);
      const headerH = parseFloat(root.getPropertyValue("--header-h"));
      const footerH = parseFloat(root.getPropertyValue("--footer-h"));
      const headerOk = Math.abs(header.offsetHeight - headerH) < 1.5;
      const footerHidden = !footer || getComputedStyle(footer).display === "none";
      const footerOk = footerHidden ? footerH === 0 : Math.abs(footer.offsetHeight - footerH) < 1.5;
      if (!headerOk || !footerOk) return false;
      const chromeBox = header.getBoundingClientRect();
      const stageBox = document.querySelector(".stage")?.getBoundingClientRect();
      if (!stageBox) return false;
      if (stageBox.top < chromeBox.bottom - 1) return false;
      if (!footerHidden) {
        const footerBox = footer.getBoundingClientRect();
        if (footerBox.top < stageBox.bottom - 1) return false;
      }
      return true;
    },
    step,
    { timeout: 8000 },
  );
}

async function audit(page, label) {
  const found = await page.evaluate((where) => {
    const failures = [];
    const rootStyle = getComputedStyle(document.documentElement);
    const safe = {
      top: parseFloat(rootStyle.getPropertyValue("--safe-top")) || 0,
      right: parseFloat(rootStyle.getPropertyValue("--safe-right")) || 0,
      bottom: parseFloat(rootStyle.getPropertyValue("--safe-bottom")) || 0,
      left: parseFloat(rootStyle.getPropertyValue("--safe-left")) || 0,
    };
    const keyboard = document.documentElement.classList.contains("keyboard-open");
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    function boxOf(el) {
      const rect = el.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
    }

    function intersection(a, b) {
      const left = Math.max(a.left, b.left);
      const top = Math.max(a.top, b.top);
      const right = Math.min(a.right, b.right);
      const bottom = Math.min(a.bottom, b.bottom);
      if (right - left <= 2 || bottom - top <= 2) return null;
      return { left, top, right, bottom, width: right - left, height: bottom - top };
    }

    function describe(el) {
      const cls = typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 3).join(".") : "";
      const text = (el.innerText || el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 48);
      return `${el.tagName.toLowerCase()}${cls ? "." + cls : ""}${text ? ` "${text}"` : ""}`;
    }

    function clips(style, axis) {
      const value = axis === "x" ? style.overflowX : style.overflowY;
      return value === "hidden" || value === "clip" || value === "auto" || value === "scroll";
    }

    function scrolls(style, axis) {
      const value = axis === "x" ? style.overflowX : style.overflowY;
      return value === "auto" || value === "scroll";
    }

    function visibleBox(el) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") return null;
      let box = boxOf(el);
      if (box.width < 2 || box.height < 2) return null;
      const fixed = style.position === "fixed";
      if (!fixed) {
        let node = el.parentElement;
        while (node && node !== document.body) {
          const parentStyle = getComputedStyle(node);
          const bounds = boxOf(node);
          const next = { ...box };
          if (clips(parentStyle, "x")) {
            next.left = Math.max(box.left, bounds.left);
            next.right = Math.min(box.right, bounds.right);
          }
          if (clips(parentStyle, "y")) {
            next.top = Math.max(box.top, bounds.top);
            next.bottom = Math.min(box.bottom, bounds.bottom);
          }
          if (next.right - next.left < 2 || next.bottom - next.top < 2) return null;
          box = { ...next, width: next.right - next.left, height: next.bottom - next.top };
          node = node.parentElement;
        }
      }
      return intersection(box, { left: 0, top: 0, right: vw, bottom: vh, width: vw, height: vh });
    }

    function unscrollableClip(el) {
      const rect = boxOf(el);
      if (rect.width < 2 || rect.height < 2) return 0;
      let worst = 0;
      let handledX = false;
      let handledY = false;
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const style = getComputedStyle(node);
        const bounds = boxOf(node);
        if (!handledX && clips(style, "x")) {
          const over = Math.max(0, bounds.left - rect.left, rect.right - bounds.right);
          if (scrolls(style, "x")) handledX = true;
          else worst = Math.max(worst, over);
        }
        if (!handledY && clips(style, "y")) {
          const over = Math.max(0, bounds.top - rect.top, rect.bottom - bounds.bottom);
          if (scrolls(style, "y")) handledY = true;
          else worst = Math.max(worst, over);
        }
        if (handledX && handledY) break;
        node = node.parentElement;
      }
      return worst;
    }

    function push(kind, detail) {
      failures.push({ kind, detail, where });
    }

    if (document.documentElement.scrollWidth > vw + 2 || document.body.scrollWidth > vw + 2) {
      push("page-overflow", `scrollWidth ${Math.max(document.documentElement.scrollWidth, document.body.scrollWidth)} > ${vw}`);
    }

    const chrome = document.querySelector(".chrome");
    const footer = document.querySelector(".flow");
    const stage = document.querySelector(".stage");
    const regions = [chrome, footer].filter((el) => el && getComputedStyle(el).display !== "none");

    if (stage) {
      const stageBox = boxOf(stage);
      for (const region of regions) {
        const hit = intersection(stageBox, boxOf(region));
        if (hit) push("stage-overlap", `${region.className} by ${Math.round(hit.width)}×${Math.round(hit.height)}`);
      }
      if (stageBox.left < safe.left - 2 || stageBox.right > vw - safe.right + 2) {
        push("stage-safe", `stage ${Math.round(stageBox.left)}–${Math.round(stageBox.right)} outside safe ${safe.left}–${vw - safe.right}`);
      }
    }

    const sheet = document.querySelector(".sheet-backdrop");
    if (sheet) {
      const sheetBox = boxOf(sheet);
      for (const region of regions) {
        const hit = intersection(sheetBox, boxOf(region));
        if (hit) push("sheet-overlap", `${region.className} by ${Math.round(hit.width)}×${Math.round(hit.height)}`);
      }
    }

    if (keyboard) {
      const flow = document.querySelector(".flow");
      if (flow && getComputedStyle(flow).display !== "none") push("keyboard-footer", "bottom bar still visible");
      const field = document.activeElement;
      if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) {
        push("keyboard-field", "text field is not focused");
      } else if (!visibleBox(field)) {
        push("keyboard-field", "focused field is clipped");
      }
    }

    const contentNodes = [...document.querySelectorAll("button, a, input, textarea, select, label, h1, h2, h3, p, li, figcaption, svg text")].filter((el) => {
      if (el.closest(".sr-only, .starfield, .chrome, .flow")) return false;
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    for (const el of contentNodes) {
      const visible = visibleBox(el);
      if (!visible) continue;
      for (const region of regions) {
        const hit = intersection(visible, boxOf(region));
        if (hit) push("overlap", `${describe(el)} ∩ ${region.className} ${Math.round(hit.width)}×${Math.round(hit.height)}`);
      }
      const interactive = /BUTTON|A|INPUT|TEXTAREA|SELECT/.test(el.tagName);
      if (interactive) {
        if (visible.left < safe.left - 2) push("safe-left", describe(el));
        if (visible.right > vw - safe.right + 2) push("safe-right", describe(el));
        if (visible.top < safe.top - 2) push("safe-top", describe(el));
        if (!keyboard && visible.bottom > vh - safe.bottom + 2) push("safe-bottom", describe(el));
      }
    }

    for (const region of regions) {
      const items = [...region.querySelectorAll("button, a, input, textarea, p, h1, h2")].filter((el) => !el.closest(".sr-only") && visibleBox(el));
      for (let i = 0; i < items.length; i += 1) {
        for (let j = i + 1; j < items.length; j += 1) {
          if (items[i].contains(items[j]) || items[j].contains(items[i])) continue;
          const hit = intersection(visibleBox(items[i]), visibleBox(items[j]));
          if (hit) push("chrome-overlap", `${describe(items[i])} ∩ ${describe(items[j])}`);
        }
      }
    }

    const textNodes = [...document.querySelectorAll("h1, h2, h3, p, li, figcaption, button, label, span, svg text")].filter((el) => {
      if (el.closest(".sr-only, .starfield")) return false;
      const text = (el.innerText || el.textContent || "").trim();
      if (!text) return false;
      const style = getComputedStyle(el);
      return style.display !== "none" && style.visibility !== "hidden";
    });

    for (const el of textNodes) {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) continue;
      const style = getComputedStyle(el);
      if (el.clientWidth > 0 && el.scrollWidth - el.clientWidth > 4) {
        if (style.overflowX !== "auto" && style.overflowX !== "scroll") {
          push("text-overflow-x", `${describe(el)} ${el.scrollWidth - el.clientWidth}px`);
        }
      }
      if (el.clientHeight > 0 && el.scrollHeight - el.clientHeight > 4 && (style.overflowY === "hidden" || style.overflowY === "clip")) {
        push("text-clip-y", describe(el));
      }
      const clip = unscrollableClip(el);
      const interactive = /BUTTON|A|INPUT|TEXTAREA|SELECT/.test(el.tagName);
      if (clip > (interactive ? 8 : 4)) push("text-clipped", `${describe(el)} by ${Math.round(clip)}px`);
    }

    return failures.slice(0, 8);
  }, label);
  return found;
}

async function scrollAudit(page, label) {
  const top = await audit(page, `${label} @top`);
  await page.evaluate(() => {
    const stage = document.querySelector(".stage");
    if (stage) stage.scrollTop = stage.scrollHeight;
  });
  await delay(30);
  const bottom = await audit(page, `${label} @bottom`);
  await page.evaluate(() => {
    const stage = document.querySelector(".stage");
    if (stage) stage.scrollTop = 0;
  });
  return [...top, ...bottom];
}

async function extras(page, id, label) {
  const found = [];
  if (id === "quiz" && (await page.locator(".quiz-note").count()) === 0 && (await page.locator(".quiz .btn").count()) > 0) {
    await page.locator(".quiz .btn").click();
    await page.waitForSelector(".quiz-note", { timeout: 2000 }).catch(() => {});
    found.push(...(await scrollAudit(page, `${label} quiz-note`)));
  }
  if (id === "birth" && (await page.locator(".constellation-hit").count()) > 0) {
    await page.locator(".constellation-hit").first().click({ timeout: 3000 });
    await page.waitForSelector(".chart-float", { timeout: 2000 }).catch(() => {});
    found.push(...(await scrollAudit(page, `${label} chart-label`)));
  }
  if (id === "letters" && (await page.locator(".seal-card").count()) > 0) {
    await page.locator(".seal-card").first().click();
    await page.waitForSelector(".sheet", { timeout: 2000 });
    found.push(...(await scrollAudit(page, `${label} sheet`)));
    await page.keyboard.press("Escape");
    await page.waitForSelector(".sheet", { state: "detached", timeout: 2000 }).catch(() => {});
  }
  if (id === "wish" && (await page.locator(".wish-star").count()) > 0) {
    await page.locator(".wish-star").first().click();
    found.push(...(await scrollAudit(page, `${label} wish-star`)));
  }
  if (id === "gate" || id === "wish") {
    const field = page.locator(id === "gate" ? ".gate input" : ".wish-pill input");
    await field.focus();
    await page.waitForFunction(() => document.documentElement.classList.contains("keyboard-open"));
    await page.waitForFunction(() => getComputedStyle(document.querySelector(".flow")).display === "none");
    await delay(120);
    found.push(...(await audit(page, `${label} keyboard`)));
    await field.blur();
    await page.waitForFunction(() => !document.documentElement.classList.contains("keyboard-open"));
  }
  return found;
}

async function main() {
  let preview;
  if (ownServer) preview = startPreview();
  const failures = [];
  let checked = 0;
  try {
    await waitForServer(base);
    const browser = await chromium.launch({
      executablePath: chromePath(),
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
    try {
      for (const viewport of viewports) {
        const context = await browser.newContext({
          viewport: { width: viewport.width, height: viewport.height },
          reducedMotion: "reduce",
        });
        await context.addInitScript((safe) => {
          const apply = () => {
            const root = document.documentElement;
            if (!root) return;
            root.style.setProperty("--safe-top", safe.top);
            root.style.setProperty("--safe-right", safe.right);
            root.style.setProperty("--safe-bottom", safe.bottom);
            root.style.setProperty("--safe-left", safe.left);
          };
          apply();
          if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", apply);
          else apply();
        }, safeFor(viewport));
        const page = await context.newPage();
        await page.goto(base, { waitUntil: "domcontentloaded" });
        for (const locale of locales) {
          for (const dev of devModes) {
            for (const state of states) {
              const done = state === "done";
              for (let index = 0; index < FLOW.length; index += 1) {
                const id = FLOW[index];
                if (onlySteps.length && !onlySteps.includes(id)) continue;
                const label = `${viewport.name} ${locale} dev=${dev} ${state} ${id}`;
                await page.evaluate(
                  ({ progress, locale: nextLocale }) => {
                    localStorage.setItem("lilj.progress.v1", JSON.stringify(progress));
                    localStorage.setItem("lilj.locale.v1", nextLocale);
                  },
                  { progress: progressFor(index, done), locale },
                );
                await page.goto(`${base}/${dev === "1" ? "?dev=1" : ""}`, { waitUntil: "domcontentloaded" });
                await settle(page, id);
                const found = [...(await scrollAudit(page, label)), ...(await extras(page, id, label))];
                checked += 1;
                if (found.length) {
                  failures.push(...found);
                  console.log(`FAIL ${label}`);
                  for (const item of found) console.log(`  ${item.kind}: ${item.detail} (${item.where})`);
                  if (failures.length === found.length) await page.screenshot({ path: "/tmp/overlap-fail.png", fullPage: false });
                }
                if (checked % 30 === 0) console.log(`… ${checked} cases, ${failures.length} failures`);
                if (failures.length >= 24) break;
              }
              if (failures.length >= 24) break;
            }
            if (failures.length >= 24) break;
          }
          if (failures.length >= 24) break;
        }
        await context.close();
        if (failures.length >= 24) break;
      }
    } finally {
      await browser.close();
    }
  } finally {
    if (preview) preview.kill("SIGTERM");
  }

  const summary = {
    ok: failures.length === 0,
    cases: checked,
    viewports: viewports.map((item) => item.name),
    locales,
    dev: devModes,
    states,
    steps: onlySteps.length ? onlySteps : [...FLOW],
    failures: failures.length,
  };
  console.log(JSON.stringify(summary, null, 2));
  if (failures.length) {
    console.log("overlap failed");
    process.exit(1);
  }
  console.log("overlap ok");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

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
  { name: "507x768", width: 507, height: 768 },
  { name: "678x1024", width: 678, height: 1024 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "744x1133", width: 744, height: 1133 },
  { name: "1133x744", width: 1133, height: 744 },
  { name: "820x1180", width: 820, height: 1180 },
  { name: "1180x820", width: 1180, height: 820 },
  { name: "1024x1366", width: 1024, height: 1366 },
  { name: "1366x1024", width: 1366, height: 1024 },
  { name: "1280x800", width: 1280, height: 800 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

const pickedViews = (process.env.OVERLAP_VIEWPORTS || "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);
const baseViewports = pickedViews.length ? VIEWPORTS.filter((item) => pickedViews.includes(item.name)) : VIEWPORTS;
const toolbarOffsets = (process.env.OVERLAP_TOOLBAR || "0,80")
  .split(",")
  .map((item) => Number(item.trim()))
  .filter((item) => Number.isFinite(item) && item >= 0);
function deviceKind(width, height) {
  const short = Math.min(width, height);
  const long = Math.max(width, height);
  if (short <= 430 && long <= 940) return "phone";
  if (width >= 1200 && height <= 1100 && width / height >= 1.5) return "desktop";
  if (width >= 500 && width <= 700) return "split";
  return "ipad";
}

const viewports = baseViewports.flatMap((viewport) => {
  const kind = deviceKind(viewport.width, viewport.height);
  const bars = kind === "phone" ? (toolbarOffsets.length ? toolbarOffsets : [0]) : [0];
  return bars.map((bar) => ({
    name: bar > 0 ? `${viewport.name}-bar${bar}` : viewport.name,
    width: viewport.width,
    height: Math.max(240, viewport.height - bar),
    kind,
  }));
});
const locales = (process.env.OVERLAP_LOCALES || "vi,en").split(",").map((item) => item.trim()).filter(Boolean);
const devModes = (process.env.OVERLAP_DEV || "1,0").split(",").map((item) => item.trim()).filter(Boolean);
const states = (process.env.OVERLAP_STATES || "done,pending").split(",").map((item) => item.trim()).filter(Boolean);
const onlySteps = (process.env.OVERLAP_STEPS || "").split(",").map((item) => item.trim()).filter(Boolean);

const base = process.env.OVERLAP_URL || "http://127.0.0.1:4173";
const ownServer = !process.env.OVERLAP_URL;

function safeFor(viewport) {
  const kind = viewport.kind || deviceKind(viewport.width, viewport.height);
  if (kind === "phone") {
    if (viewport.width > viewport.height) return { top: "0px", bottom: "21px", left: "47px", right: "47px" };
    return { top: "47px", bottom: "34px", left: "0px", right: "0px" };
  }
  if (kind === "ipad") return { top: "24px", bottom: "20px", left: "0px", right: "0px" };
  return { top: "0px", bottom: "0px", left: "0px", right: "0px" };
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

    const doc = document.documentElement;
    if (doc.scrollWidth > doc.clientWidth + 1) {
      push("page-overflow", `document scrollWidth ${doc.scrollWidth} > clientWidth ${doc.clientWidth}`);
    }
    if (document.body.scrollWidth > document.body.clientWidth + 1) {
      push("page-overflow", `body scrollWidth ${document.body.scrollWidth} > clientWidth ${document.body.clientWidth}`);
    }
    const app = document.getElementById("root");
    if (app && app.scrollWidth > app.clientWidth + 1) {
      push("page-overflow", `root scrollWidth ${app.scrollWidth} > clientWidth ${app.clientWidth}`);
    }
    if (doc.scrollWidth > vw + 2 || document.body.scrollWidth > vw + 2) {
      push("page-overflow", `scrollWidth ${Math.max(doc.scrollWidth, document.body.scrollWidth)} > ${vw}`);
    }

    const scroller = document.scrollingElement;
    if (scroller && scroller.scrollHeight > vh + 1) {
      push("document-scroll", `scrollHeight ${scroller.scrollHeight} > ${vh}`);
    }
    if (window.scrollY !== 0 || document.documentElement.scrollTop !== 0 || document.body.scrollTop !== 0) {
      push(
        "document-scroll",
        `scrollY ${window.scrollY} html ${document.documentElement.scrollTop} body ${document.body.scrollTop}`,
      );
    }

    const chrome = document.querySelector(".chrome");
    const footer = document.querySelector(".flow");
    const stage = document.querySelector(".stage");
    const regions = [chrome, footer].filter((el) => el && getComputedStyle(el).display !== "none");

    const nextBtn = document.querySelector(".sticky-next");
    const stepName = document.querySelector("[data-step]")?.getAttribute("data-step") || "";
    const pending = /\bpending\b/.test(where);
    const passive = stepName === "sky" || stepName === "counter" || stepName === "friends";
    const noNext = stepName === "gate" || stepName === "letter";
    const expectNext = !noNext && (!pending || passive);
    if (document.querySelector(".stage-dock")) push("footer-compact", "dock is still in the layout");
    if (keyboard && nextBtn) {
      const nextStyle = getComputedStyle(nextBtn);
      const parentHidden = nextBtn.closest(".flow") && getComputedStyle(nextBtn.closest(".flow")).display === "none";
      if (!parentHidden && nextStyle.display !== "none" && nextBtn.getBoundingClientRect().height > 1) {
        push("sticky-next", "visible while keyboard is open");
      }
    }
    if (!keyboard && stage) {
      const stageStyle = getComputedStyle(stage);
      const pad = parseFloat(stageStyle.paddingBottom) || 0;
      if (pad < 28) push("stage-fade", `padding-bottom ${Math.round(pad)}px`);
      const mask = stageStyle.maskImage || stageStyle.webkitMaskImage || "";
      if (!mask || mask === "none") push("stage-fade", "missing mask");
    }
    const footerShown = footer && getComputedStyle(footer).display !== "none";
    const nextShown = Boolean(
      nextBtn && getComputedStyle(nextBtn).display !== "none" && nextBtn.getBoundingClientRect().height > 1 &&
        !(nextBtn.closest(".flow") && getComputedStyle(nextBtn.closest(".flow")).display === "none"),
    );
    if (!keyboard && expectNext && !nextShown) push("sticky-next", "missing on a ready step");
    if (!keyboard && !expectNext && nextShown) push("sticky-next", "shown before the step is done");
    if (nextShown && nextBtn?.disabled) push("sticky-next", "rendered disabled");
    if (!keyboard && footerShown) {
      const expectedPad = Math.max(16, safe.bottom + 8);
      const expected = 44 + expectedPad;
      if (Math.abs(footer.offsetHeight - expected) > 2) {
        push("footer-compact", `height ${Math.round(footer.offsetHeight)} expected ${Math.round(expected)}`);
      }
      const flowStyle = getComputedStyle(footer);
      if (flowStyle.flexDirection !== "row") push("footer-compact", `direction ${flowStyle.flexDirection}`);
    }
    if (!keyboard && footerShown && nextBtn) {
      const nextBox = boxOf(nextBtn);
      if (nextBox.width < 2 || nextBox.height < 2) {
        push("sticky-next", "missing box");
      } else {
        if (nextBtn.closest(".flow") !== footer) push("footer-compact", "next sits outside the footer row");
        for (const region of regions) {
          if (region === footer) continue;
          const hit = intersection(nextBox, boxOf(region));
          if (hit) push("sticky-next", `${region.className} by ${Math.round(hit.width)}×${Math.round(hit.height)}`);
        }
        const copy = document.querySelector(".flow-copy");
        if (copy) {
          const hit = intersection(nextBox, boxOf(copy));
          if (hit && hit.width > 1 && hit.height > 1) {
            push("sticky-next", `flow-copy by ${Math.round(hit.width)}×${Math.round(hit.height)}`);
          }
        }
        const footerBox = boxOf(footer);
        const padBottom = parseFloat(getComputedStyle(footer).paddingBottom) || 0;
        const contentBottom = footerBox.bottom - padBottom;
        const contentMid = (footerBox.top + contentBottom) / 2;
        const nextMid = (nextBox.top + nextBox.bottom) / 2;
        if (Math.abs(contentMid - nextMid) > 3) {
          push("sticky-next", `off center by ${Math.round(nextMid - contentMid)}px`);
        }
        if (footerBox.right - safe.right - nextBox.right > 20) {
          push("sticky-next", `not on the right, gap ${Math.round(footerBox.right - nextBox.right)}px`);
        }
        const interactives = [...document.querySelectorAll("button, a, input, textarea, select")].filter((el) => {
          if (el === nextBtn || el.closest(".flow, .sr-only")) return false;
          const style = getComputedStyle(el);
          return style.display !== "none" && style.visibility !== "hidden";
        });
        for (const el of interactives) {
          const visible = visibleBox(el);
          if (!visible) continue;
          const hit = intersection(visible, nextBox);
          if (hit) push("sticky-next", `${describe(el)} by ${Math.round(hit.width)}×${Math.round(hit.height)}`);
        }
        if (nextBox.left < safe.left - 2 || nextBox.right > vw - safe.right + 2) {
          push("sticky-next", `safe x ${Math.round(nextBox.left)}–${Math.round(nextBox.right)}`);
        }
      }
    }

    if (footer && getComputedStyle(footer).display !== "none") {
      const flowStyle = getComputedStyle(footer);
      const bg = flowStyle.backgroundColor;
      if (bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") push("footer-clear", `background ${bg}`);
      if (flowStyle.backgroundImage && flowStyle.backgroundImage !== "none") {
        push("footer-clear", `image ${flowStyle.backgroundImage.slice(0, 60)}`);
      }
      const blur = flowStyle.backdropFilter || flowStyle.getPropertyValue("-webkit-backdrop-filter");
      if (blur && blur !== "none") push("footer-clear", `backdrop ${blur}`);
      const padTop = parseFloat(flowStyle.paddingTop) || 0;
      const padBottom = parseFloat(flowStyle.paddingBottom) || 0;
      const expectedPad = Math.max(16, safe.bottom + 8);
      if (Math.abs(padBottom - expectedPad) > 2) {
        push("footer-clear", `pad-bottom ${Math.round(padBottom)} expected ${Math.round(expectedPad)}`);
      }
      if (padTop > 2) push("footer-clear", `pad-top ${Math.round(padTop)}`);
    }

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

    const hero = document.querySelector(".odo-hero");
    const live = document.querySelector(".odo-live");
    if (hero && stage) {
      const style = getComputedStyle(hero);
      const numeric = `${style.fontVariantNumeric} ${style.fontFeatureSettings}`;
      if (!numeric.includes("tabular-nums") && !numeric.includes("tnum")) {
        push("counter-digits", "hero is not tabular");
      }
      if (style.whiteSpace !== "nowrap" || style.flexWrap === "wrap") {
        push("counter-digits", "hero can wrap");
      }
      const heroBox = boxOf(hero);
      const stageBox = boxOf(stage);
      if (heroBox.left < stageBox.left - 1 || heroBox.right > stageBox.right + 1) {
        push("counter-digits", `hero outside stage ${Math.round(heroBox.left)}–${Math.round(heroBox.right)}`);
      }
      if (hero.scrollHeight > hero.clientHeight + 4) {
        push("counter-digits", `hero wrapped ${hero.scrollHeight - hero.clientHeight}px`);
      }
      for (const num of hero.querySelectorAll(".odo-num")) {
        const numeral = getComputedStyle(num);
        if (numeral.whiteSpace !== "nowrap") push("counter-digits", "numeral can wrap");
        const windowEl = num.closest(".odo-window");
        if (windowEl && num.scrollWidth > windowEl.clientWidth + 1) {
          push("counter-digits", `numeral wider than window ${num.scrollWidth}>${windowEl.clientWidth}`);
          break;
        }
      }
    }
    if (live && stage) {
      const liveStyle = getComputedStyle(live);
      if (liveStyle.flexWrap === "wrap" || liveStyle.whiteSpace !== "nowrap") {
        push("counter-digits", "live row can wrap");
      }
      const liveBox = boxOf(live);
      const stageBox = boxOf(stage);
      if (liveBox.width >= 2 && (liveBox.left < stageBox.left - 1 || liveBox.right > stageBox.right + 1)) {
        push("counter-digits", `live outside stage ${Math.round(liveBox.left)}–${Math.round(liveBox.right)}`);
      }
      if (live.scrollWidth - live.clientWidth > 2) {
        push("counter-digits", `live overflow ${live.scrollWidth - live.clientWidth}px`);
      }
      for (const label of live.querySelectorAll(".odo-live-label")) {
        const labelStyle = getComputedStyle(label);
        if (labelStyle.whiteSpace !== "nowrap") push("counter-digits", "label can wrap");
        if (label.clientHeight > 0 && label.scrollHeight > label.clientHeight + 4) {
          push("counter-digits", `label wrapped ${(label.textContent || "").trim()}`);
        }
      }
    }
    if (document.querySelector(".clock, .together .sentence")) {
      push("counter-digits", "old clock or duplicate sentence is still in the counter");
    }

    const touch = /\b(507x768|678x1024|768x1024|1024x768|744x1133|1133x744|820x1180|1180x820|1024x1366|1366x1024)\b/.test(where);
    if (touch && !keyboard) {
      const targets = [...document.querySelectorAll("button, a, input, textarea")].filter((el) => {
        if (el.closest(".dev-jump, .sr-only, .starfield")) return false;
        const style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0;
      });
      for (const el of targets) {
        const visible = visibleBox(el);
        if (!visible) continue;
        if (visible.width < 42 || visible.height < 42) {
          push("touch-target", `${describe(el)} ${Math.round(visible.width)}×${Math.round(visible.height)}`);
          break;
        }
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
    const field = page.locator(id === "gate" ? ".gate input" : ".wish-field input");
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

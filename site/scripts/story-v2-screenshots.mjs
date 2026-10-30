import { spawn } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright-core";

import { STORY_V2_MEMORY_SEED } from "../src/lib/memory-deck.ts";

const content = JSON.parse(readFileSync(new URL("../content.json", import.meta.url), "utf8"));
const qaSeed = STORY_V2_MEMORY_SEED;
const url = process.env.STORY_URL || "http://127.0.0.1:4173";
const output = new URL("../qa-screenshots/", import.meta.url);
mkdirSync(output, { recursive: true });
const server = process.env.STORY_URL ? null : spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  cwd: new URL("..", import.meta.url), stdio: "ignore",
});
const paths = ["gate","sky","birth","gallery","memory","quiz","scratch","counter","dreams","letters","cake","wish","envelope","finale","letter"];
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || "/usr/bin/google-chrome-stable", args: ["--no-sandbox", "--disable-dev-shm-usage"] });
const context = await browser.newContext({ viewport: {width:430,height:932}, deviceScaleFactor:3, isMobile:true, hasTouch:true, reducedMotion:"reduce" });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const report = [];

async function memoryCardsFullyVisible(page) {
  return page.evaluate(() => {
    const pad = 1;
    const view = { w: window.innerWidth, h: window.innerHeight };
    const cards = [...document.querySelectorAll('[data-step="memory"] .mem')];
    if (cards.length !== 12) return { ok: false, reason: `expected 12 cards, got ${cards.length}` };
    for (const card of cards) {
      const box = card.getBoundingClientRect();
      if (box.width <= 0 || box.height <= 0) return { ok: false, reason: "zero-size card" };
      if (box.top < pad || box.left < pad || box.bottom > view.h - pad || box.right > view.w - pad) {
        return {
          ok: false,
          reason: `clip ${Math.round(box.top)},${Math.round(box.left)},${Math.round(box.bottom)},${Math.round(box.right)} in ${view.w}x${view.h}`,
        };
      }
    }
    return { ok: true };
  });
}

async function auditMemoryLayout(page, label, viewport) {
  await page.setViewportSize(viewport);
  await page.waitForSelector('[data-step="memory"]');
  await delay(200);
  const result = await memoryCardsFullyVisible(page);
  report.push({ name: `memory-layout-${label}`, passed: result.ok, detail: result.reason ?? "ok" });
  if (!result.ok) throw new Error(`Memory layout ${label}: ${result.reason}`);
}

try {
  let ready = false;
  for (let i=0;i<60;i++) {
    try { const r=await fetch(url); if(r.ok){ready=true;break;} } catch {}
    await delay(300);
  }
  if (!ready) throw new Error("preview server did not respond");
  await page.goto(`${url}/?dev=1&seed=${qaSeed}`, {waitUntil:"domcontentloaded"});
  await page.evaluate(() => {localStorage.clear();localStorage.setItem("lilj.locale.v1","vi")});
  await page.reload({waitUntil:"domcontentloaded"});
  await page.waitForSelector('[data-step="gate"]');
  const shoot = async (name) => {
    const file = new URL(name+".png",output);
    await page.screenshot({path:file.pathname,fullPage:true,animations:"disabled"});
    const root = await page.evaluate(() => ({
      step:document.querySelector("[data-step]")?.getAttribute("data-step"),
      width:document.documentElement.clientWidth,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      error:document.querySelector("[role=alert]")?.textContent?.slice(0,120) || null
    }));
    report.push({name,...root});
  };
  await shoot("01-gate");
  await page.locator("#nickname").fill(content.gate.password);
  await page.locator(".gate-go").click();
  await page.waitForSelector('[data-step="sky"]');
  for(let i=1;i<15;i++){
    const target=paths[i];
    await page.locator('.dev-jump button').nth(i).click();
    await page.waitForSelector('[data-step="'+target+'"]');
    await delay(300);
    await shoot(String(i+1).padStart(2,"0")+"-"+target);
    if(target==="memory"){
      const count=await page.locator(".mem").count();
      report.push({name:"memory-deck",cards:count,expect:12,passed:count===12});
      const cards=page.locator(".mem .hit");
      let toastShown=false;
      for (let i=0;i<12 && !toastShown;i++) {
        for (let j=i+1;j<12;j++) {
          await cards.nth(i).click();
          await cards.nth(j).click();
          toastShown=await page.locator(".memory-toast.is-visible").waitFor({timeout:1200}).then(()=>true).catch(()=>false);
          if (toastShown) break;
          await delay(750);
        }
      }
      report.push({name:"memory-match-toast",passed:toastShown});
      if (!toastShown) throw new Error("Memory match toast did not appear");
      await auditMemoryLayout(page, "390x844", { width: 390, height: 844 });
      await auditMemoryLayout(page, "1440x900", { width: 1440, height: 900 });
      await page.setViewportSize({ width: 430, height: 932 });
    }
    if(target==="wish"){
      await page.locator(".wish-field input").focus();
      await page.evaluate(()=>document.documentElement.classList.add("keyboard-open"));
      await delay(200);
      await shoot("12-wish-keyboard-open");
      await page.evaluate(()=>document.documentElement.classList.remove("keyboard-open"));
    }
    if(target==="finale"){
      const later=page.locator(".no-btn");
      await page.mouse.move(0, 0);
      const before=await later.evaluate((el) => `${el.style.left}|${el.style.top}`);
      const box=await later.boundingBox();
      if (!box) throw new Error("Finale Later button is not visible");
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForFunction(
        ({ selector, start }) => {
          const el = document.querySelector(selector);
          if (!el) return false;
          const style = `${el.style.left}|${el.style.top}`;
          const tease = document.querySelector(".finale-tease")?.textContent?.trim();
          return style !== start && Boolean(tease);
        },
        { selector: ".no-btn", start: before },
      );
      const after=await later.evaluate((el) => `${el.style.left}|${el.style.top}`);
      const tease=(await page.locator(".finale-tease").innerText()).trim();
      report.push({name:"finale-button-movement",moved:before!==after,tease});
      if (before===after || !tease) throw new Error("Finale button did not move or show its playful feedback");
      for (let tap = 0; tap < 16; tap += 1) {
        const dodge = page.locator(".no-btn");
        const hit = await dodge.boundingBox();
        if (hit) await page.mouse.click(hit.x + hit.width / 2, hit.y + hit.height / 2);
        await page.waitForFunction(() => document.querySelector("[data-step]")?.getAttribute("data-step") === "finale");
      }
      const stuckOnFinale = (await page.locator("[data-step]").getAttribute("data-step")) === "finale";
      report.push({ name: "finale-later-no-nav", passed: stuckOnFinale, step: await page.locator("[data-step]").getAttribute("data-step") });
      if (!stuckOnFinale) throw new Error("Finale Later button navigated away from screen 14");
      await shoot("14-finale-tease");
      await page.locator(".yes-btn").click();
      await page.waitForSelector(".finale-celebrate");
      await shoot("14-finale-yes");
    }
  }
  const missing=report.filter(x=>x.overflow>2||x.error||x.passed===false);
  console.log(JSON.stringify({ok:missing.length===0,report},null,2));
  if(missing.length)process.exitCode=1;
} finally {
  await context.close();
  await browser.close();
  server?.kill();
}

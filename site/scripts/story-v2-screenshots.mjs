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

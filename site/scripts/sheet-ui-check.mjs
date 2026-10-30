import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { emptyProgress } from '../src/lib/progress.ts';
import { FLOW } from '../src/lib/flow.ts';
const out = new URL('../../docs/story-v2-qa/sheet-refinement/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });
const server = spawn(process.execPath, [new URL('../node_modules/vite/bin/vite.js', import.meta.url).pathname,'preview','--host','127.0.0.1','--port','4181','--strictPort'], {stdio:'ignore'});
let browser;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
try {
  let ready = false;
  for (let i=0;i<50;i++) { try { if ((await fetch('http://127.0.0.1:4181')).ok) { ready=true; break; } } catch {} await delay(100); }
  assert.ok(ready);
  browser = await chromium.launch({executablePath:process.env.CHROME_PATH, headless:true});
  for (const height of [932,739]) for (const locale of ['vi','en']) {
    const context = await browser.newContext({viewport:{width:430,height}, isMobile:true, hasTouch:true, reducedMotion:'reduce', userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});
    await context.route('https://sheet.invalid/**', route => route.fulfill({status:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:'{"ok":true}'}));
    const page=await context.newPage();
    for (const step of ['dreams','wish']) {
      const progress={...emptyProgress(),gateUnlocked:true,step:FLOW.indexOf(step),accessibleSteps:FLOW.slice(),unlocked:14, wishes:step==='wish'?[{id:'sample-star',text:'Nội dung minh họa',at:1,private:true}]:[]};
      await page.goto('http://127.0.0.1:4181/?dev=1');
      await page.evaluate(({progress,locale})=>{localStorage.setItem('lilj.progress.v1',JSON.stringify(progress));localStorage.setItem('lilj.locale.v1',locale);},{progress,locale});
      await page.reload();
      await page.waitForSelector(`[data-step="${step}"]`);
      await page.addStyleTag({content:':root{--safe-top:59px;--safe-bottom:34px}'});
      if(step==='dreams') await page.locator('.dream input').first().check();
      else assert.equal(await page.locator('.wish-read').innerText(),'');
      await delay(250);
      await page.screenshot({path:`${out}${step}-${locale}-430x${height}.png`});
      if(step==='wish') {
        await page.locator('.wish-field input').fill('Nội dung minh họa');
        await page.evaluate(()=>{
          Object.defineProperty(window.visualViewport,'height',{configurable:true,get:()=>Math.round(innerHeight*0.58)});
          window.visualViewport.dispatchEvent(new Event('resize'));
        });
        await delay(300);
        const box=await page.locator('.wish-keep').boundingBox();
        assert.ok(box && box.y+box.height<=height*.58+2, `switch clipped with keyboard: ${JSON.stringify(box)}`);
        await page.screenshot({path:`${out}wish-keyboard-${locale}-430x${height}.png`,clip:{x:0,y:0,width:430,height:Math.floor(height*.58)}});
        await page.evaluate(()=>{delete window.visualViewport.height;window.visualViewport.dispatchEvent(new Event('resize'));});
        await page.locator('.wish-keep').click();
        await page.locator('.wish-go').click();
        await page.waitForFunction(()=>document.querySelector('.wish-read')?.textContent.trim());
        await page.waitForFunction(()=>!document.querySelector('.wish-read')?.textContent.trim(),{},{timeout:4500});
        assert.equal(await page.locator('.wish-keep').getAttribute('aria-checked'),'true');
      }
    }
    await context.close();
  }
  console.log('sheet-ui-check ok: VI/EN, both iPhone sizes, simulated keyboard, confirmation lifecycle');
} finally { await browser?.close(); server.kill(); }

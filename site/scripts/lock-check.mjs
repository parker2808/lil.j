import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { emptyProgress } from '../src/lib/progress.ts';
import { FLOW } from '../src/lib/flow.ts';

// Build first without VITE_DEV_MODE (see `npm run lock-check`).
// The birthday lock follows the server's clock, not the device's, and `?dev=1` changes nothing.
const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const unlockAt = Date.parse(content.lock.unlockAt);
const before = unlockAt - 86_400_000;
const after = unlockAt + 86_400_000;
const base = 'http://127.0.0.1:4184';

function chromePath() {
  const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  const found = candidates.find(path => existsSync(path));
  if (!found) throw new Error('Could not find Chrome. Set CHROME_PATH.');
  return found;
}

const server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), 'preview', '--host', '127.0.0.1', '--port', '4184', '--strictPort'], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/** A page whose device clock reads `device` while the site's server answers with `server`. */
async function open(browser, height, { device, server }) {
  const context = await browser.newContext({ viewport: { width: 430, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const posts = [];
  await context.route(url => url.searchParams.has('clock'), route => route.fulfill({ status: 200, headers: { date: new Date(server).toUTCString() }, body: '' }));
  await context.route('https://sheet.invalid/**', route => {
    try { posts.push(JSON.parse(route.request().postData() ?? '')); } catch {}
    return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' });
  });
  const page = await context.newPage();
  await page.clock.setFixedTime(device);
  return { context, page, posts };
}

let browser;
try {
  let ready = false;
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await delay(100); }
  assert.ok(ready, 'preview server did not start');
  browser = await chromium.launch({ executablePath: chromePath(), headless: true });
  for (const height of [932, 739]) {
    const where = `430x${height}`;

    {
      const { context, page } = await open(browser, height, { device: after, server: before });
      await page.goto(`${base}/?dev=1&crash=1`);
      await page.locator('.lock-scene').waitFor({ timeout: 5000 }).catch(() => {});
      await delay(2500);
      assert.equal(await page.locator('.lock-scene').count(), 1, `${where}: the lock opened with ?dev=1 and the device clock set past the birthday`);
      assert.equal(await page.locator('.dev-jump').count(), 0, `${where}: jump row shown on the lock screen`);
      await context.close();
    }

    {
      const { context, page, posts } = await open(browser, height, { device: before, server: after });
      const progress = { ...emptyProgress(), gateUnlocked: true, step: FLOW.indexOf('wish'), accessibleSteps: FLOW.slice(), unlocked: 14 };
      await page.goto(base);
      await page.evaluate(progress => localStorage.setItem('lilj.progress.v1', JSON.stringify(progress)), progress);
      await page.goto(`${base}/?dev=1`);
      await page.waitForSelector('.wish-scene .wish-field input');
      assert.equal(await page.locator('.dev-jump').count(), 0, `${where}: jump row shown after the birthday`);
      await page.locator('.wish-field input').fill('Điều ước thử');
      await page.locator('.wish-go').click();
      for (let i = 0; i < 50 && !posts.some(post => post.kind === 'wish'); i++) await delay(100);
      const wish = posts.find(post => post.kind === 'wish');
      assert.ok(wish, `${where}: wish was not sent`);
      assert.equal(wish.test, false, `${where}: ?dev=1 marked a real wish as test`);
      await context.close();
    }
  }
  console.log('lock-check ok: the lock follows the server clock (a device set past the birthday stays locked, a device behind still opens), and without VITE_DEV_MODE ?dev=1 shows no jump row and marks nothing as test (430x932, 430x739)');
} finally { await browser?.close(); server.kill(); }

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { chromium } from 'playwright-core';
import { emptyProgress } from '../src/lib/progress.ts';
import { FLOW } from '../src/lib/flow.ts';

// Build first with VITE_WISH_PRIVATE_SWITCH=false (see `npm run wish-flag-check`).
// Screenshots only with `--shots` (docs/story-v2-qa/wish-private-flag/) or `--shots=<dir>`.
const content = JSON.parse(readFileSync(new URL('../content.json', import.meta.url), 'utf8'));
const shotsArg = process.argv.find(arg => arg === '--shots' || arg.startsWith('--shots='));
const out = shotsArg?.includes('=') ? shotsArg.slice('--shots='.length) : shotsArg ? fileURLToPath(new URL('../../docs/story-v2-qa/wish-private-flag/', import.meta.url)) : null;
if (out) mkdirSync(out, { recursive: true });
const base = 'http://127.0.0.1:4183';

function chromePath() {
  const candidates = [process.env.CHROME_PATH, '/usr/bin/google-chrome-stable', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
  const found = candidates.find(path => existsSync(path));
  if (!found) throw new Error('Could not find Chrome. Set CHROME_PATH.');
  return found;
}

const server = spawn(process.execPath, [fileURLToPath(new URL('../node_modules/vite/bin/vite.js', import.meta.url)), 'preview', '--host', '127.0.0.1', '--port', '4183', '--strictPort'], { cwd: fileURLToPath(new URL('..', import.meta.url)), stdio: 'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let browser;
try {
  let ready = false;
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base)).ok) { ready = true; break; } } catch {} await delay(100); }
  assert.ok(ready, 'preview server did not start');
  browser = await chromium.launch({ executablePath: chromePath(), headless: true });
  for (const height of [932, 739]) for (const locale of ['vi', 'en']) {
    const where = `${locale} 430x${height}`;
    const posts = [];
    const context = await browser.newContext({ viewport: { width: 430, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    await context.route('https://sheet.invalid/**', route => {
      try { posts.push(JSON.parse(route.request().postData() ?? '')); } catch {}
      return route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":true}' });
    });
    const page = await context.newPage();
    const oldPrivate = { id: 'old-private-wish', text: 'Điều ước riêng cũ', at: 1, private: true };
    const progress = { ...emptyProgress(), gateUnlocked: true, step: FLOW.indexOf('wish'), accessibleSteps: FLOW.slice(), unlocked: 14, wishes: [oldPrivate] };
    await page.goto(`${base}/?dev=1`);
    await page.evaluate(({ progress, locale }) => { localStorage.setItem('lilj.progress.v1', JSON.stringify(progress)); localStorage.setItem('lilj.locale.v1', locale); }, { progress, locale });
    await page.reload();
    await page.waitForSelector('.wish-scene .wish-field input');
    await page.addStyleTag({ content: ':root{--safe-top:59px;--safe-bottom:34px}' });

    assert.equal(await page.locator('.wish-keep').count(), 0, `${where}: switch should be hidden`);
    assert.equal((await page.locator('.wish-note').innerText()).trim(), content.wish.noteShared[locale], `${where}: shared note`);
    const boxes = await page.evaluate(() => Object.fromEntries(['.wish-note', '.wish-form', '.flow'].map(sel => {
      const box = document.querySelector(sel)?.getBoundingClientRect();
      return [sel, box ? { top: box.top, bottom: box.bottom } : null];
    })));
    assert.ok(boxes['.wish-note'].bottom <= boxes['.wish-form'].top + 1, `${where}: note overlaps the input ${JSON.stringify(boxes)}`);
    assert.ok(!boxes['.flow'] || boxes['.wish-form'].bottom <= boxes['.flow'].top + 1, `${where}: input overlaps the footer ${JSON.stringify(boxes)}`);
    await delay(250);
    if (out) await page.screenshot({ path: join(out, `wish-${locale}-430x${height}.png`) });

    await page.locator('.wish-field input').fill('Một điều ước thử');
    await page.locator('.wish-go').click();
    for (let i = 0; i < 50 && !posts.some(post => post.kind === 'wish'); i++) await delay(100);
    const sent = posts.filter(post => post.kind === 'wish');
    assert.equal(sent.length, 1, `${where}: expected one wish request, got ${sent.length}`);
    assert.equal(sent[0].text, 'Một điều ước thử', `${where}: wrong wish text`);
    assert.ok(!posts.some(post => post.id === oldPrivate.id || post.text === oldPrivate.text), `${where}: an old private wish was sent`);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('lilj.progress.v1')).wishes);
    assert.equal(saved.at(-1).private, undefined, `${where}: new wish stored as private`);
    assert.equal(saved.find(wish => wish.id === oldPrivate.id)?.private, true, `${where}: old private wish lost its flag`);
    await context.close();
  }
  console.log(`wish-flag-check ok: switch hidden, shared note, new wishes sent, old private wishes stay private (VI/EN, 430x932, 430x739)${out ? `; screenshots in ${out}` : ''}`);
} finally { await browser?.close(); server.kill(); }

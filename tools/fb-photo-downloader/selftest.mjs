#!/usr/bin/env node
/**
 * Offline self-test for URL/date extraction (không cần Facebook).
 * Chạy: node selftest.mjs
 */

function unescapeJsonUrl(s) {
  return s
    .replace(/\\u0025/g, "%")
    .replace(/\\u0026/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\"/g, '"');
}

function pickBestImageUrl(html) {
  const candidates = [];
  const push = (url, score) => {
    if (!url || !/fbcdn\.net|facebook\.com/i.test(url)) return;
    if (/\.(mp4|m4v|webm)(\?|$)/i.test(url)) return;
    candidates.push({ url: unescapeJsonUrl(url), score });
  };
  for (const m of html.matchAll(/"browser_native_hd_url"\s*:\s*"([^"]+)"/g)) push(m[1], 1000);
  for (const m of html.matchAll(/"browser_native_sd_url"\s*:\s*"([^"]+)"/g)) push(m[1], 800);
  for (const m of html.matchAll(
    /"(?:image|photo_image|viewer_image)"\s*:\s*\{[^}]*?"uri"\s*:\s*"([^"]+)"[^}]*?(?:"width"\s*:\s*(\d+))?[^}]*?(?:"height"\s*:\s*(\d+))?/g
  )) {
    push(m[1], 500 + Number(m[2] || 0) + Number(m[3] || 0));
  }
  for (const m of html.matchAll(
    /https:\\\/\\\/(?:scontent|external)[^"\\\s]+|https:\/\/(?:scontent|external)[^"\s]+/g
  )) {
    const u = m[0];
    let score = 100;
    if (/_o\./.test(u) || /\/o\d+x\d+\//.test(u)) score = 700;
    else if (/_n\./.test(u)) score = 400;
    else if (/_s\./.test(u) || /p\d+x\d+/.test(u)) score = 150;
    push(u, score);
  }
  const og = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (og) push(og[1], 300);
  candidates.sort((a, b) => b.score - a.score);
  const seen = new Set();
  for (const c of candidates) {
    if (seen.has(c.url)) continue;
    seen.add(c.url);
    if (/\.(jpe?g|png|webp)/i.test(c.url) || /fbcdn\.net/.test(c.url)) return c.url;
  }
  return null;
}

function extractFbid(href) {
  const u = new URL(href, "https://www.facebook.com");
  const fbid = u.searchParams.get("fbid") || u.searchParams.get("photo_id");
  if (fbid && /^\d+$/.test(fbid)) return fbid;
  const m = u.pathname.match(/\/photos\/(?:[^/]+\/)?(\d{8,})\/?/);
  return m ? m[1] : null;
}

function extractDate(html) {
  for (const re of [
    /"created_time"\s*:\s*(\d{10,13})/,
    /"creation_time"\s*:\s*(\d{10,13})/,
    /"publish_time"\s*:\s*(\d{10,13})/,
  ]) {
    const m = html.match(re);
    if (m) {
      let ts = Number(m[1]);
      if (ts < 1e12) ts *= 1000;
      return new Date(ts).toISOString().slice(0, 10);
    }
  }
  return null;
}

const fixture = `
{"browser_native_sd_url":"https:\\/\\/scontent.xx.fbcdn.net\\/v\\/t39\\/sd.jpg","browser_native_hd_url":"https:\\/\\/scontent.xx.fbcdn.net\\/v\\/t39\\/hd.jpg"}
{"image":{"uri":"https:\\/\\/scontent.xx.fbcdn.net\\/v\\/small.jpg","width":200,"height":200}}
<meta property="og:image" content="https://scontent.xx.fbcdn.net/og.jpg" />
{"created_time":1683897600}
<video src="https://scontent.xx.fbcdn.net/v.mp4"></video>
`;

let failed = 0;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    failed += 1;
  } else {
    console.log("ok:", msg);
  }
}

const best = pickBestImageUrl(fixture);
assert(best && best.includes("hd.jpg"), `pick HD over SD/og (got ${best})`);
assert(extractFbid("/photo/?fbid=123456789012345&set=a.1") === "123456789012345", "fbid from query");
assert(extractFbid("https://www.facebook.com/photo.php?fbid=999888777666555") === "999888777666555", "photo.php");
assert(extractFbid("/photos/abc.123/111222333444555/") === "111222333444555", "photos path");
assert(extractDate(fixture) === "2023-05-12", "created_time → date");

if (failed) {
  console.error(`\n${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("\nAll self-tests passed.");

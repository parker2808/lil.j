// ==UserScript==
// @name         FB Photo Downloader (lil.j)
// @namespace    https://github.com/lil.j/fb-photo-downloader
// @version      1.0.0
// @description  Tải ảnh Facebook đang xem (profile/album) trong phiên đăng nhập của bạn. Không lấy cookie/credential.
// @author       Parker / lil.j
// @match        https://www.facebook.com/*
// @match        https://web.facebook.com/*
// @match        https://m.facebook.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_addStyle
// @connect      *.facebook.com
// @connect      *.fbcdn.net
// @connect      cdnjs.cloudflare.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js
// @run-at       document-idle
// ==/UserScript==

(function () {
  "use strict";

  const CFG = {
    scrollMinPx: 420,
    scrollMaxPx: 920,
    scrollDelayMinMs: 900,
    scrollDelayMaxMs: 2200,
    scrollIdleRounds: 6,
    fetchDelayMinMs: 1400,
    fetchDelayMaxMs: 3200,
    downloadDelayMinMs: 200,
    downloadDelayMaxMs: 600,
    maxPhotos: 5000,
    panelId: "lilj-fb-dl-panel",
  };

  /** @type {{ stopped: boolean, running: boolean }} */
  const state = { stopped: false, running: false };

  function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function assertFacebook() {
    return /(^|\.)facebook\.com$/i.test(location.hostname);
  }

  // ---- UI ----

  function ensurePanel() {
    let el = document.getElementById(CFG.panelId);
    if (el) return el;

    GM_addStyle(`
      #${CFG.panelId} {
        position: fixed; z-index: 2147483646; right: 16px; bottom: 16px;
        width: min(360px, calc(100vw - 24px));
        font: 13px/1.45 ui-sans-serif, system-ui, sans-serif;
        color: #1c1e21; background: #fff; border: 1px solid #ccd0d5;
        border-radius: 10px; box-shadow: 0 8px 28px rgba(0,0,0,.18);
        padding: 12px 14px; display: flex; flex-direction: column; gap: 8px;
      }
      #${CFG.panelId} h1 {
        margin: 0; font-size: 14px; font-weight: 700;
      }
      #${CFG.panelId} .muted { color: #65676b; font-size: 12px; }
      #${CFG.panelId} .row { display: flex; gap: 8px; flex-wrap: wrap; }
      #${CFG.panelId} button {
        cursor: pointer; border: 0; border-radius: 6px; padding: 8px 12px;
        font-weight: 600; font-size: 13px;
      }
      #${CFG.panelId} .start { background: #1877f2; color: #fff; }
      #${CFG.panelId} .start:disabled { opacity: .55; cursor: not-allowed; }
      #${CFG.panelId} .stop { background: #e4e6eb; color: #050505; }
      #${CFG.panelId} .log {
        max-height: 120px; overflow: auto; background: #f0f2f5;
        border-radius: 6px; padding: 8px; font-size: 12px; white-space: pre-wrap;
      }
      #${CFG.panelId} progress { width: 100%; height: 8px; }
    `);

    el = document.createElement("div");
    el.id = CFG.panelId;
    el.innerHTML = `
      <h1>FB Photo Downloader</h1>
      <div class="muted">Chạy trong phiên đăng nhập của bạn · Mở tab Photos / album rồi bấm Bắt đầu</div>
      <div class="row">
        <button class="start" type="button" data-act="start">Bắt đầu</button>
        <button class="stop" type="button" data-act="stop" disabled>Dừng</button>
      </div>
      <div class="muted" data-stat>Chưa chạy</div>
      <progress value="0" max="1"></progress>
      <div class="log" data-log></div>
    `;
    document.documentElement.appendChild(el);

    el.querySelector('[data-act="start"]').addEventListener("click", () => {
      if (!state.running) runPipeline();
    });
    el.querySelector('[data-act="stop"]').addEventListener("click", () => {
      state.stopped = true;
      log("Đã yêu cầu dừng…");
    });
    return el;
  }

  function setControls(running) {
    const panel = ensurePanel();
    panel.querySelector('[data-act="start"]').disabled = running;
    panel.querySelector('[data-act="stop"]').disabled = !running;
  }

  function setStat(text) {
    ensurePanel().querySelector("[data-stat]").textContent = text;
  }

  function setProgress(done, total) {
    const p = ensurePanel().querySelector("progress");
    p.max = Math.max(total, 1);
    p.value = done;
  }

  function log(msg) {
    const box = ensurePanel().querySelector("[data-log]");
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    box.textContent = `${line}\n${box.textContent}`.slice(0, 4000);
    console.log("[lil.j fb-dl]", msg);
  }

  // ---- Collect photo links (robust to obfuscated classes) ----

  function extractFbid(href) {
    if (!href) return null;
    try {
      const u = new URL(href, location.origin);
      const fbid =
        u.searchParams.get("fbid") ||
        u.searchParams.get("photo_id") ||
        null;
      if (fbid && /^\d+$/.test(fbid)) return fbid;
      // /photos/.../123456789012345/
      const m = u.pathname.match(/\/photos\/(?:[^/]+\/)?(\d{8,})\/?/);
      if (m) return m[1];
    } catch (_) {
      /* ignore */
    }
    return null;
  }

  function isPhotoHref(href) {
    if (!href) return false;
    return (
      /\/photo\/?\?/i.test(href) ||
      /\/photo\.php/i.test(href) ||
      /\/photos\//i.test(href)
    );
  }

  function collectFromDom(map) {
    const anchors = document.querySelectorAll("a[href]");
    for (const a of anchors) {
      const href = a.getAttribute("href");
      if (!isPhotoHref(href)) continue;
      const fbid = extractFbid(href);
      if (!fbid) continue;
      if (map.has(fbid)) continue;
      const abs = new URL(href, location.origin);
      // Normalize to desktop photo permalink
      const permalink = `https://www.facebook.com/photo/?fbid=${fbid}`;
      map.set(fbid, { fbid, href: permalink, raw: abs.href });
    }
    return map;
  }

  async function scrollCollect() {
    /** @type {Map<string, {fbid:string, href:string, raw:string}>} */
    const found = new Map();
    let idle = 0;
    let lastCount = 0;

    log("Cuộn trang để tải thêm ảnh…");
    collectFromDom(found);
    setStat(`Đã thấy ${found.size} ảnh (đang cuộn)`);

    while (!state.stopped && idle < CFG.scrollIdleRounds && found.size < CFG.maxPhotos) {
      const dy = rand(CFG.scrollMinPx, CFG.scrollMaxPx);
      window.scrollBy({ top: dy, behavior: "smooth" });
      await sleep(rand(CFG.scrollDelayMinMs, CFG.scrollDelayMaxMs));

      // Occasional longer pause (human-like)
      if (Math.random() < 0.12) {
        await sleep(rand(2500, 4500));
      }

      collectFromDom(found);
      setStat(`Đã thấy ${found.size} ảnh (đang cuộn)`);

      if (found.size === lastCount) {
        idle += 1;
        // Try jump to bottom once mid-idle
        if (idle === Math.floor(CFG.scrollIdleRounds / 2)) {
          window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
          await sleep(rand(1500, 2800));
          collectFromDom(found);
        }
      } else {
        idle = 0;
        lastCount = found.size;
      }
    }

    if (state.stopped) log("Dừng khi đang cuộn.");
    else log(`Thu thập xong: ${found.size} ảnh unique.`);
    return [...found.values()];
  }

  // ---- Resolve highest-res URL ----

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

    // Preferred native HD/SD fields Facebook embeds in page payloads
    for (const m of html.matchAll(/"browser_native_hd_url"\s*:\s*"([^"]+)"/g)) {
      push(m[1], 1000);
    }
    for (const m of html.matchAll(/"browser_native_sd_url"\s*:\s*"([^"]+)"/g)) {
      push(m[1], 800);
    }

    // image / photo_image objects with dimensions
    for (const m of html.matchAll(
      /"(?:image|photo_image|viewer_image)"\s*:\s*\{[^}]*?"uri"\s*:\s*"([^"]+)"[^}]*?(?:"width"\s*:\s*(\d+))?[^}]*?(?:"height"\s*:\s*(\d+))?/g
    )) {
      const w = Number(m[2] || 0);
      const h = Number(m[3] || 0);
      push(m[1], 500 + w + h);
    }

    // Generic scontent urls — prefer ones with larger size hints in path (_s| _n| _o)
    for (const m of html.matchAll(
      /https:\\\/\\\/(?:scontent|external)[^"\\\s]+|https:\/\/(?:scontent|external)[^"\s]+/g
    )) {
      let u = m[0];
      let score = 100;
      if (/_o\./.test(u) || /\/o\d+x\d+\//.test(u)) score = 700;
      else if (/_n\./.test(u)) score = 400;
      else if (/_s\./.test(u) || /p\d+x\d+/.test(u)) score = 150;
      push(u, score);
    }

    // og:image fallback
    const og = html.match(
      /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
    );
    if (og) push(og[1], 300);

    candidates.sort((a, b) => b.score - a.score);
    // Dedupe by URL
    const seen = new Set();
    for (const c of candidates) {
      if (seen.has(c.url)) continue;
      seen.add(c.url);
      if (/\.(jpe?g|png|webp)/i.test(c.url) || /fbcdn\.net/.test(c.url)) {
        return c.url;
      }
    }
    return null;
  }

  function extractDate(html) {
    const patterns = [
      /"created_time"\s*:\s*(\d{10,13})/,
      /"creation_time"\s*:\s*(\d{10,13})/,
      /"publish_time"\s*:\s*(\d{10,13})/,
      /"takenAtTimestamp"\s*:\s*(\d{10,13})/,
    ];
    for (const re of patterns) {
      const m = html.match(re);
      if (m) {
        let ts = Number(m[1]);
        if (ts < 1e12) ts *= 1000;
        const d = new Date(ts);
        if (!Number.isNaN(d.getTime())) {
          return d.toISOString().slice(0, 10);
        }
      }
    }
    // datetime attribute fallback
    const dt = html.match(/datetime=["'](\d{4}-\d{2}-\d{2})/);
    return dt ? dt[1] : null;
  }

  function gmFetchText(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        anonymous: false,
        withCredentials: true,
        headers: {
          Accept: "text/html,application/xhtml+xml",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        },
        onload(res) {
          if (res.status >= 200 && res.status < 400) resolve(res.responseText);
          else reject(new Error(`HTTP ${res.status} for ${url}`));
        },
        onerror: () => reject(new Error(`Network error: ${url}`)),
        ontimeout: () => reject(new Error(`Timeout: ${url}`)),
      });
    });
  }

  function gmFetchBinary(url) {
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url,
        responseType: "arraybuffer",
        anonymous: false,
        onload(res) {
          if (res.status >= 200 && res.status < 400) {
            resolve({
              buffer: res.response,
              contentType: (res.responseHeaders || "")
                .split(/\r?\n/)
                .find((h) => /^content-type:/i.test(h)),
            });
          } else reject(new Error(`HTTP ${res.status}`));
        },
        onerror: () => reject(new Error("binary fetch failed")),
      });
    });
  }

  async function resolvePhoto(item) {
    const html = await gmFetchText(item.href);
    const imageUrl = pickBestImageUrl(html);
    const date = extractDate(html);
    return { ...item, imageUrl, date };
  }

  function extFromUrlOrType(url, contentTypeHeader) {
    const ct = (contentTypeHeader || "").toLowerCase();
    if (ct.includes("png")) return "png";
    if (ct.includes("webp")) return "webp";
    if (ct.includes("jpeg") || ct.includes("jpg")) return "jpg";
    const m = String(url).match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
    return "jpg";
  }

  function buildFilename(index, date, ext) {
    const n = String(index).padStart(4, "0");
    return date ? `${n}_${date}.${ext}` : `${n}.${ext}`;
  }

  // ---- Pipeline ----

  async function runPipeline() {
    if (!assertFacebook()) {
      alert("Hãy mở trang facebook.com rồi chạy lại.");
      return;
    }
    state.running = true;
    state.stopped = false;
    setControls(true);
    setProgress(0, 1);
    ensurePanel().querySelector("[data-log]").textContent = "";
    log("Bắt đầu.");

    try {
      const photos = await scrollCollect();
      if (!photos.length) {
        log("Không tìm thấy link ảnh. Hãy mở tab Photos hoặc một album cụ thể.");
        return;
      }

      /** @type {Map<string, true>} */
      const seenUrls = new Map();
      const zip = new JSZip();
      const folder = zip.folder("fb-photos");
      let ok = 0;
      let skip = 0;
      let fail = 0;

      setProgress(0, photos.length);

      for (let i = 0; i < photos.length; i++) {
        if (state.stopped) break;
        const item = photos[i];
        setStat(`Đang xử lý ${i + 1}/${photos.length} · tải ${ok} · bỏ trùng ${skip} · lỗi ${fail}`);
        setProgress(i, photos.length);

        try {
          const resolved = await resolvePhoto(item);
          if (!resolved.imageUrl) {
            fail += 1;
            log(`#${i + 1} fbid=${item.fbid}: không tìm được URL full-res`);
          } else if (seenUrls.has(resolved.imageUrl)) {
            skip += 1;
          } else {
            seenUrls.set(resolved.imageUrl, true);
            await sleep(rand(CFG.downloadDelayMinMs, CFG.downloadDelayMaxMs));
            const bin = await gmFetchBinary(resolved.imageUrl);
            const ext = extFromUrlOrType(resolved.imageUrl, bin.contentType);
            const name = buildFilename(ok + 1, resolved.date, ext);
            folder.file(name, bin.buffer);
            ok += 1;
            log(`✓ ${name}`);
          }
        } catch (err) {
          fail += 1;
          log(`#${i + 1} fbid=${item.fbid}: ${err.message || err}`);
        }

        if (i < photos.length - 1 && !state.stopped) {
          await sleep(rand(CFG.fetchDelayMinMs, CFG.fetchDelayMaxMs));
        }
      }

      setProgress(photos.length, photos.length);

      if (ok === 0) {
        log("Không tải được ảnh nào.");
        return;
      }

      log(`Đóng gói ZIP (${ok} ảnh)…`);
      const blob = await zip.generateAsync({ type: "blob" });
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      const outName = `fb-photos_${stamp}.zip`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = outName;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 60_000);

      setStat(`Xong: ${ok} ảnh · bỏ trùng ${skip} · lỗi ${fail}`);
      log(`Đã tải ${outName}`);
    } catch (err) {
      log(`Lỗi: ${err.message || err}`);
    } finally {
      state.running = false;
      setControls(false);
    }
  }

  // Boot
  if (assertFacebook()) {
    ensurePanel();
    log("Sẵn sàng. Mở Photos/album rồi bấm Bắt đầu.");
  }
})();

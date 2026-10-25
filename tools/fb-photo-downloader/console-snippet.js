/**
 * FB Photo Downloader — DevTools console snippet (không cần Tampermonkey)
 *
 * Cách dùng:
 * 1. Đăng nhập Facebook trên Chrome/Firefox.
 * 2. Mở tab Photos của profile hoặc một album.
 * 3. Mở DevTools (F12) → Console.
 * 4. Dán toàn bộ file này và Enter.
 * 5. Panel góc phải-dưới xuất hiện → bấm "Bắt đầu".
 *
 * Lưu ý: bản console dùng fetch thường (không bypass CORS như userscript).
 * Nếu CDN chặn CORS, hãy dùng fb-photo-downloader.user.js với Tampermonkey.
 */
(async function liljFbPhotoDownloader() {
  "use strict";

  if (!/(^|\.)facebook\.com$/i.test(location.hostname)) {
    alert("Hãy chạy trên facebook.com");
    return;
  }

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
    jszipCdn: "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",
  };

  const state = { stopped: false, running: false };

  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function loadJSZip() {
    if (window.JSZip) return window.JSZip;
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = CFG.jszipCdn;
      s.onload = resolve;
      s.onerror = () => reject(new Error("Không tải được JSZip từ CDN"));
      document.head.appendChild(s);
    });
    return window.JSZip;
  }

  function ensurePanel() {
    let el = document.getElementById(CFG.panelId);
    if (el) return el;

    const style = document.createElement("style");
    style.textContent = `
      #${CFG.panelId}{position:fixed;z-index:2147483646;right:16px;bottom:16px;width:min(360px,calc(100vw - 24px));font:13px/1.45 ui-sans-serif,system-ui,sans-serif;color:#1c1e21;background:#fff;border:1px solid #ccd0d5;border-radius:10px;box-shadow:0 8px 28px rgba(0,0,0,.18);padding:12px 14px;display:flex;flex-direction:column;gap:8px}
      #${CFG.panelId} h1{margin:0;font-size:14px;font-weight:700}
      #${CFG.panelId} .muted{color:#65676b;font-size:12px}
      #${CFG.panelId} .row{display:flex;gap:8px;flex-wrap:wrap}
      #${CFG.panelId} button{cursor:pointer;border:0;border-radius:6px;padding:8px 12px;font-weight:600;font-size:13px}
      #${CFG.panelId} .start{background:#1877f2;color:#fff}
      #${CFG.panelId} .start:disabled{opacity:.55;cursor:not-allowed}
      #${CFG.panelId} .stop{background:#e4e6eb;color:#050505}
      #${CFG.panelId} .log{max-height:120px;overflow:auto;background:#f0f2f5;border-radius:6px;padding:8px;font-size:12px;white-space:pre-wrap}
      #${CFG.panelId} progress{width:100%;height:8px}
    `;
    document.head.appendChild(style);

    el = document.createElement("div");
    el.id = CFG.panelId;
    el.innerHTML = `
      <h1>FB Photo Downloader (console)</h1>
      <div class="muted">Phiên đăng nhập hiện tại · Photos/album → Bắt đầu</div>
      <div class="row">
        <button class="start" type="button" data-act="start">Bắt đầu</button>
        <button class="stop" type="button" data-act="stop" disabled>Dừng</button>
      </div>
      <div class="muted" data-stat>Chưa chạy</div>
      <progress value="0" max="1"></progress>
      <div class="log" data-log></div>
    `;
    document.documentElement.appendChild(el);
    el.querySelector('[data-act="start"]').onclick = () => {
      if (!state.running) runPipeline();
    };
    el.querySelector('[data-act="stop"]').onclick = () => {
      state.stopped = true;
      log("Đã yêu cầu dừng…");
    };
    return el;
  }

  function setControls(running) {
    const p = ensurePanel();
    p.querySelector('[data-act="start"]').disabled = running;
    p.querySelector('[data-act="stop"]').disabled = !running;
  }
  function setStat(t) {
    ensurePanel().querySelector("[data-stat]").textContent = t;
  }
  function setProgress(done, total) {
    const p = ensurePanel().querySelector("progress");
    p.max = Math.max(total, 1);
    p.value = done;
  }
  function log(msg) {
    const box = ensurePanel().querySelector("[data-log]");
    box.textContent = `[${new Date().toLocaleTimeString()}] ${msg}\n${box.textContent}`.slice(0, 4000);
    console.log("[lil.j fb-dl]", msg);
  }

  function extractFbid(href) {
    if (!href) return null;
    try {
      const u = new URL(href, location.origin);
      const fbid = u.searchParams.get("fbid") || u.searchParams.get("photo_id");
      if (fbid && /^\d+$/.test(fbid)) return fbid;
      const m = u.pathname.match(/\/photos\/(?:[^/]+\/)?(\d{8,})\/?/);
      if (m) return m[1];
    } catch (_) {}
    return null;
  }

  function isPhotoHref(href) {
    return href && (/\/photo\/?\?/i.test(href) || /\/photo\.php/i.test(href) || /\/photos\//i.test(href));
  }

  function collectFromDom(map) {
    for (const a of document.querySelectorAll("a[href]")) {
      const href = a.getAttribute("href");
      if (!isPhotoHref(href)) continue;
      const fbid = extractFbid(href);
      if (!fbid || map.has(fbid)) continue;
      map.set(fbid, { fbid, href: `https://www.facebook.com/photo/?fbid=${fbid}` });
    }
    return map;
  }

  async function scrollCollect() {
    const found = new Map();
    let idle = 0;
    let lastCount = 0;
    log("Cuộn trang để tải thêm ảnh…");
    collectFromDom(found);
    setStat(`Đã thấy ${found.size} ảnh (đang cuộn)`);

    while (!state.stopped && idle < CFG.scrollIdleRounds && found.size < CFG.maxPhotos) {
      window.scrollBy({ top: rand(CFG.scrollMinPx, CFG.scrollMaxPx), behavior: "smooth" });
      await sleep(rand(CFG.scrollDelayMinMs, CFG.scrollDelayMaxMs));
      if (Math.random() < 0.12) await sleep(rand(2500, 4500));
      collectFromDom(found);
      setStat(`Đã thấy ${found.size} ảnh (đang cuộn)`);
      if (found.size === lastCount) {
        idle += 1;
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
    log(`Thu thập xong: ${found.size} ảnh unique.`);
    return [...found.values()];
  }

  function unescapeJsonUrl(s) {
    return s.replace(/\\u0025/g, "%").replace(/\\u0026/g, "&").replace(/\\\//g, "/").replace(/\\"/g, '"');
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

  function extractDate(html) {
    for (const re of [
      /"created_time"\s*:\s*(\d{10,13})/,
      /"creation_time"\s*:\s*(\d{10,13})/,
      /"publish_time"\s*:\s*(\d{10,13})/,
      /"takenAtTimestamp"\s*:\s*(\d{10,13})/,
    ]) {
      const m = html.match(re);
      if (m) {
        let ts = Number(m[1]);
        if (ts < 1e12) ts *= 1000;
        const d = new Date(ts);
        if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      }
    }
    const dt = html.match(/datetime=["'](\d{4}-\d{2}-\d{2})/);
    return dt ? dt[1] : null;
  }

  async function fetchText(url) {
    const res = await fetch(url, {
      credentials: "include",
      headers: { Accept: "text/html,application/xhtml+xml" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.text();
  }

  async function fetchBinary(url) {
    const res = await fetch(url, { credentials: "omit", mode: "cors" });
    if (!res.ok) throw new Error(`HTTP ${res.status} (CDN)`);
    return { buffer: await res.arrayBuffer(), contentType: res.headers.get("content-type") || "" };
  }

  function extFromUrlOrType(url, ct) {
    const c = (ct || "").toLowerCase();
    if (c.includes("png")) return "png";
    if (c.includes("webp")) return "webp";
    if (c.includes("jpeg") || c.includes("jpg")) return "jpg";
    const m = String(url).match(/\.(jpe?g|png|webp)(?:\?|$)/i);
    if (m) return m[1].toLowerCase().replace("jpeg", "jpg");
    return "jpg";
  }

  function buildFilename(index, date, ext) {
    const n = String(index).padStart(4, "0");
    return date ? `${n}_${date}.${ext}` : `${n}.${ext}`;
  }

  async function runPipeline() {
    state.running = true;
    state.stopped = false;
    setControls(true);
    setProgress(0, 1);
    ensurePanel().querySelector("[data-log]").textContent = "";
    log("Bắt đầu.");

    try {
      const JSZip = await loadJSZip();
      const photos = await scrollCollect();
      if (!photos.length) {
        log("Không tìm thấy link ảnh. Mở tab Photos hoặc album cụ thể.");
        return;
      }

      const seenUrls = new Set();
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
          const html = await fetchText(item.href);
          const imageUrl = pickBestImageUrl(html);
          const date = extractDate(html);
          if (!imageUrl) {
            fail += 1;
            log(`#${i + 1} fbid=${item.fbid}: không tìm được URL full-res`);
          } else if (seenUrls.has(imageUrl)) {
            skip += 1;
          } else {
            seenUrls.add(imageUrl);
            await sleep(rand(CFG.downloadDelayMinMs, CFG.downloadDelayMaxMs));
            const bin = await fetchBinary(imageUrl);
            const ext = extFromUrlOrType(imageUrl, bin.contentType);
            const name = buildFilename(ok + 1, date, ext);
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
        log("Không tải được ảnh nào. Nếu lỗi CORS, dùng userscript Tampermonkey.");
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

  ensurePanel();
  log("Sẵn sàng. Mở Photos/album rồi bấm Bắt đầu.");
})();

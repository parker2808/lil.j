# FB Photo Downloader

## Plan

- [x] Browser tool in `tools/fb-photo-downloader/`
  - Tampermonkey userscript (primary; GM_* for CORS-safe downloads)
  - DevTools console snippet (fallback)
  - Scroll + collect `/photo/?fbid=` / `/photo.php` links
  - Resolve highest-res image URL per photo
  - Rate limit, dedupe, progress UI, stop control
  - Zip via JSZip with index+date filenames
- [x] Optional Node `compress` script (sharp → WebP ~1200px)
- [x] README tiếng Việt (hướng dẫn + giới hạn)
- [x] Offline selftest + compress smoke test
- [ ] Commit, push, mở PR

## Review

- Userscript + console snippet + compress + README VI đã có.
- Selftest parse: pass. Compress smoke (2400px → 1200 WebP): pass.
- **Chưa verify live** trên Facebook (không đăng nhập được trong agent): scroll DOM thật, field `browser_native_hd_url`, CORS CDN, rate-limit FB.

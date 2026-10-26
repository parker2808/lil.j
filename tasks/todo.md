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
- [x] Commit, push, mở PR (#1)

## Vũ trụ của em

- [x] Site React + Vite + TS trong `site/`, không đụng `tools/fb-photo-downloader`
- [x] `content.json` một nguồn: cổng, thư, 7 chương, bánh, mở khi, câu hỏi cuối
- [x] Ảnh/nhạc placeholder local, README schema tiếng Việt, Vercel
- [x] Build sạch, xem trên viewport điện thoại, mở PR

## Review — Vũ trụ của em

- `npm run build` sạch. `oxlint` sạch. `node scripts/selfcheck.mjs` pass.
- Playwright 390×844: cổng sai/đúng, phong thư, nhạc được gọi sau cú chạm, 7 sao thành chòm, lật ảnh, cào, đố, nhớ, ước, note, đồng hồ, thổi nến bằng chạm, thư một lần/ngày, nút Không chạy, Có được lưu. Tải lại không hỏi lại biệt danh. Không tràn ngang ở 390 và 360.
- Ảnh/nhạc là placeholder. Mật khẩu giả: `bé yêu`. Tool Facebook không đụng.

## Review

- Userscript + console snippet + compress + README VI đã có.
- Selftest parse: pass. Compress smoke (2400px → 1200 WebP): pass.
- **Chưa verify live** trên Facebook (không đăng nhập được trong agent): scroll DOM thật, field `browser_native_hd_url`, CORS CDN, rate-limit FB.

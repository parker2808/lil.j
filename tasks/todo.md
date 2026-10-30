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

## CI Story V2 nhanh hơn (2026-10-31, nhánh `chore/faster-story-v2-ci`)

Đo trên 8 lần chạy gần nhất: 7–9 phút; overlap ~5,5 phút (2.880 trường hợp chạy nối tiếp), journey ~1 phút, ảnh 15 màn ~45 giây, phần còn lại ~20 giây.

- [x] `overlap-check.mjs`: thêm `OVERLAP_SHARD=i/n` chia viewport xen kẽ; sai cú pháp hoặc phần rỗng thì báo lỗi.
- [x] Composite action `.github/actions/setup-site`: Node 22 + cache npm, Chrome, `npm ci`, `CHROME_PATH`, `qa-logs/`.
- [x] Workflow: job `checks` (lint, build, content, progress, unit tests `scripts/*.test.mjs`, ảnh 15 màn), job `journey`, job `overlap` ma trận 6 phần; log riêng từng job.
- [x] `concurrency`: hủy lần chạy cũ của cùng PR, không hủy trên `main`. Bỏ nhánh đã merge `fix/story-v2-production-review` khỏi `push`.
- [x] Không giảm phạm vi kiểm tra: tổng số trường hợp của 6 phần = 2.880.
- [x] Kiểm tra cục bộ: 6 phần chạy song song trên một preview, cộng lại đủ trường hợp, 0 lỗi; shard sai báo lỗi.
- [ ] Đẩy PR, đo thời gian CI thật; cập nhật PROJECT_CONTEXT §5, §8, §12, §13.

### Kết quả cục bộ
- `OVERLAP_SHARD=7/6` và `abc` báo lỗi rõ ràng.
- 6 phần chạy song song trên một preview: mỗi phần 480 trường hợp, 0 lỗi (tổng 2.880, bằng bản cũ). Khi chạy 6 phần cùng lúc trên một máy Mac, tiến trình treo sau khi xong (không in tổng kết); chạy riêng như CI thì thoát bình thường.
- `OVERLAP_SHARD=2/6 npm run overlap` (đúng như CI): 480 trường hợp, 0 lỗi, 118 giây kể cả build.

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

## Lưu lựa chọn và điều ước lên Google Sheet (nhánh `feat/share-choices`)

> [PR #29](https://github.com/parker2808/lil.j/pull/29) đã merge (2026-10-30). Nhánh này đã rebase lên `main` mới.
>
> **Thiết kế đã chốt: A, công tắc bầu trời đêm (Parker, 2026-10-30).**
> - Rãnh 58×32 là mảnh trời đêm có đốm sao.
> - Tắt (gửi cho anh): núm là ngôi sao hồng phát sáng.
> - Bật (giữ riêng): núm thành trăng khuyết tím nhạt, rãnh tối hơn và có quầng sáng tím.
> - Nhãn "Giữ điều ước cho riêng em" nằm bên trái. Cả dòng bấm được, `role="switch"`.
> - Thứ tự dưới đáy màn 12: dòng nhắc → ô nhập → công tắc → `wish-read`.

Quyết định của Parker (2026-10-30): dùng Google Sheet để lưu những gì cô ấy chọn ở màn 9 (`dreams`) và điều ước ở màn 12 (`wish`). Cô ấy không phải bấm thêm gì, và trên màn hình có ghi rõ anh sẽ thấy. Điều ước gửi khi bật "Giữ điều ước cho riêng em" thì không gửi gì. Parker cũng đồng ý bỏ quy tắc "không máy chủ, không cơ sở dữ liệu" cho riêng tính năng này.

### Câu chữ (VI đã chốt, EN Parker duyệt)
- [x] `dreamsCopy.note`, dòng nhỏ dưới lede màn 9
  - VI: "Em thích điều nào thì tích lại nhé. Anh sẽ thấy để mình cùng lên kế hoạch."
  - EN: "Tick the ones you like. I'll see them, so we can plan them together."
- [x] `wish.note`, dòng nhỏ ngay trên ô nhập ở màn 12 (Parker chốt câu 1)
  - VI: "Gửi lên thì anh đọc được, giữ riêng thì chỉ em biết."
  - EN: "Send it and I'll read it. Keep it, and it's only yours."
- [x] `wish.keep` thành nhãn của công tắc ngay dưới ô nhập, chữ giữ nguyên.
- [x] `wish.send` giữ nguyên ("Gửi điều ước của em ✨"), vì "cho anh" sẽ sai khi công tắc đang bật.

### Phần Google Sheet (`tools/sheet-sync/`)
- [x] `Code.gs`: `doPost` có `LockService`; hai trang `Lựa chọn` (mỗi thiết bị một dòng, ghi đè, bỏ bản cũ hơn) và `Điều ước` (mỗi mã một dòng, không trùng); `setup()` đặt múi giờ `Asia/Ho_Chi_Minh`.
- [x] Kiểm tra dữ liệu: `kind`, mã thiết bị/điều ước, mã lựa chọn `^d\d{1,2}$` (tối đa 20), chuỗi ≤ 180 ký tự, thân ≤ 4 KB; sai thì trả `{ ok: false, error: "invalid" }`. Chặn công thức (thêm `'` trước `= + - @`).
- [x] `README.md` tiếng Việt: tạo Sheet, dán code, chạy `setup`, Deploy Web app, dán URL `/exec` vào `VITE_SHEET_URL` trên Vercel, Redeploy, thử với `?dev=1`.

### Phần website (`site/`)
- [x] `src/lib/sheet-outbox.ts` (logic hàng chờ thuần, test bằng `node --test`) và `src/lib/sheet-sync.ts` (gửi, thử lại, mã thiết bị `lilj.visitor.v1`, hàng chờ `lilj.outbox.v1`).
  - Gửi `text/plain` để không có preflight. Chỉ xóa khỏi hàng chờ khi nhận `{ ok: true }` (hoặc dữ liệu bị script từ chối).
  - Gửi khi: 1,5 giây sau lần chọn cuối ở màn 9, ngay khi gửi điều ước, khi mở website, khi `online`, khi `visibilitychange` sang hidden (`keepalive`), và mỗi 30 giây sau lần lỗi.
  - `VITE_SHEET_URL` trống thì tắt hẳn. `?dev=1` gửi kèm `test: true`.
- [x] Màn 9: chỉ gửi khi cô ấy tự bấm, danh sách theo thứ tự trong `content.dreams`, bỏ hết cũng gửi.
- [x] Màn 12: công tắc theo từng điều ước, mặc định tắt, giữ nguyên vị trí sau mỗi lần gửi. Bật thì điều ước lưu `private: true` và không bao giờ vào hàng chờ.
- [x] Màn 12 bắt buộc phải ước: bỏ nút "giữ riêng không cần viết"; `wishPrivate: true` cũ vẫn tính là xong.
- [x] Bàn phím mở: dòng nhắc, ô nhập và công tắc chung khối `wish-dock` (`data-keyboard-block`), `revealFocused` giữ cả khối trên bàn phím; ẩn lede.

### Kiểm tra
- [x] `npm run sheet-sync-test`: 11/11 (hàng chờ + `Code.gs` chạy trong `vm` với Sheet giả).
- [x] `story-v2-check` build với URL giả, chặn request: danh sách màn 9 lên đúng chữ tiếng Việt; gửi lỗi thì nằm lại hàng chờ rồi gửi khi có mạng; điều ước giữ riêng không vào hàng chờ, không gửi, công tắc vẫn bật.
- [x] `npm run lint` (không cảnh báo mới), `build`, `selfcheck`, `content-check`, `progress-check`, `memory-deck-test`, `overlap` (VI và EN), `story-v2-check`.
- [x] Ảnh chụp màn 9 và màn 12 ở 430×932 và 430×739, cả lúc bàn phím mở: `docs/story-v2-qa/sheet-sync/`.
- [ ] Thử thật với Sheet của Parker (sau khi Parker Deploy script và đặt `VITE_SHEET_URL`).
- [ ] Thử bàn phím trên iPhone thật.

### Bàn giao
- [x] `PROJECT_CONTEXT.md` §1, §4, §5, §12, §13.
- [ ] Một PR nháp. Không merge, không deploy, không đặt `VITE_SHEET_URL` thay Parker.

### Rủi ro đã biết
- URL nhận dữ liệu nằm trong bundle, nên người khác có thể ghi rác vào Sheet nhưng không đọc được gì. Script giới hạn kích thước và mẫu dữ liệu để hạn chế.
- Không xác minh được người gửi là cô ấy (website không có tài khoản).
- Dữ liệu cô ấy làm trước khi tính năng chạy không lên Sheet. Website còn khóa tới 2026-11-18, nên gần như chưa có gì.

### Tổng kết
- Bàn phím giả lập (58% chiều cao): ở 430×739 vùng nhìn thấy 429px, đáy công tắc ở 324px, dư 105px; ở 430×932 dư 217px. Tiêu đề, dòng nhắc, ô nhập, công tắc không chồng nhau (VI và EN).
- Dòng nhắc màn 9 canh giữa giống lede sau khi xem ảnh chụp thật.
- Còn lại: Parker dựng Sheet theo `tools/sheet-sync/README.md`, rồi thử trên iPhone thật (bàn phím tiếng Việt có thanh gợi ý cao hơn bản giả lập).

## Follow-up 2026-10-31 — UI cùng style, Sheet gọn hơn
- [x] Parker xác nhận tính năng Sheet hiện tại hoạt động.
- [x] Tham khảo Google Sheets Tables, giữ galaxy/pastel pink/công tắc sao-trăng.
- [x] Giảm chữ trùng ở Dreams, xác nhận Wish tự ẩn sau 3 giây.
- [x] Nhãn thiết bị/trình duyệt thô, tên gợi nhớ chung, tách hàng thử nghiệm.
- [x] Script nâng cấp sao lưu dữ liệu cũ, bảng có bộ lọc, hàng xen kẽ, giờ Việt Nam.
- [x] Hoàn tất QA và cập nhật PR #30; chi tiết ở docs/story-v2-qa/sheet-refinement/REPORT.md.
- [ ] Parker nâng cấp Apps Script và kiểm tra trên Google Sheets/iPhone thật.

## Review fixes 2026-10-31 (Parker duyệt)
- [x] Tiêu đề màn 9/11 về cỡ chung 24px trên iPhone; kicker cùng khoảng chữ các màn khác; lede màn 9 in nghiêng như các màn khác.
- [x] Parker duyệt câu xác nhận mới `wish.sent` ("Điều ước đã lên bầu trời rồi ✨").
- [x] Gộp CSS ghi đè cuối file vào rule gốc của Dreams/Wish; xóa `.dreams-note` thừa. So computed style trước/sau ở 430×932, 430×739, 1280×800 (cả bàn phím mở): chỉ khác đúng ba điểm trên.
- [x] `npm run sheet-ui-check` (tự tìm Chrome, chỉ chụp ảnh khi có `--shots`); script dùng `fileURLToPath`.
- [x] README Sheet: hậu quả khi đổi cột và cách khôi phục.
- Giữ nguyên: lede cũ màn 9 trong `content.json` (không xóa key); dòng lựa chọn cũ vẫn ngăn bằng dấu phẩy sau nâng cấp vì nội dung có thể chứa dấu phẩy.

## CI Story V2 nhanh hơn (2026-10-31, nhánh `chore/faster-story-v2-ci`)

Đo trên 8 lần chạy gần nhất: 7–9 phút; overlap ~5,5 phút (2.880 trường hợp chạy nối tiếp), journey ~1 phút, ảnh 15 màn ~45 giây, phần còn lại ~20 giây.

- [x] `overlap-check.mjs`: thêm `OVERLAP_SHARD=i/n` chia viewport xen kẽ; sai cú pháp hoặc phần rỗng thì báo lỗi.
- [x] Composite action `.github/actions/setup-site`: Node 22 + cache npm, Chrome, `npm ci`, `CHROME_PATH`, `qa-logs/`.
- [x] Workflow: job `checks` (lint, build, content, progress, unit tests `scripts/*.test.mjs`, ảnh 15 màn), job `journey`, job `overlap` ma trận 6 phần; log riêng từng job.
- [x] `concurrency`: hủy lần chạy cũ của cùng PR, không hủy trên `main`. Bỏ nhánh đã merge `fix/story-v2-production-review` khỏi `push`.
- [x] Không giảm phạm vi kiểm tra: tổng số trường hợp của 6 phần = 2.880.
- [x] Kiểm tra cục bộ: 6 phần chạy song song trên một preview, cộng lại đủ trường hợp, 0 lỗi; shard sai báo lỗi.
- [x] Đẩy PR, đo thời gian CI thật; cập nhật PROJECT_CONTEXT §5, §8, §12, §13.

### Kết quả cục bộ
- `OVERLAP_SHARD=7/6` và `abc` báo lỗi rõ ràng.
- 6 phần chạy song song trên một preview: mỗi phần 480 trường hợp, 0 lỗi (tổng 2.880, bằng bản cũ). Khi chạy 6 phần cùng lúc trên một máy Mac, tiến trình treo sau khi xong (không in tổng kết); chạy riêng như CI thì thoát bình thường.
- `OVERLAP_SHARD=2/6 npm run overlap` (đúng như CI): 480 trường hợp, 0 lỗi, 118 giây kể cả build.

### Kết quả CI thật (PR #34)
- Cả lần chạy: 1 phút 45 giây (trước: 7–9 phút). `checks` 1m01, `journey` 1m14, 6 phần overlap 1m20–1m41.
- 6 phần overlap: mỗi phần 480 trường hợp, tổng 2.880, 0 lỗi. Mọi check xanh.

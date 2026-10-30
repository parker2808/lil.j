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

> **Tạm dừng (Parker, 2026-10-30):** chỉ bắt đầu sau khi [PR #29](https://github.com/parker2808/lil.j/pull/29) (`fix/desktop-chapter-drawer`) được merge vào `main`.
> - Lúc đó rebase nhánh này lên `main` mới, rồi làm lại ảnh dựng thử màn 12 (cả lúc bàn phím mở) trước khi code.
> - PR #29 đụng nhiều file của plan này: `WishSky.tsx`, `App.tsx`, `flow.ts`, `content.json`, `styles.css`, `types.ts`, `story-v2-check`, `selfcheck`, `overlap-check`.
> - Riêng màn 12: PR #29 chuyển dòng `wish-read` ("Điều ước đã lên bầu trời…") xuống **dưới ô nhập**, và thêm bong bóng `wish-bubble` khi bấm vào sao.
> - Thứ tự dưới đáy màn cần chốt lại với Parker: dòng nhắc → ô nhập → công tắc → `wish-read`. Đo lại 430×739 lúc bàn phím mở, vì có thêm một dòng.
>
> **Thiết kế đã chốt: A, công tắc bầu trời đêm (Parker, 2026-10-30).**
> - Rãnh 58×32 là mảnh trời đêm có đốm sao.
> - Tắt (gửi cho anh): núm là ngôi sao hồng phát sáng.
> - Bật (giữ riêng): núm thành trăng khuyết tím nhạt, rãnh tối hơn và có quầng sáng tím.
> - Nhãn "Giữ điều ước cho riêng em" nằm bên trái. Cả dòng bấm được, `role="switch"`.
> - Đặt tên class riêng (ví dụ `sw-star`, `sw-moon`) vì `.star` đã dùng cho chòm sao ở màn 2.
> - Ảnh: `docs/wish-layout-mock/A-*.png` (không đưa vào PR).

Quyết định của Parker (2026-10-30): dùng Google Sheet để lưu những gì cô ấy chọn ở màn 9 (`dreams`) và điều ước ở màn 12 (`wish`). Cô ấy không phải bấm thêm gì, và trên màn hình có ghi rõ anh sẽ thấy. "Giữ điều ước cho riêng em" thì không gửi gì. Parker cũng đồng ý bỏ quy tắc "không máy chủ, không cơ sở dữ liệu" cho riêng tính năng này.

### Câu chữ (VI đã chốt, EN chờ Parker duyệt)
- [ ] `share.dreamsNote`, dòng nhỏ dưới lede màn 9
  - VI: "Em thích điều nào thì tích lại nhé. Anh sẽ thấy để mình cùng lên kế hoạch."
  - EN: "Tick the ones you like. I'll see them, so we can plan them together."
- [ ] `share.wishNote`, dòng nhỏ ngay trên ô nhập ở màn 12 (Parker chốt câu 1, 2026-10-30)
  - VI: "Gửi lên thì anh đọc được, giữ riêng thì chỉ em biết."
  - EN: "Send it and I'll read it. Keep it, and it's only yours."
- [ ] `wish.keep` thành nhãn của công tắc ngay dưới ô nhập. Chữ giữ nguyên, thêm biểu tượng ổ khóa.
- [ ] `wish.send` (nhãn của nút mũi tên, dành cho trình đọc màn hình)
  - VI: "Gửi điều ước cho anh ✨"
  - EN: "Send this wish to me ✨"
### Phần Google Sheet (`tools/sheet-sync/`)
- [ ] `Code.gs`: Apps Script gắn với Sheet của Parker
  - `doPost` dùng `LockService` để tránh hai lần ghi chồng nhau.
  - Hai trang:
    - `Lựa chọn`: cập nhật lúc, thiết bị, các việc đã chọn, mã lựa chọn, thử nghiệm.
    - `Điều ước`: lúc gửi, thiết bị, điều ước, mã điều ước, thử nghiệm.
  - Múi giờ `Asia/Ho_Chi_Minh`.
- [ ] Kiểm tra dữ liệu ở phía script
  - `kind` là `dreams` hoặc `wish`.
  - Mã thiết bị và mã điều ước khớp mẫu UUID.
  - Mã lựa chọn khớp `^d\d{1,2}$`, tối đa 20 mục.
  - Mỗi chuỗi tối đa 180 ký tự.
  - Thân request tối đa 4 KB.
  - Dữ liệu sai thì bỏ qua, trả `{ ok: false }`.
- [ ] Ghi dữ liệu không tạo bản trùng
  - `dreams`: mỗi thiết bị một dòng, gửi lại thì ghi đè dòng đó.
  - `wish`: nếu mã điều ước đã có thì bỏ qua.
- [ ] `README.md` tiếng Việt: tạo Sheet, mở Apps Script, dán code, Deploy (Web app, Execute as: Me, Who has access: Anyone), copy URL `/exec`, dán vào biến `VITE_SHEET_URL` trên Vercel (Production), rồi Redeploy.

### Phần website (`site/`)
- [ ] `src/lib/sheet-sync.ts`, một module độc lập để test được bằng `node --test`
  - Mã thiết bị: `crypto.randomUUID()`, lưu ở `lilj.visitor.v1`.
  - Hàng chờ gửi: `lilj.outbox.v1`, tách khỏi `lilj.progress.v1` nên không phải đổi cấu trúc tiến trình.
    - `dreams`: chỉ giữ bản mới nhất.
    - `wish`: mỗi điều ước một mục, theo mã.
  - Gửi bằng `fetch(VITE_SHEET_URL, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body })`. Dùng `text/plain` để tránh preflight; Apps Script trả JSON có CORS.
    - Chỉ xóa mục khỏi hàng chờ khi nhận `{ ok: true }`.
    - Lỗi mạng thì giữ lại, không hiện gì cho cô ấy.
  - Các lúc gửi:
    - 1,5 giây sau thay đổi cuối cùng.
    - Khi mở website.
    - Khi có sự kiện `online`.
    - Khi `visibilitychange` sang hidden (thêm `keepalive`).
  - `VITE_SHEET_URL` trống thì tắt hẳn: không lưu hàng chờ, không gửi. Preview, CI và máy dev mặc định không gửi.
  - `?dev=1` thì gửi kèm `test: true` để Parker lọc bản thử của mình trên Sheet.
  - Không gửi IP, user agent hay thông tin thiết bị. Chỉ gửi mã thiết bị ngẫu nhiên.
- [ ] Màn 9 `Dreams.tsx`
  - Sau mỗi lần chọn hoặc bỏ chọn, xếp vào hàng chờ danh sách hiện tại theo thứ tự trong `content.dreams`, gồm mã và chữ tiếng Việt.
  - Bỏ hết lựa chọn cũng gửi (danh sách rỗng).
  - Không gửi khi chỉ mở màn mà không bấm gì.
- [ ] Màn 12: công tắc "Giữ riêng" áp dụng cho từng điều ước (Parker, 2026-10-30). Thiết kế đã dựng thử ở `docs/wish-layout-mock/switch-*.png`.
  - `<button role="switch" aria-checked>` theo thiết kế A ở trên. Cả dòng bấm được, cao tối thiểu 44px.
  - Tắt (mặc định): điều ước lên bầu trời và được gửi lên Sheet.
  - Bật: điều ước vẫn lên bầu trời trên máy cô ấy, có `private: true`, và không gửi.
  - `sendWish(text, private)` trong `App.tsx` chỉ xếp vào hàng chờ khi `private` là false.
  - Bỏ nút "Giữ điều ước cho riêng em" dạng chữ.
  - Màn này bắt buộc phải ước (Parker, 2026-10-30): Next chỉ hiện khi đã có ít nhất một điều ước, dù giữ riêng hay gửi.
    - Không còn cách nào bật `wishPrivate` từ giao diện.
    - Tiến trình cũ có sẵn `wishPrivate: true` vẫn được tính là xong màn, để không kẹt người đã lưu.
    - Sửa `story-v2-check` (bài `private-wish`) và `selfcheck` theo luật mới.
  - Khi bàn phím mở (đã dựng thử ở `docs/wish-layout-mock/*-kb-*.png`):
    - Dòng nhắc, ô nhập và nút chọn nằm chung một khối `wish-dock`, dính sát phía trên bàn phím.
    - Ẩn lời dẫn `wish.lede` để dòng nhắc có khoảng thở. Tiêu đề vẫn giữ.
    - Đo ở 430×739 (vùng nhìn thấy 429px): đáy nút chọn ở 419px, không phần nào chồng nhau.
    - Vẫn phải thử trên iPhone thật: bàn phím tiếng Việt có thanh gợi ý có thể cao hơn bản giả lập.
  - Điều ước cũ đã có trên máy trước khi có tính năng không được gửi.
- [ ] Hiển thị hai dòng `share.*` dưới lede: `ChapterFrame` cho màn 9, `.wish-copy` cho màn 12.
  - Chữ nhỏ, màu `--muted`, không nghiêng, không viền vuông.
  - Nếu ở 430×739 màn 12 bị tràn hoặc phải cuộn phần chữ, báo Parker để chọn: gộp dòng mới vào `wish.lede` hoặc rút ngắn câu.
- [ ] `types.ts`: thêm `share: { dreamsNote: Copy; wishNote: Copy }`. `collectCopyProblems` tự kiểm tra đủ VI/EN.

### Kiểm tra
- [ ] `scripts/sheet-sync.test.mjs` (`node --test`, fetch giả lập)
  - URL trống thì không gửi.
  - `dreams` chỉ giữ bản mới nhất.
  - `wish` không trùng.
  - Lỗi mạng thì giữ hàng chờ, thành công thì xóa.
  - Nội dung gửi không có trường thừa.
- [ ] Kiểm tra `Code.gs` bằng test Node, giả lập `SpreadsheetApp`
  - Dữ liệu sai bị bỏ qua.
  - `dreams` ghi đè đúng dòng.
  - `wish` trùng mã bị bỏ qua.
- [ ] `story-v2-check`
  - Build với `VITE_SHEET_URL=https://sheet.invalid/exec`, dùng `page.route` để chặn và đếm request.
  - Chọn việc ở màn 9 thì có đúng 1 request, chứa danh sách mới nhất.
  - Gửi điều ước thì có đúng 1 request.
  - "Giữ riêng" thì không có request nào.
  - Request lỗi không làm hỏng hành trình.
- [ ] Chạy `npm run lint`, `npm run build`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run memory-deck-test`, `npm run overlap` (VI và EN), `npm run story-v2-check`.
- [ ] Ảnh chụp màn 9 và màn 12 ở 430×932 và 430×739, cả lúc bàn phím mở, đặt trong `docs/story-v2-qa/`.
- [ ] Thử thật với Sheet của Parker (sau khi Parker Deploy script): mở bản Preview có đặt `VITE_SHEET_URL`, chọn và ước, rồi xem dòng mới xuất hiện trên Sheet.

### Bàn giao
- [ ] `PROJECT_CONTEXT.md`
  - §1: ghi ngoại lệ Google Sheet (2026-10-30).
  - §4: bỏ quy tắc "không máy chủ" cho riêng tính năng này. Ghi rõ URL `/exec` không phải bí mật (chỉ ghi được, không đọc được). Không ghi URL vào repo.
  - §12 và §13: cập nhật trạng thái và changelog.
- [ ] Một PR nháp. Không merge, không deploy, không đặt `VITE_SHEET_URL` thay Parker.

### Rủi ro đã biết
- URL nhận dữ liệu nằm trong bundle, nên người khác có thể ghi rác vào Sheet nhưng không đọc được gì. Script giới hạn kích thước và mẫu dữ liệu để hạn chế.
- Không xác minh được người gửi là cô ấy (website không có tài khoản).
- Dữ liệu cô ấy làm trước khi tính năng chạy không lên Sheet. Website còn khóa tới 2026-11-18, nên gần như chưa có gì.

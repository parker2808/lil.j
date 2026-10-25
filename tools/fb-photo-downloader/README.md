# FB Photo Downloader

Công cụ **chạy trong trình duyệt** (phiên đăng nhập của bạn) để tải ảnh Facebook đang xem được trên profile / album — phục vụ website birthday (lil.j).

> **Không** lưu mật khẩu, **không** lấy cookie ra ngoài, **không** đăng nhập headless, **không** gọi API riêng / không chính thức của Facebook. Tool chỉ thao tác trên trang bạn đã mở sẵn.

---

## Bạn cần gì

- Tài khoản Facebook đã đăng nhập trên Chrome / Firefox / Edge
- Quyền xem ảnh trên profile/album mục tiêu (ảnh bạn vốn nhìn thấy được)
- Một trong hai cách chạy:
  1. **Tampermonkey** (khuyến nghị) + userscript
  2. Hoặc dán **console snippet** vào DevTools

---

## Cách 1 — Tampermonkey (khuyến nghị)

### Cài đặt

1. Cài [Tampermonkey](https://www.tampermonkey.net/) cho trình duyệt.
2. Mở Tampermonkey → **Create a new script**.
3. Xóa nội dung mẫu, dán toàn bộ file [`fb-photo-downloader.user.js`](./fb-photo-downloader.user.js).
4. **File → Save**.

### Chạy

1. Đăng nhập Facebook như bình thường.
2. Mở **tab Photos** của profile, hoặc mở **một album** cụ thể.
3. Panel **FB Photo Downloader** xuất hiện góc dưới-phải.
4. Bấm **Bắt đầu**.
5. Tool sẽ:
   - Cuộn trang từ từ (delay ngẫu nhiên giống người)
   - Thu thập link ảnh (`/photo/?fbid=…`, `/photo.php`, …) — **không dựa vào class CSS** bị obfuscate
   - Với mỗi ảnh: mở permalink, lấy URL độ phân giải cao nhất có trong HTML
   - Bỏ trùng, giới hạn tốc độ, hiện tiến độ; bấm **Dừng** bất cứ lúc nào
   - Đóng gói ZIP (`fb-photos_….zip`) và tải về máy
6. Tên file dạng `0001_2023-05-12.jpg` (có ngày nếu parse được) hoặc `0001.jpg`.

---

## Cách 2 — Console snippet (không cần extension)

1. Mở Facebook → tab Photos / album.
2. Mở DevTools (**F12** hoặc **Cmd+Option+J**) → tab **Console**.
3. Dán toàn bộ nội dung [`console-snippet.js`](./console-snippet.js) → Enter.
4. Dùng panel giống Cách 1.

**Khác biệt:** bản console dùng `fetch` thường nên CDN `fbcdn.net` đôi khi **chặn CORS**. Nếu nhiều ảnh lỗi CORS, hãy dùng Cách 1 (Tampermonkey + `GM_xmlhttpRequest`).

---

## (Tuỳ chọn) Nén WebP cho website

Sau khi giải nén ZIP, có thể resize ~1200px và chuyển WebP bằng script Node + [sharp](https://sharp.pixelplumbing.com/):

```bash
cd tools/fb-photo-downloader/compress
npm install
mkdir -p input output
# copy ảnh đã tải vào input/
cp ~/Downloads/fb-photos/*.jpg input/
npm run compress
# hoặc: node compress.mjs ./input ./output
```

Tuỳ chỉnh qua biến môi trường:

```bash
MAX_WIDTH=1200 WEBP_QUALITY=82 node compress.mjs ./input ./output
```

Ảnh WebP nằm trong `compress/output/`.

---

## Hành vi & an toàn

| Hạng mục | Chi tiết |
|----------|----------|
| Phiên đăng nhập | Dùng cookie trình duyệt hiện tại; không export |
| Thu thập link | Pattern URL `/photo/?fbid=`, `/photo.php`, `/photos/…` |
| Full-res | Ưu tiên `browser_native_hd_url`, rồi SD, rồi URI có kích thước lớn, rồi `og:image` |
| Rate limit | Delay ngẫu nhiên giữa lần cuộn / lần fetch ảnh |
| Trùng lặp | Bỏ qua cùng `fbid` và cùng URL ảnh |
| Dừng | Nút **Dừng** đặt cờ; vòng lặp dừng sau thao tác hiện tại |
| ZIP | JSZip (CDN); thư mục trong zip: `fb-photos/` |

---

## Giới hạn đã biết

Những điểm sau **không thể kiểm chứng live** trong môi trường agent (không đăng nhập Facebook được). Hãy coi là rủi ro thực tế:

1. **Giao diện Facebook thay đổi thường xuyên** — payload HTML/JSON (`browser_native_hd_url`, v.v.) có thể đổi tên field; khi đó tool vẫn thu link nhưng có thể không lấy được full-res.
2. **Lazy-load / infinite scroll** — album rất lớn có thể cần cuộn lâu hơn; nếu vẫn thiếu ảnh, tăng `scrollIdleRounds` trong mã nguồn rồi chạy lại.
3. **Quyền riêng tư** — chỉ tải được ảnh bạn đã xem được; ảnh bạn bè giới hạn / bị chặn sẽ không xuất hiện trên trang.
4. **Rate limiting / checkpoint của Facebook** — scroll/fetch quá nhanh có thể gặp tạm khóa hoặc captcha; tool đã delay ngẫu nhiên nhưng chưa “bất khả chiến bại”.
5. **Video / Reel** — không phải mục tiêu; URL video sẽ bị bỏ qua khi chọn ảnh.
6. **CORS (console)** — bản dán Console có thể fail khi tải binary từ CDN; userscript ổn định hơn.
7. **Ngày trong tên file** — phụ thuộc field thời gian còn nằm trong HTML; nhiều ảnh có thể chỉ được `0001.jpg`.
8. **m.facebook.com** — userscript match cả mobile web, nhưng layout khác desktop; nên dùng `www.facebook.com`.
9. **Không thay thế backup chính thức** — đây là tiện ích cá nhân cho ảnh bạn được phép xem, không phải công cụ thu thập hàng loạt trái phép.

Nếu Facebook đổi DOM mạnh: mở một permalink ảnh → View Source → tìm chuỗi `scontent` / `browser_native` và cập nhật hàm `pickBestImageUrl` cho khớp.

---

## Kiểm tra offline (không cần Facebook)

```bash
node tools/fb-photo-downloader/selftest.mjs
```

Script này chỉ kiểm tra parse `fbid` / chọn URL HD / ngày từ HTML giả lập — **không** thay cho test live trên Facebook.

---

## Cấu trúc thư mục

```
tools/fb-photo-downloader/
├── README.md                      ← bạn đang đọc
├── fb-photo-downloader.user.js    ← Tampermonkey
├── console-snippet.js             ← dán vào DevTools
├── selftest.mjs                   ← test parse offline
└── compress/
    ├── package.json
    ├── compress.mjs               ← sharp → WebP
    └── .gitignore
```

---

## Checklist nhanh

- [ ] Đã đăng nhập Facebook trên trình duyệt thật của bạn  
- [ ] Đang ở trang Photos hoặc album (không phải News Feed)  
- [ ] Đã cài userscript **hoặc** dán console snippet  
- [ ] Bấm **Bắt đầu**, chờ ZIP tải về  
- [ ] (Tuỳ chọn) Chạy `compress` để ra WebP cho site  

Chúc website birthday sớm hoàn thành 🎂

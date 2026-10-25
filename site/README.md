# Vũ trụ của em

Website sinh nhật, mobile-first. Mọi chữ và ảnh em thấy trên trang đều lấy từ [`content.json`](./content.json). Đổi nội dung là sửa file đó, không cần đụng code.

Bản đang commit là **nội dung giả**: tên, biệt danh, ảnh gradient, nhạc tạo bằng code. Parker thay bằng đồ thật khi sẵn sàng.

Mật khẩu giả để vào cổng: `bé yêu`.

## Chạy trên máy

Cần Node 18 trở lên.

```bash
cd site
npm install
npm run dev
```

Mở địa chỉ Vite in ra (thường là `http://localhost:5173`) trên điện thoại cùng mạng, hoặc thu nhỏ trình duyệt còn khoảng 390px.

```bash
npm run build    # tsc + vite build
npm run preview  # xem bản build
npm run lint
node scripts/selfcheck.mjs
```

Ảnh placeholder và file nhạc được tạo lại bằng:

```bash
npm run placeholders
```

## Đưa lên Vercel

Hai cách, chọn một:

1. **Khuyến nghị.** Tạo project, Root Directory = `site`. Framework preset Vite. `site/vercel.json` đã có fallback SPA và cache.
2. Deploy cả repo. `vercel.json` ở thư mục gốc gọi `npm run build` trong `site` và xuất `site/dist`.

Mic thổi nến chỉ chạy trên HTTPS (bản Vercel có sẵn). `localhost` cũng được.

Trang có `noindex` để đỡ bị Google nhặt. Gỡ thẻ đó trong `index.html` nếu muốn.

## Sửa `content.json`

File nằm ở `site/content.json`. Sau khi sửa, chạy lại `npm run dev` hoặc build. Các chuỗi giao diện (nút, gợi ý, thư) cũng nằm trong file này.

| Khóa | Ý nghĩa |
| --- | --- |
| `meta.title` | Tên vũ trụ, hiện ở cổng và bầu trời. |
| `meta.herName` | Tên gọi nhỏ, hiện phía trên bầu trời. |
| `meta.constellationName` | Tên hiện giữa chòm sao sau khi mở đủ 7 chương. |
| `meta.monogram` | Một chữ trên con dấu sáp. |
| `gate.password` | Biệt danh đúng. So khớp không phân biệt hoa thường, gộp khoảng trắng. **Phải đúng dấu.** Đây là khoá tình cảm, không phải bảo mật: ai xem mã nguồn sẽ thấy. |
| `gate.question` | Câu trên cổng. Bản mẫu: "Ai đang tới đây vậy?" |
| `gate.placeholder` / `gate.submit` / `gate.empty` | Ô nhập, nút, câu khi bỏ trống. |
| `gate.hints` | Mảng gợi ý khi nhập sai. Xoay vòng. |
| `startDate` | ISO 8601 có múi giờ, ví dụ `2024-02-14T19:30:00+07:00`. Đồng hồ đếm từ mốc này. |
| `music` | Đường dẫn file trong `public`, ví dụ `/music/nen.wav`. Đổi sang `.mp3` cũng được, miễn là trình duyệt phát được. Nhạc chỉ phát sau cú chạm (mở phong thư hoặc nút nhạc). |
| `envelope` | Lời trên phong thư: `greeting`, `sealCaption`, `openHint`, `body`, `enter`. |
| `chapters` | Đúng 7 chương, `id` cố định: `gallery`, `scratch`, `quiz`, `memory`, `dreams`, `friends`, `counter`. Đổi được `star` (nhãn ngắn trên sao), `kicker`, `title`, `lede`. Không đổi `id`. |
| `photos` | Ảnh polaroid. `src` trỏ file trong `public` (`/photos/01.webp`). `alt`, `caption`, `compliment` (câu giấu mặt sau). `pair: true` thì ảnh được đưa vào trò nhớ — lấy tối đa 6 ảnh đầu tiên có `pair: true` (12 thẻ). Cần ít nhất 2 ảnh `pair`. |
| `scratches` | Thẻ cào. `cover` là chữ trên lớp vàng, `reveal` là điều anh thương. |
| `quiz` | Câu hỏi. `options` là mảng, `answer` là **chỉ số bắt đầu từ 0**. `rightNote` / `wrongNote` hiện sau khi chọn. |
| `quizSummary` | Câu tổng kết. Chỗ trống `{ok}` và `{total}`. |
| `memoryCopy` | Chữ trong trò nhớ. `{n}` là số lượt. |
| `dreams` | `text` là ước, `detail` là dòng nhỏ. Em tích được; trình duyệt nhớ. |
| `friendNotes` | `author`, `text`, `tone`: `gold`, `blush`, `sage`, `sky`, `cream`. Tone lạ sẽ thành `cream`. |
| `together.past` | Câu khi `startDate` đã qua. Chỗ trống: `{days}` `{hours}` `{minutes}` `{seconds}`. |
| `together.future` | Câu khi ngày bắt đầu còn ở tương lai. Cùng các chỗ trống. |
| `cake` | Bánh. `candles` từ 1 đến 8. `letter` là thư máy đánh chữ, xuống dòng bằng `\n`. |
| `openWhen` | Các lá "Mở khi…". Bản mẫu có buồn, nhớ anh, giận anh, mất ngủ. Mỗi lá mở một lần mỗi ngày theo **múi giờ của điện thoại**, rồi niêm lại ngày hôm sau. Thêm phần tử mới là thêm một lá. |
| `lettersCopy` | Chữ quanh hộp thư. |
| `finale` | Câu "Cho anh yêu em thêm một năm nữa nhé?", nhãn Có/Không, `teases` khi nút Không chạy, và lời sau khi bấm Có. |
| `ui` | Nút và câu dẫn còn lại (về bầu trời, nhạc, đặt lại…). |

Ví dụ thêm một ảnh:

```json
{
  "id": "p9",
  "src": "/photos/anh-bien.webp",
  "alt": "Hai đứa ở biển",
  "caption": "Biển tháng sáu",
  "compliment": "Em nhìn sóng lâu hơn anh nhìn em.",
  "pair": true
}
```

Bỏ file vào `site/public/photos/`, rồi trỏ `src`.

## Ảnh thật

Dùng pipeline có sẵn, **không sửa** `tools/fb-photo-downloader`:

```bash
cd tools/fb-photo-downloader/compress
npm install
node compress.mjs ./input ../../../site/public/photos
```

Mặc định: rộng tối đa ~1200px, WebP. Chỉnh `MAX_WIDTH` và `WEBP_QUALITY` như README của tool. Ảnh ra dạng `0001.webp`. Sửa `photos[].src` cho khớp. Trang dùng `loading="lazy"` (hai ảnh polaroid đầu tải sớm).

Đừng commit ảnh riêng tư nếu repo công khai.

## Nhạc

`public/music/nen.wav` là vòng hợp âm ngắn, tạo bởi `scripts/make-placeholders.mjs`, để có tiếng khi chưa có bài. Thay bằng file em có quyền dùng, rồi sửa `music` trong `content.json`. Nên giữ file nhẹ (dưới khoảng 1MB).

## Trình duyệt nhớ gì

Khóa `lilj.progress.v1` trong `localStorage`:

- đã qua cổng, đã mở thư
- sao nào đã mở (đủ 7 thì chòm sao hiện)
- ảnh đã lật, thẻ đã cào, đáp án đố, kỷ lục trò nhớ, ước đã tích
- nến đã tắt, đã bấm Có
- ngày mở từng lá "Mở khi…"
- đang tắt tiếng hay không

Nút **Đặt lại** ở cuối bầu trời xóa khóa này. Hoặc xóa tay trong DevTools.

## Bố cục trang

1. Cổng: nhập đúng biệt danh. Sai thì gợi ý, không hiện mật khẩu.
2. Phong thư sáp. Chạm con dấu để mở, nhạc nền và tim bắt đầu.
3. Bầu trời, 7 sao. Mỗi sao một chương: polaroid, thẻ cào (canvas, chạm được), đố "Anh hiểu em bao nhiêu?", lật ảnh tìm cặp, ước mơ, tường giấy note, đồng hồ "đã bên nhau".
4. Khi đủ 7 sao, các sao nối thành một trái tim và tên trong `constellationName` hiện ở giữa.
5. Ba cửa mở ra: bánh (thổi mic hoặc chạm nến, rồi thư), hộp "Mở khi…", câu hỏi cuối. Nút **Không** chạy trốn.
6. Tiến độ nằm trong `localStorage`, tải lại không mất.

## Góc còn thô

- Chòm sao là một trái tim có tên em ở giữa, không phải các sao xếp thành nét chữ. Làm vậy để đổi tên trong JSON vẫn đúng, không phải vẽ lại vị trí sao.
- Câu đồng hồ có thêm **phút** (`{minutes}`) để giây chỉ chạy 0–59. Muốn đúng từng chữ "X ngày Y giờ Z giây" thì sửa `together.past`.
- Thổi nến phụ thuộc mic và ngưỡng âm lượng. Máy yếu hoặc từ chối quyền thì chạm nến.
- Nhạc giả nghe như một vòng nốt đơn, không phải bài hát.
- Mật khẩu nằm trong file JSON nên không giấu được với người biết xem source.
- Font lấy từ Google Fonts. Mất mạng thì trang vẫn chạy, chỉ đổi sang font hệ thống.

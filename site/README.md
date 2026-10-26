# Vũ trụ của em

Website sinh nhật, mobile-first. Mọi chữ và ảnh em thấy trên trang đều lấy từ [`content.json`](./content.json). Đổi nội dung là sửa file đó, không cần đụng code.

Bản đang commit là **nội dung giả**: tên gọi là **J**, biệt danh, ảnh gradient, nhạc tạo bằng code. Parker thay bằng đồ thật khi sẵn sàng.

Trang có hai ngôn ngữ, tiếng Việt và tiếng Anh. Nút **VI / EN** ở góc trái nhớ lựa chọn trong `localStorage` (`lilj.locale.v1`).

Mật khẩu giả để vào cổng: `bé yêu`. Mật khẩu chỉ có một chuỗi, không dịch.

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

Mọi câu người dùng đọc được viết thành một cặp:

```json
{ "vi": "Câu tiếng Việt", "en": "The English line" }
```

Cả hai ngôn ngữ đều bắt buộc, không để trống. `npm run build` sẽ báo nếu thiếu. Những khóa **không** dịch, vẫn là một chuỗi thường: `gate.password`, `startDate`, `music`, `birth.when`, `id`, `src`, `pair`, `answer`, `candles`, `tone`, `author`, và ba tên `meta.herName`, `meta.constellationName`, `meta.monogram` (bản mẫu đang là `J`). `birth.lat` và `birth.lon` là số.

| Khóa | Ý nghĩa |
| --- | --- |
| `meta.title` | Tên vũ trụ, hiện ở cổng và bầu trời. Cặp `{vi, en}`. |
| `meta.description` | Mô tả trang, đổi theo ngôn ngữ. |
| `meta.herName` | Tên gọi nhỏ, hiện phía trên bầu trời. Một chuỗi. Bản mẫu: `J`. |
| `meta.constellationName` | Tên hiện giữa bầu trời khi các sao tự nối thành trái tim. Một chuỗi. Bản mẫu: `J`. |
| `meta.monogram` | Một chữ trên quả cầu ở cổng. Một chuỗi. Bản mẫu: `J`. |
| `gate.password` | Biệt danh đúng, một chuỗi cho cả hai ngôn ngữ. So khớp không phân biệt hoa thường, gộp khoảng trắng. **Phải đúng dấu.** Đây là khoá tình cảm, không phải bảo mật: ai xem mã nguồn sẽ thấy. |
| `gate.question` | Câu trên cổng. Bản mẫu: "Ai đang tới đây vậy?" |
| `gate.placeholder` / `gate.submit` / `gate.empty` | Ô nhập, nút, câu khi bỏ trống. |
| `gate.hints` | Mảng gợi ý khi nhập sai. Xoay vòng. |
| `startDate` | ISO 8601 có múi giờ, ví dụ `2024-02-14T19:30:00+07:00`. Đồng hồ đếm từ mốc này. |
| `music` | Đường dẫn file trong `public`, ví dụ `/music/nen.wav`. Đổi sang `.mp3` cũng được, miễn là trình duyệt phát được. Nhạc bắt đầu khi em qua cổng, và nhỏ dần ở lá thư cuối. |
| `birth` | Bản đồ sao đêm em sinh ra. `when` là ISO 8601 có múi giờ. `lat`, `lon` là số (Bắc và Đông dương). `place` là cặp `{vi, en}`. Các nhãn `north` `east` `south` `west`, `kicker`, `title`, `lede`, `caption` (chỗ trống `{when}` và `{place}`). |
| `wish` | Ước gửi lên trời: `kicker`, `title`, `lede`, `placeholder`, `send`, `empty`, `sent`, `more`, `saved`. |
| `finalLetter` | Lá thư cuối. `body` xuống dòng bằng `\n`, hiện từng dòng. `skip`, `replay`, `closing`. |
| `flow` | Lời dẫn đường đi thẳng: `next`, `back`, `progress` (`{n}`, `{total}`), `done`, `doneLast`, `devJump` (`{n}`), và `hints` đúng 9 khóa `gate`, `sky`, `birth`, `gallery`, `quiz`, `counter`, `cake`, `wish`, `letter`. |
| `envelope` | Lời phong thư cũ, vẫn nằm trong file nhưng không còn trên đường đi. |
| `chapters` | Bảy mục nội dung, `id` cố định: `gallery`, `scratch`, `quiz`, `memory`, `dreams`, `friends`, `counter`. Đường đi chỉ mở `gallery`, `quiz`, `counter`. Đổi được `star`, `kicker`, `title`, `lede`. Không đổi `id`. |
| `photos` | Ảnh polaroid. `src` trỏ file trong `public` (`/photos/01.webp`). `alt`, `caption`, `compliment` (câu giấu mặt sau). `pair: true` thì ảnh được đưa vào trò nhớ — lấy tối đa 6 ảnh đầu tiên có `pair: true` (12 thẻ). Cần ít nhất 2 ảnh `pair`. |
| `scratches` | Thẻ cào. `cover` là chữ trên lớp vàng, `reveal` là điều anh thương. |
| `quiz` | Câu hỏi. `options` là mảng, `answer` là **chỉ số bắt đầu từ 0**. `rightNote` / `wrongNote` hiện sau khi chọn. |
| `quizSummary` | Câu tổng kết. Chỗ trống `{ok}` và `{total}`. |
| `memoryCopy` | Chữ trong trò nhớ. `{n}` là số lượt. |
| `dreams` | `text` là ước, `detail` là dòng nhỏ. Em tích được; trình duyệt nhớ. |
| `friendNotes` | `author` là một chuỗi (tên riêng). `text` là cặp `{vi, en}`. `tone`: `gold`, `blush`, `sage`, `sky`, `cream`. Tone lạ sẽ thành `cream`. |
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
  "alt": { "vi": "Hai đứa ở biển", "en": "The two of us at the sea" },
  "caption": { "vi": "Biển tháng sáu", "en": "June sea" },
  "compliment": { "vi": "Em nhìn sóng lâu hơn anh nhìn em.", "en": "You watched the waves longer than I watched you." },
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

- `step` và `unlocked`: đang đứng ở bước nào, và bước xa nhất đã mở
- đã qua cổng, bầu trời đã vẽ xong, đã chạm một chòm sao, đã xem đồng hồ
- ảnh đã lật, đáp án đố, nến đã tắt
- các ước đã gửi (`wishes`: `id`, `text`, `at`)
- đã đọc hết lá thư cuối
- đang tắt tiếng hay không

Bản lưu cũ, nếu đã qua cổng mà chưa có `step`, sẽ mở lại ở bầu trời. Xóa khóa này trong DevTools để đi từ đầu. Thêm `?dev=1` vào địa chỉ thì có dãy số để nhảy bước và nút đặt lại — chỉ để thử.

Ngôn ngữ nằm ở khóa riêng `lilj.locale.v1` (`vi` hoặc `en`). Xóa tiến độ không đổi ngôn ngữ.

## Bố cục trang

Đường đi một chiều. Chấm tiến độ không bấm được. Nút **Tiếp** chỉ hiện khi bước đó xong. Nút tròn `←` chỉ lùi về bước đã mở.

1. Cổng. Đúng biệt danh thì tự sang bước sau. Sai thì gợi ý, không hiện mật khẩu.
2. Bầu trời. Các sao tự thắp, nối thành trái tim, rồi tên trong `constellationName` hiện ra. Xong thì mới có **Tiếp**.
3. Bản đồ sao đêm sinh, tính trên trình duyệt từ `birth.when`, `lat`, `lon`. Chạm hoặc rê một chòm sao để nghe tên.
4. Ảnh polaroid. Lật ít nhất một tấm.
5. Câu đố. Trả lời hết.
6. Đồng hồ "đã bên nhau". Ở lại một lát.
7. Bánh. Tắt hết nến (mic hoặc chạm) rồi mới sang ước.
8. Ước. Gửi ít nhất một câu. Câu đó bay thành sao băng, và còn đó khi quay lại.
9. Lá thư cuối, hiện từng dòng. Nhạc nhỏ dần. Đọc lại được. Không có bước sau.

`envelope`, thẻ cào, trò nhớ, ước mơ, lời bạn bè, hộp "Mở khi…", và câu hỏi cuối vẫn nằm trong `content.json` để khỏi mất chữ, nhưng không còn cửa để mở.

## Góc còn thô

- Chòm sao ở bước bầu trời là một trái tim có tên em ở giữa, không phải các sao xếp thành nét chữ. Bản đồ đêm sinh là danh mục sao sáng J2000 cộng giờ sao địa phương, bỏ qua tuế sai, nên là gần đúng chứ không phải phần mềm thiên văn.
- Đường đi không có menu chương. Muốn nhảy bước khi thử, thêm `?dev=1`.
- Câu đồng hồ có thêm **phút** (`{minutes}`) để giây chỉ chạy 0–59. Muốn đúng từng chữ "X ngày Y giờ Z giây" thì sửa `together.past`.
- Thổi nến phụ thuộc mic và ngưỡng âm lượng. Máy yếu hoặc từ chối quyền thì chạm nến.
- Nhạc giả nghe như một vòng nốt đơn, không phải bài hát.
- Mật khẩu nằm trong file JSON nên không giấu được với người biết xem source.
- Font lấy từ Google Fonts. Mất mạng thì trang vẫn chạy, chỉ đổi sang font hệ thống.

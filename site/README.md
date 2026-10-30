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
| `startDate` | ISO 8601 có múi giờ, ví dụ `2026-07-01T00:00:00+07:00`. Đồng hồ đếm từ mốc này. |
| `music` | Đường dẫn file trong `public`, ví dụ `/music/nen.wav`. Đổi sang `.mp3` cũng được, miễn là trình duyệt phát được. Nhạc bắt đầu khi em qua cổng, và nhỏ dần ở lá thư cuối. |
| `birth` | Bản đồ sao đêm em sinh ra. `when` là ISO 8601 có múi giờ. `lat`, `lon` là số (Bắc và Đông dương). `place` là cặp `{vi, en}`. Các nhãn `north` `east` `south` `west`, `kicker`, `title`, `lede`, `caption` (chỗ trống `{when}` và `{place}`). |
| `wish` | Ước gửi lên trời: `kicker`, `title`, `lede`, `placeholder`, `send`, `empty`, `sent`, `more`, `saved`. |
| `finalLetter` | Lá thư cuối. `body` xuống dòng bằng `\n`, hiện từng dòng. `skip`, `replay`, `closing`. |
| `flow` | Lời dẫn đường đi thẳng: `next`, `back`, `progress` (`{n}`, `{total}`), `done`, `doneLast`, `devJump` (`{n}`), và `hints` cho từng bước. Đường đang mở có 15 khóa: `gate`, `sky`, `birth`, `gallery`, `quiz`, `counter`, `cake`, `envelope`, `memory`, `scratch`, `letters`, `dreams`, `finale`, `wish`, `letter`. Khóa `friends` vẫn để trong file để bật lại bước lời bạn. |
| `envelope` | Phong thư sáp, bước ngay sau bánh. `greeting`, `sealCaption`, `openHint`, `body`. |
| `chapters` | Bảy mục nội dung, `id` cố định: `gallery`, `scratch`, `quiz`, `memory`, `dreams`, `friends`, `counter`. Đường đi đang mở sáu mục; `friends` tạm rút khỏi đường (dữ liệu và màn hình vẫn giữ). Đổi được `star`, `kicker`, `title`, `lede`. Không đổi `id`. |
| `eras[].photos` | Ảnh polaroid của từng chương. `src` là public id Cloudinary (`lilj/galaxy-v3/…`), không phải file trong repo. Chỉ ảnh đầu mỗi chương có `caption`. `date` bỏ trống — không in ngày giả. `compliment` là câu mặt sau. `memoryPhotoIds` chọn ảnh cho trò nhớ. |
| `scratches` | Thẻ cào. `cover` là chữ trên lớp phủ hồng, `reveal` là điều anh thương. |
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
  "id": "g-example",
  "src": "lilj/galaxy-v3/example/g-example",
  "caption": { "vi": "", "en": "" },
  "compliment": { "vi": "Em nhìn sóng lâu hơn anh nhìn em.", "en": "You watched the waves longer than I watched you." }
}
```

`src` là public id trên cloud `oiounrmh`. Trang tự thêm `c_limit`, `f_auto`, `q_auto` theo bề rộng. Không commit file ảnh vào repo.

## Ảnh thật

Ảnh đang giao từ Cloudinary, public id `lilj/galaxy-v3/<chủ đề>/<photo-id>`. Chỉ ảnh đầu mỗi chương có caption. Không ghi ngày lên polaroid. Ảnh phía sau dùng `loading="lazy"`.

## Nhạc

`public/music/nen.wav` là vòng hợp âm ngắn, tạo bởi `scripts/make-placeholders.mjs`, để có tiếng khi chưa có bài. Thay bằng file em có quyền dùng, rồi sửa `music` trong `content.json`. Nên giữ file nhẹ (dưới khoảng 1MB).

## Trình duyệt nhớ gì

Khóa `lilj.progress.v1` trong `localStorage`:

- `step` và `unlocked`: đang đứng ở bước nào, và bước xa nhất đã mở
- đã qua cổng, đã mở phong thư, bầu trời đã vẽ xong, đã chạm một chòm sao, đã xem đồng hồ, đã đọc lời bạn bè (khi bước đó có trên đường)
- ảnh đã lật, thẻ đã cào, đáp án đố, kỷ lục trò nhớ, ước đã tích, nến đã tắt, đã bấm Có
- ngày mở từng lá "Mở khi…"
- các ước đã gửi (`wishes`: `id`, `text`, `at`)
- đã đọc hết lá thư cuối
- đang tắt tiếng hay không

Bản lưu cũ, nếu đã qua cổng mà chưa có `step`, sẽ mở lại ở bầu trời. Bản lưu của đường đi 9 bước được đặt lại đúng cảnh (ước vẫn là ước, thư cuối vẫn là thư cuối). Bản lưu `flowVersion` 2 (đường 16 bước, có lời bạn) được đặt lại theo tên bước; nếu đang đứng ở lời bạn thì mở lại ở ước mơ. Xóa khóa này trong DevTools để đi từ đầu. Thêm `?dev=1` vào địa chỉ thì có dãy số để nhảy bước và nút đặt lại — chỉ khi có tham số đó, không ghi nhớ, và chỉ trên bản build có biến Vercel `VITE_DEV_MODE=true` (hoặc khi chạy `npm run dev`). Dãy số nằm trong phần đầu trang và trượt ngang nếu không đủ chỗ.

Lời bạn tạm không nằm trên đường đi. Trong `src/lib/flow.ts`, đổi `INCLUDE_FRIENDS` thành `true` thì bước đó trở lại giữa thư "Mở khi…" và ước mơ, và `flowVersion` về 2.

Ngôn ngữ nằm ở khóa riêng `lilj.locale.v1` (`vi` hoặc `en`). Xóa tiến độ không đổi ngôn ngữ.

## Bố cục trang

Đường đi một chiều. Chấm tiến độ không bấm được. Nút **Tiếp** chỉ hiện khi bước đó xong. Nút tròn `←` chỉ lùi về bước đã mở.

1. Cổng. Đúng biệt danh thì tự sang bước sau. Sai thì gợi ý, không hiện mật khẩu.
2. Bầu trời. Các sao tự thắp, nối thành trái tim, rồi tên trong `constellationName` hiện ra. Xong thì mới có **Tiếp**.
3. Bản đồ sao đêm sinh, tính trên trình duyệt từ `birth.when`, `lat`, `lon`. Chạm hoặc rê một chòm sao để nghe tên.
4. Ảnh polaroid. Lật ít nhất một tấm.
5. Câu đố. Trả lời hết.
6. Đồng hồ "đã bên nhau". Ở lại một lát.
7. Bánh. Tắt hết nến (mic hoặc chạm).
8. Phong thư sáp. Chạm con dấu để đọc.
9. Trò nhớ. Tìm hết các cặp ảnh.
10. Thẻ cào. Cào hết các thẻ.
11. Hộp "Mở khi…". Mở từng lá một lần. Mỗi lá là một phong bì; chạm thì thư mở trong một tờ, gấp lại được.
12. Ước mơ. Tích ít nhất một điều.
13. Câu hỏi cuối. Nút **Không** chạy trốn. Bấm **Có** thì mới đi tiếp.
14. Ước. Gửi ít nhất một câu. Câu đó bay thành sao, và còn đó khi quay lại.
15. Lá thư cuối, hiện từng dòng. Nhạc nhỏ dần. Đọc lại được. Không có bước sau.

Lời bạn bè không có số trên đường này. Dữ liệu `friendNotes` và màn hình vẫn trong repo.

## Kiểm tra chồng lấn

`npm run overlap` dựng trang rồi chạy Playwright (Chrome có sẵn trên máy) qua từng bước, hai ngôn ngữ, và các khung 320×568, 375×667, 390×844, 430×932, cùng ngang 844×390. Có vùng an toàn kiểu iPhone. Lệnh báo lỗi nếu chữ hoặc nút cắt nhau với thanh trên / thanh dưới, chữ bị cắt, hoặc tràn ngang.

## Góc còn thô

- Chòm sao ở bước bầu trời là một trái tim có tên em ở giữa, không phải các sao xếp thành nét chữ. Bản đồ đêm sinh là danh mục sao sáng J2000 cộng giờ sao địa phương, bỏ qua tuế sai, nên là gần đúng chứ không phải phần mềm thiên văn.
- Đường đi không có menu chương. Muốn nhảy bước khi thử, thêm `?dev=1`.
- Câu đồng hồ có thêm **phút** (`{minutes}`) để giây chỉ chạy 0–59. Muốn đúng từng chữ "X ngày Y giờ Z giây" thì sửa `together.past`.
- Thổi nến phụ thuộc mic và ngưỡng âm lượng. Máy yếu hoặc từ chối quyền thì chạm nến.
- Nhạc giả nghe như một vòng nốt đơn, không phải bài hát.
- Mật khẩu nằm trong file JSON nên không giấu được với người biết xem source.
- Font lấy từ Google Fonts. Mất mạng thì trang vẫn chạy, chỉ đổi sang font hệ thống.

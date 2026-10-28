# Audit chuyện và UX

Góc nhìn: MJ mở lần đầu, tiếng Việt hoặc English (mặc định English, `i18n.ts` `readLocale`). Tách **FACT** (đọc từ code/data) và **RECOMMENDATION** (đề xuất, chưa làm).

Giờ sinh `2002-11-18 16:45 UTC+7` là fact đã xác nhận và đã nằm đúng ở `content.birth.when`. Không phải lỗ hổng data.

## FACT theo cảnh

### `lock`

- Mục đích: giữ trang im đến nửa đêm 18/11/2026 giờ Việt Nam.
- Cảm xúc dự kiến: chờ. Tải nhận thức thấp. Một tiêu đề, một dòng phụ, bốn số.
- Không có việc bắt buộc ngoài chờ. Không dựng cảnh sau.
- Rủi ro: nếu MJ mở trước ngày, cô không thấy gì của câu chuyện. Đúng chủ đích.

### `gate`

- Mục đích: cửa tên riêng. Cảm xúc: được gọi đúng.
- Một câu hỏi, một field, gợi ý nếu sai. Nhẹ.
- Đúng thì tự sang `sky`. Không Next.
- Dựng tiếp: lời `found` / `welcome` rồi bầu trời tên.

### `sky`

- Mục đích: 7 sao thành vòng, hiện `constellationName`.
- FACT: MJ không phải làm gì. Next có ngay (`flow.ts` dòng 99–102) trong lúc sao còn đang sáng (timer `Universe.tsx` dòng 28–34). Có thể bỏ qua toàn bộ beat.
- Cảm xúc đẹp nhưng dễ bị cắt. Không dẫn vào chương tương ứng với từng sao.

### `birth`

- Mục đích: bầu trời đúng buổi chiều sinh. Giờ 16:45 là data thật, `formatZoned` in ra giờ đó (`selfcheck.mjs` dòng 74–75).
- Việc: mở 4 chòm (`cas`, `lyr`, `cyg`, `aql`). Các chòm khác chỉ là hình, `HERO` `sco` không nằm trong 4 note.
- Lượng chữ: lede + 4 note. Vừa. Không biết trước là phải chạm đủ 4 thì Next ẩn. Hint footer `flow.hints.birth` là chỗ nói điều đó. Nếu hint mơ hồ, dễ tưởng cảnh hỏng.
- Dựng tiếp yếu: xong bầu trời 2002 thì nhảy thẳng vào ảnh từ 01/07/2026. Không có cầu “từ hôm sinh đến ngày gặp”.

### `gallery`

- Mục đích: các thời của hai người. 5 era, 39 ảnh, compliment có, caption trống hết.
- Việc bắt buộc: xem **một** era đến ảnh cuối. 38 ảnh còn lại optional.
- Tải: galaxy rồi flick rồi flip. Cao hơn các cảnh chữ. Dễ mệt nếu cô cố xem hết vì không có checklist “đã xem 5/5” gắn với Next.
- Mọi `era.date` cùng `2026-07-01`. Không kể đời trước quan hệ, không kể 18/11/2022.
- Lặp: flick giống nhau mỗi era.

### `quiz`

- 5 câu, phản hồi ngay, sai vẫn đi tiếp. Tải vừa. Cảm xúc chơi, không phải kiểm tra gắt vì không fail cả màn.
- Nằm **sau** gallery, **trước** đồng hồ. Không ngồi cạnh “sáu điều anh thích” như dàn ý đề xuất.

### `counter`

- Đếm từ `2026-07-01T00:00:00+07:00`. Trước mốc đó copy `together.future`; sau mốc `together.past`.
- Next không cần ở lại. `counterSeen` sau 2 giây không khóa nút. Beat có thể thoáng qua.
- Đặt **trước** bánh, không phải gần cuối như “milestone” trong dàn ý 15 cảnh đề xuất.

### `cake` rồi `envelope`

- Nến là việc tay/hơi thở. Thư typewriter trên bánh là một lá thư nữa, **trước** thư cuối.
- Rồi phong bì seal: thêm một lá. Hai lá thư sát nhau, rồi còn scratch, letters, dreams, finale, wish, và `finalLetter`. Mật độ thư cao ở nửa sau.

### `memory` và `scratch`

- Hai mini-game liên tiếp sau envelope. Pairs 12 lá. Scratch 6 thẻ, mỗi thẻ phải cào ~46% diện tích. Đây là đoạn tốn công nhất sau gallery.
- Cảm xúc: chơi. Không thấy cầu chuyện sang “điều anh thích” hay “bạn bè”.

### `letters`

- Bốn lá `sad` / `miss` / `angry` / `awake`. Phải mở cả bốn để đi tiếp. Không giới hạn một lá mỗi ngày trong code.
- Chữ nhiều. Modal đọc dễ, nhưng bốn lần mở liên tiếp là lặp thao tác.

### `dreams`

- Tick một ô là đủ. Nhẹ, đứng ngay trước câu hỏi Có. Cảm xúc tương lai, rồi bị câu Có/Không chiếm.

### `finale`

- Câu chơi: Không chạy. FACT áp lực: không tồn tại kết cục “Không”. Với một món quà thì hợp; với người không thích bị dí nút thì khó chịu. Tease đổi mỗi lần nhảy (`finale.teases`, 5 dòng).
- Có thì pháo hoa ngay. Cảm xúc nhảy cóc lên đỉnh **trước** wish và thư cuối. Đỉnh hình (fireworks) không trùng đỉnh chữ (letter).

### `wish`

- Một câu của MJ. Bay thành sao. Là chỗ cô được nói, hiếm trên path (gate và wish là hai ô nhập chính; dreams chỉ là tick).
- Nằm sau Có, trước thư. Hợp để thở, nhưng dễ cảm giác “phụ” nếu thư bánh và thư cuối đã nói hết điều anh muốn nói.

### `letter`

- Thư dài, hiện dần, skip được, nhạc hạ 8 giây, ngày in bằng `birth.when` (`FinalLetter.tsx` dòng 30) tức ngày sinh, không phải ngày viết.
- Không có cảnh sao kết sau thư. `constellationName` đã hiện ở `sky` từ đầu.
- Hết path. Replay hoặc reset.

### `friends` (không trên path)

- Component `Friends.tsx`, 8 `friendNotes`, tone `gold|blush|sage|sky|cream`. `INCLUDE_FRIENDS = false`. MJ bản đang ship không thấy màn này trừ `?dev=1` nếu nhảy được… Dev jump chỉ map `FLOW` hiện tại (`App.tsx` dòng 422), **không** có nút `friends`. Muốn xem phải bật flag và đổi `FLOW_VERSION`. **Partial.**

## FACT về nhịp cả đường

- 15 bước `FLOW` + lock. Nhiều hơn một buổi đọc ngắn nếu cô xem hết ảnh và cào hết thẻ.
- Đỉnh cảm xúc hình ảnh (`finale`) sớm hơn đỉnh chữ (`letter`). Ở giữa còn wish.
- Không có cảnh “đời trước yêu”, “ngày gặp 2022-11-18”, “sáu điều anh thích” như một scene riêng, “lời mời hẹn hò”.
- Thư bị chia: `cake.letter`, `envelope.body`, 4 `openWhen`, `finalLetter.body`. Dễ trùng giọng.
- 7 sao là hình, không phải bản đồ. Tên sao (`memory`, `friends`…) không khớp thứ tự đi.
- `friends` trong `STAR_LAYOUT` trong khi màn friends tắt. Sao “bạn bè” không dẫn tới đâu.

## RECOMMENDATION (chưa làm)

- Giữ 16:45. Không sửa `birth.when`.
- Thêm fact `2022-11-18` vào content trước khi viết cảnh “ngày gặp”, nếu không cảnh đó không có neo.
- Kéo Next của `sky` theo `skyDone`, và của `counter` theo `counterSeen`, nếu muốn beat không bị skip. Đó là FLOW CHANGE nhỏ.
- Đừng thêm cảnh thứ 16 nếu chưa gộp game. Xem mục dưới.

## So với dàn ý 15 cảnh đề xuất

Dàn ý đề xuất không khớp `FLOW`. Cột dưới là gap so với **đề xuất**, không phải bug của path hiện tại.

| # | Ý | Đang có | Thiếu | Việc cần | Complexity |
| --- | --- | --- | --- | --- | --- |
| 1 | Secret entrance | `Gate` + `gate.*`. Password ở `gate.password` | Không | Chỉ nếu đổi lời | Low |
| 2 | Birth sky | `BirthSky`, `birth.when` 16:45 đã đúng, 18 chòm, 4 note | Cầu sang đời sau. Không thiếu giờ sinh | Chữ dẫn. Không đổi `when` | Low |
| 3 | Life before the relationship | Không có scene. `era.date` đều `2026-07-01` | Cảnh và mốc trước 2026-07-01 | Era mới. Rule `era.date < startDate` đang bị cấm (`content.ts` dòng 91–92) | High |
| 4 | Moment stories met | Không chuỗi `2022` | Ngày 2022-11-18 và cảnh | Content, có thể một era | Medium |
| 5 | Memories together | `gallery`, 5 era, 39 ảnh, caption trống | Timeline và caption | CONTENT-ONLY nếu chỉ điền caption | Medium |
| 6 | Six things he loves | `scratches` có 6 thẻ, không scene riêng mang tên đó | Khung chuyện | Sửa `cover`/`reveal` nếu lời chưa đúng ý | Low |
| 7 | Quiz | `Quiz`, 5 câu | Không thiếu máy. Vị trí khác dàn ý | Đổi `FLOW` đụng `migrateIndex` | Medium |
| 8 | Memory matching | `Memory`, 6 cặp | 2 era không vào bộ bài | Bỏ `slice(0, 6)` nếu muốn đủ era | Medium |
| 9 | Friends' messages | `Friends`, 8 note, flag tắt | Trên path | `INCLUDE_FRIENDS` và migrate save | Medium |
| 10 | Milestone / counter | `Counter` từ 2026-07-01 | Đang giữa path, Next không giữ | Đổi chỗ hoặc `stepDone` theo `counterSeen` | Low–Medium |
| 11 | Future dreams | `Dreams`, 7 mục, tick 1 là đủ | Không | Siết điều kiện nếu muốn chọn kỹ | Low |
| 12 | Birthday wish | `WishSky` | Đứng sau Có, không trước bánh | Đổi thứ tự `FLOW` | Medium |
| 13 | Cake and open-when | `Cake` và `Letters` là hai step, cách nhau envelope, memory, scratch | Gộp một cảnh | Gộp UI là việc lớn. Hai step là đúng code | High nếu gộp |
| 14 | Date invitation + question | `Finale` Có/Không. Không có cảnh mời đi chơi | Lời mời hẹn | `finale.lead` hoặc step mới | Low hoặc High |
| 15 | Final letter + constellation ending | `FinalLetter` có. Sao kết không có. Tên sao đã ở `sky` | Ending constellation | Tái dùng sky sau thư | Medium |

15 cảnh đề xuất **không** nên cộng thêm lên 15+15. Path code đã là 15. Đề xuất trùng một phần và thêm 3–4 ý chưa có (đời trước, ngày gặp, lời mời hẹn, sao kết).

**RECOMMENDATION nhóm lại, còn khoảng 10 nhịp:**

1. Khóa + cửa tên.
2. Sao mở (bắt Next đợi vẽ xong) + birth sky.
3. Một gallery có chương “trước / ngày gặp / bên nhau” thay vì 5 era cùng một ngày, nhưng chỉ sau khi nới rule `era.date`.
4. Sáu thẻ cào **hoặc** quiz, không cả hai cộng pairs liên tiếp. Giữ một game.
5. Đồng hồ + ước mơ (cùng một nhịp “từ giờ tới sau”).
6. Bạn bè, ngắn, nếu bật lại.
7. Bánh.
8. Một nhóm thư (envelope + open-when) thay vì hai chương xa nhau.
9. Câu Có/Không, có thể kèm một câu mời đi chơi trong `finale.lead`.
10. Ước của MJ rồi thư cuối, và nếu cần sao kết thì để **sau** thư, không lặp `sky` ở đầu.

Pairs để optional trong gallery hoặc bỏ khỏi đường bắt buộc. Đó là đoạn dễ mệt nhất mà không thêm fact mới.

## Vấn đề ưu tiên

### P0

**P0-1. Thiếu ngày gặp 2022-11-18.**

- Mô tả: fact Parker đưa không xuất hiện ở JSON, TS, hay markdown trong repo. Không có ngày khác ghi “lần đầu gặp” để gọi là mâu thuẫn. Thư và đồng hồ chỉ neo `2026-07-01`.
- Bằng chứng: `grep` `2022` toàn workspace, 0 kết quả. `startDate` dòng 72 `content.json`. `era.date` tất cả `2026-07-01`. Validator cấm era trước `startDate` (`content.ts` dòng 91–92).
- Với MJ: câu chuyện trên máy bắt đầu tháng 7/2026. Buổi gặp 2022 không tồn tại trên trang.
- Hướng: thêm field hoặc một đoạn copy có ngày đó. Nếu cần ảnh trước 01/07/2026 thì sửa rule era. Category: Content, có thể Technical nếu đụng validator. Complexity: Low cho một câu; Medium nếu thêm cảnh.

**P0-2. Không có P0 “giờ sinh sai”.**

- `birth.when` khớp fact đã xác nhận. Ghi ở đây để người đọc audit không mở lại việc sửa 16:45.

Không thấy flow gãy kiểu không tới được thư cuối: mỗi `stepDone` có đường hoàn thành bằng thao tác thật, trừ `sky` và `counter` vốn cho qua không cần thao tác.

### P1

**P1-1. Đỉnh pháo hoa trước thư cuối.**

- `Finale` bắn `Fireworks` khi Có (`Finale.tsx` dòng 63–64). Thư cuối chỉ fade nhạc và hiện chữ (`FinalLetter.tsx` dòng 32–34, 125).
- MJ nhận “khoảnh khắc lớn” rồi còn hai cảnh nữa.
- RECOMMENDATION: giữ pháo hoa nhỏ ở Có, dồn sao/nhạc/chữ vào `letter`. Category: UI. Complexity: Medium.

**P1-2. Nút Không không phải lựa chọn, và khó với bàn phím.**

- `preventDefault` trên pointer down và Enter/Space (`Finale.tsx` dòng 84–95).
- Người dùng trợ năng hoặc người không thích bị trêu có thể thấy bị ép.
- RECOMMENDATION: giữ tease trên pointer, nhưng sau vài lần thì cho Không đứng yên và hiện một câu dịu, không ghi `saidYes`. Category: UI/Flow. Complexity: Medium.

**P1-3. Hai game nặng kề nhau, gallery chỉ cần một era.**

- Memory rồi Scratch là điều kiện bắt buộc. Gallery xong sau một era (`flow.ts` dòng 105–106, `Gallery.tsx` dòng 649–656).
- MJ có thể lướt một thời rồi cày 12 lá + 6 thẻ, trong khi 4 thời ảnh không ảnh hưởng Next.
- RECOMMENDATION: một game trên path, hoặc gallery cần đủ era nếu ảnh là xương sống. Category: Flow. Complexity: Medium.

**P1-4. Bạn bè và 7 sao không nối nhau.**

- Sao `friends` có trên trời (`pure.ts` dòng 95). Màn `Friends` không có trên `FLOW`.
- RECOMMENDATION: hoặc bỏ id đó khỏi vòng sao, hoặc bật một đoạn lời bạn ngắn. Category: Flow/Content. Complexity: Low–Medium.

**P1-5. Không có lời mời hẹn và không có đời trước 2026-07-01.**

- Xem bảng đề xuất hàng 3, 4, 14.
- Category: Content. Complexity: Medium nếu chỉ thêm chữ vào cảnh có sẵn; High nếu scene mới cộng nới `era.date`.

**P1-6. `sky` / `counter` không giữ Next.**

- Mâu thuẫn với quy tắc “Next ẩn đến khi xong” mà các cảnh khác tuân.
- Category: Flow. Complexity: Low (`stepDone` trả `progress.skyDone` / `progress.counterSeen`, và bảo đảm hai cờ được set).

### P2

**P2-1. Caption trống 39/39.** Ảnh không có dòng chú thích. Compliment vẫn có. Content. Low.

**P2-2. Ngày trên thư cuối là ngày sinh** (`formatDotted(content.birth.when)`). Có thể đúng (thư sinh nhật) hoặc lệch nếu muốn ngày anh viết. Content. Low.

**P2-3. Open-when không niêm theo ngày** dù `openWhen[id]` lưu ngày. UI `seen` là boolean. Content/UI. Low.

**P2-4. Key chết:** `ui.doorCake`, `ui.doorLetters`, `ui.doorFinale`, `ui.lit`, `ui.back`, `lettersCopy.sealed`, `lettersCopy.next`, `chapters[].star`, `openedChapters`. Dễ khiến người sửa JSON tưởng chúng còn trên UI. Technical/Content. Low.

**P2-5. Pairs bỏ 4 ảnh pair** vì `slice(0, 6)`. Hai era không xuất hiện trong game. UI. Low.

**P2-6. Playlist là bản thu có chủ** (Laufey, beabadoobee, …). Code không ghi giấy phép. Asset/legal, ngoài phạm vi xác minh của lần đọc này.

**P2-7. Chữ `←` và `×` hardcode** trong khi phần còn lại đi qua `t()`. UI. Low.

**P2-8. Mật độ thư.** Bánh, phong bì, bốn open-when, thư cuối. RECOMMENDATION: rút một lớp hoặc cho open-when là optional. Content/Flow. Medium.

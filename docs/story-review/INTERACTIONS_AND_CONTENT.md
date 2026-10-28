# Tương tác, content, hình và tiếng

## Từng tính năng

### Gate

- File: `site/src/components/Gate.tsx`, so khớp `nicknamesMatch` trong `site/src/lib/pure.ts` dòng 1–7.
- State cục bộ: `value`, `hintIndex`, `shaking`, `empty`, `passed`.
- Rỗng: `gate.empty`, shake. Sai: tăng hint, xoay `gate.hints` (6 phần tử), không lộ password. Đúng: blur input, `passed`, sau 2100ms (800ms nếu reduced) gọi `onUnlock`.
- `unlock()` (`App.tsx` dòng 252–265): `startMusic(progress.muted)`, rồi set `gateUnlocked`, `step` và `unlocked` ít nhất 1.
- Replay: reset journey xóa progress. Không có nút “thử lại” riêng trên gate sau khi đúng.
- Mobile: input là field text. `bindViewport` (`site/src/lib/viewport.ts`) kéo stage để heading và field ở trên bàn phím điện thoại. Desktop rộng (`width >= 1200 && height <= 1100 && ratio >= 1.5`, `viewport.ts` dòng 28–32) không dùng heuristic đó.
- Fallback: không có mạng vẫn so khớp local. Password là string trong `gate.password`, không phải bí mật server.
- Status: **Implemented**.

### Bầu trời 7 sao (`sky`)

- `Universe.tsx` + `STAR_LAYOUT` (7 điểm, `pure.ts` dòng 93–101).
- Tự chạy. `onDone` sau chuỗi timer (`Universe.tsx` dòng 34) ghi `skyDone`.
- `stepDone("sky")` trả `true` ngay (`flow.ts` dòng 99–102). Next không đợi sao vẽ xong.
- Không tap sao, không mở chương. `chapters[].star` không được render.
- Status: **Partial** so với “hệ 7 sao điều hướng”. **Implemented** như phim mở đầu.

### Birth sky

- `BirthSky.tsx`, catalog `CATALOG` / `CONSTELLATIONS` trong `site/src/lib/stars.ts` (18 id, dòng 88–216).
- `projectSky(lat, lon, when)` dùng `birth.when`, `birth.lat`, `birth.lon`. `when` đã xác nhận là `2002-11-18T16:45:00+07:00`.
- `HERO_ID = "sco"` hardcode (`BirthSky.tsx` dòng 12), không lấy từ content. Bốn note bắt buộc: `birth.notes` đúng 4, id phải thuộc catalog và phải visible (`content.ts` dòng 152–169 và 195–199). Data hiện tại: `cas`, `lyr`, `cyg`, `aql`.
- Chạm đủ note visible thì `birthSeen`. Mở lại cảnh: `birthSeen` đã true nên Next hiện, note đã mở không bắt buộc mở lại trong session mới của component (state `opened` là local, mất khi rời cảnh; cờ hoàn thành thì persist).
- Precession không có trong comment catalog (`stars.ts` dòng 16: “Precession is ignored”). Chart là minh họa, không phải phần mềm thiên văn.
- Status: **Implemented**.

### Gallery / timeline

- `site/src/chapters/Gallery.tsx`, `site/src/components/SpiralGalaxy.tsx`, `site/src/lib/galaxy.ts`, `site/src/lib/galaxy-gl.ts`.
- WebGL disc + point stars. Reduced motion: spin = 0.
- Flick: pointer, fling ~560ms (`Gallery.tsx` dòng 192). Flip ghi `flippedPhotos`. `Fullscreen` (dòng 438) có pinch (dòng 463).
- Hoàn thành bước: xem **một** era tới index ảnh cuối, push `erasViewed`. Bốn era còn lại là optional.
- Caption 39/39 trống nên dòng ngày/caption dưới ảnh thường không hiện (`Gallery.tsx` dòng 403: chỉ render khi `date` hoặc `caption`). Compliment mặt sau vẫn có.
- Mọi `era.date` = `2026-07-01`, trùng `startDate`. Không có trục “trước khi yêu” hay “ngày gặp 2022-11-18”.
- Status: **Implemented** như galaxy + stack. **Planned-not-implemented** nếu kỳ vọng timeline nhiều mốc.

### Scratch

- `site/src/chapters/Scratch.tsx`. 6 thẻ `content.scratches`.
- Pointer: nếu kéo dọc nhiều hơn ngang thì để scroll, không cào (nhánh `mode` quanh dòng 238–276).
- Xong một thẻ: lưới 48×28, tỷ lệ pixel alpha < 40 lớn hơn 0.46 (dòng 205–222). Reduced motion vẫn có canvas; không có nút “mở hết” riêng trong đoạn đã đọc.
- Replay: thẻ đã `scratched` render `is-open`, không cào lại.
- Status: **Implemented**.

### Quiz

- `site/src/chapters/Quiz.tsx`. 5 câu. `answer` là index từ 0. `validateContent` từ chối index ngoài mảng (`content.ts` dòng 77–86).
- Chọn một lần. Đúng: class `is-right` + `rightNote` + `Spark`. Sai: `is-wrong` + `wrongNote`. Cả hai đều ghi `progress.quiz[id]`.
- Hết câu: summary `quizSummary` với `{ok}` `{total}`, nút `ui.seeAgain`.
- Sticky Next của flow chỉ hiện khi không còn `question` (hết local step) và `stepDone` true. Trong lúc còn câu, sticky là `ui.nextQuestion`.
- Status: **Implemented**.

### Pairs

- `Memory.tsx`. Deck: `photos.filter(pair).slice(0, 6)` rồi nhân đôi. `content.ts` `flattenPhotos` gắn `pair` cho 2 ảnh đầu mỗi era. 5 era × 2 = 10 ảnh pair, game chỉ lấy 6 → 12 lá. Hai era cuối không vào game.
- Khớp: giữ mặt, `cheer`. Trật: úp sau 700ms (dòng 70–73). Thắng: `memoryBest` = số lượt nhỏ nhất.
- `again()` xáo lại, không xóa `memoryBest` nên Next vẫn ở đó sau lần thắng đầu.
- Status: **Implemented**.

### Wish

- `WishSky.tsx`. Submit trim, cắt 180 ký tự. Rỗng thì shake và `wish.empty`.
- `sendWish` (`App.tsx` dòng 109–118) push `{ id, text, at }`, giữ 24 phần tử cuối. `id` là `crypto.randomUUID` hoặc `wish-${Date.now()}`.
- Canvas bay lên trời. `playChime()` chỉ khi playlist đang thực sự phát (`music.ts` dòng 317–320).
- Hoàn thành: một wish không rỗng. Gửi thêm được.
- Status: **Implemented**.

### Nến: mic và tap

- `Cake.tsx`. Số nến `Math.max(1, Math.min(8, content.cake.candles || 5))` (dòng 31). Data: 5.
- Mic: `getUserMedia`, `AnalyserNode` fftSize 1024, RMS > 0.11 thì tắt một nến, arm lại khi RMS < 0.045 (dòng 107–111). Catch: `micFailed`, copy `cake.micError` (dòng 119–123).
- Tap: `extinguish` (dòng 46) hoạt động kể cả khi mic sống. Hint `cake.tapHint` khi không listen và không lỗi.
- `playBirthday` gắn với **vào** cảnh, không gắn với nến tắt (`App.tsx` dòng 217–224).
- Status: **Implemented**.

### Open-when

- `Letters.tsx`. 4 thư. `todayKey()` là ngày local của máy (`pure.ts` dòng 35–39), không phải timezone Việt Nam.
- Lần mở ghi `openWhen[id] = today`. Nếu đã là hôm nay thì không ghi đè (dòng 31–36). Ngày khác thì ghi ngày mới, nhưng UI `seen` chỉ cần truthy (dòng 46).
- Không có cổng “ngày mai mới mở lại”. Copy `lettersCopy.sealed` và `lettersCopy.next` không được `tsx` tham chiếu (grep không có caller). **Partial** so với mô tả “niêm lại hôm sau” nếu copy còn nói vậy. Hành vi code: mở một lần là xong điều kiện Next.
- Status: **Implemented** như bốn thư mở được. **Partial** nếu sản phẩm cần khóa theo ngày.

### Câu hỏi cuối

- `Finale.tsx`. Có: `onYes` → `saidYes` persist, pháo hoa, tim, `yesTitle` / `yesBody` / `celebrate`.
- Không: `onPointerDown` `preventDefault` + `jump` (dòng 84–88). Keyboard Enter/Space cũng `jump`. Không có đường ghi “đã bấm Không”.
- Status: **Implemented** đúng kiểu trêu. Đây là áp lực thiết kế: MJ không có lựa chọn Không thật.

### Chuyển cảnh

- `AnimatePresence mode="wait"` (`App.tsx` dòng 448). Enter: opacity, y 48, scale 1.12, rotateX 10, blur 16, 0.78s. Exit ngược nhẹ hơn. Reduced: chỉ opacity, duration 0.
- Lock exit 0.7s.
- Footer hint: `flow.hints[stepId]` khi chưa xong, `flow.done` khi xong, `flow.doneLast` trên `letter` (`App.tsx` dòng 277–281).

### Nhạc: toast và ring

- Lần đầu `muted: true` nên qua gate không gọi `play()` (`startMusic` trả sớm).
- Bấm nút: `onPress` = `hideMusicNote` trước, rồi `startMusic`. Reject thì `onBlocked` → `showMusicNote(true)` (`MusicButton.tsx` dòng 76–85, `App.tsx` dòng 403–409).
- Toast: 3000ms rồi fade 340ms (0 nếu reduced). Ẩn ngay khi bấm nút hoặc `musicIsPlaying()` (`App.tsx` khoảng dòng 143–172).
- `blockedOnce`: lần fail không phải từ user chỉ hiện một lần. Tap sau đó fail thì hiện lại (`fromUser === true`).
- Sau toast, `blockedCue` tắt `.music-hint`. Class `is-first` (ring) còn khi `invite = !playing && !heard` (`MusicButton.tsx` dòng 68–89). Nghe được thì `lilj.musicHeard.v1` và ring mất, kể cả pause sau đó.
- Status: **Implemented**.

### Replay / reset

- Header nút reset mở dialog (`ui.reset`, `resetConfirm`, `resetYes`, `resetNo`). `restartJourney` dùng `restartedProgress` (`App.tsx` dòng 235–238), giữ `muted` hiện tại.
- `×` trên `?dev=1` gọi `clearProgress()` + reload (dòng 436–438), khác dialog: xóa hẳn key.
- Locale không nằm trong progress nên reset không đổi VI/EN.

## Content architecture

Load: `import rawJson from "../content.json"` (`content.ts` dòng 1). Không fetch lúc runtime.

Chọn VI/EN: `text()` (`i18n.ts` dòng 39–45). Nếu phía đang chọn trống thì fallback `vi`. Build vẫn bắt cả hai phía không trống với các field `validateContent` kiểm.

Binding: component gọi `t(content.<key>)` hoặc `t(chapter.kicker)` sau `chapters.find`.

Placeholder `fillTemplate` (`pure.ts` dòng 9–14), để trống nếu thiếu key:

| Pattern | Dùng ở |
| --- | --- |
| `{n}` `{total}` | `flow.progress`, `birth.progress` (validator bắt cả `{n}` và `{total}`, `content.ts` dòng 166–168) |
| `{n}` `{total}` `{photo}` `{photos}` | `galleryCopy.eraProgress` |
| `{ok}` `{total}` | `quizSummary` |
| `{days}` `{hours}` `{minutes}` `{seconds}` | `together.past` / `future` (template trong JSON; `Counter` truyền `elapsedParts`) |
| `{when}` `{place}` | `birth.caption` (`BirthSky.tsx` dòng 77) |
| `{d}` `{m}` `{y}` | `ui.dottedDate`. Thư cuối gắn vào `birth.when`, nên ngày in trên thư là ngày sinh, không phải ngày mở thư (`FinalLetter.tsx` dòng 30) |

Field điều khiển logic (sửa chữ thì an toàn, sửa giá trị thì đổi hành vi):

- `gate.password`, `lock.unlockAt`, `startDate`, `birth.when` / `lat` / `lon`
- `quiz[].answer` (index)
- `cake.candles`
- `music.tracks[].src`, `music.birthday.src` phải bắt đầu `/music/` và không trùng (`content.ts` dòng 102–116)
- `eras[].photos[].src` phải `lilj/`
- `birth.notes[].id` phải là id chòm sao visible
- `INCLUDE_FRIENDS` không nằm trong JSON. Nằm `flow.ts` dòng 1

Key có trong type/JSON nhưng **không** có caller trong `site/src/**/*.tsx` (grep):

- `ui.doorCake`, `ui.doorLetters`, `ui.doorFinale`, `ui.back`, `ui.lit`
- `lettersCopy.sealed`, `lettersCopy.next`
- `chapters[].star` (data có đủ 7 chương, UI không đọc)
- `progress.openedChapters` không được ghi

`galleryCopy.orbit` **có** dùng (`Gallery.tsx` dòng 703).

`ui.lit` không dùng. Sao sky dùng `ui.waiting` / `ui.formed`.

Validator không duyệt mọi key lồng nhau. `collectCopyProblems` trong `i18n.ts` được import bởi `content.ts` dòng 3; cần nhìn `validateContent` có gọi nó ở cuối hàm hay không. Đoạn đọc tới dòng 229 kiểm hint từng `FLOW` id. Nếu một key copy mới thêm mà validator không liệt kê, build có thể vẫn qua. **Partial** coverage.

### Chữ hardcode mà MJ có thể thấy

- `←` (`App.tsx` dòng 385). `aria-label` thì lấy `flow.back`.
- `×` trên dev jump (`App.tsx` dòng 441). `aria-label` là `ui.reset`.
- Fallback chữ cái quiz `String.fromCharCode(65 + index)` nếu `quizMarks` ngắn (`Quiz.tsx` dòng 72). Data có `quizMarks`.
- `HERO_ID` `"sco"` hiện tên qua `constellations.sco`, không hiện raw id trừ khi thiếu bản dịch (`BirthSky.tsx` dòng 88).
- Chuỗi lỗi `validateContent` là tiếng Việt cho người sửa content, chỉ hiện nếu JSON hỏng (`App.tsx` dòng 246).

### Bảng map

| Scene/Feature | Content key | Used by | Purpose | Safe to edit text? | Technical constraints |
| --- | --- | --- | --- | --- | --- |
| Lock | `lock.title`, `subtitle`, `days`, `hours`, `minutes`, `seconds` | `LockScreen` | Countdown | CONTENT-ONLY | `unlockAt` là DATA. Phải ISO `+07:00` (`lock.ts` `lockProblem`) |
| Gate | `gate.question`, `hints`, `found`, `welcome` | `Gate` | Lời và gợi ý | CONTENT-ONLY | `password` là DATA. Đổi giá trị là FLOW CHANGE với người đã biết câu cũ |
| Sky | `meta.title`, `constellationName`, `ui.waiting`, `ui.formed` | `Universe` | Tên và trạng thái sao | `constellationName` CONTENT-ONLY (một string, không `{vi,en}`) | Không đổi số sao bằng JSON |
| Birth | `birth.lede`, `notes[]`, `constellations` | `BirthSky` | Chart và 4 lời | CONTENT-ONLY cho `title`/`body` | Đổi `notes[].id`, `when`, `lat`, `lon` là DATA/FLOW. `when` đã xác nhận 16:45 |
| Gallery | `eras[]`, `galleryCopy` | `Gallery` | Ảnh và nhãn | Caption/compliment CONTENT-ONLY | `src` DATA/ASSET. `era.date` < `startDate` thì build fail (`content.ts` dòng 91–92) |
| Quiz | `quiz[]` | `Quiz` | Câu và phản hồi | CONTENT-ONLY cho câu chữ | `answer` index là DATA |
| Counter | `together.*`, `startDate` | `Counter` | Đồng hồ | Template CONTENT-ONLY nếu giữ placeholder | `startDate` DATA. Đang là `2026-07-01T00:00:00+07:00` |
| Cake | `cake.letter`, `mic*` | `Cake` | Nến và thư | CONTENT-ONLY | `candles` 1–8 là DATA. Nhạc bánh là `music.birthday` ASSET |
| Envelope | `envelope.*` | `Envelope` | Một lá thư | CONTENT-ONLY | — |
| Memory | `memoryCopy` | `Memory` | Lời khi ghép | CONTENT-ONLY. `lines` phải đúng 5 (`content.ts` dòng 172–174) | Ảnh pair là DATA |
| Scratch | `scratches[]` | `Scratch` | Mặt foil và lời | CONTENT-ONLY | Xóa id đã nằm trong save cũ không phá crash, nhưng điều kiện Next đổi FLOW |
| Letters | `openWhen[]` | `Letters` | Bốn lá | CONTENT-ONLY | Thêm phần tử là FLOW (phải mở thêm để Next) |
| Dreams | `dreams[]` | `Dreams` | Checklist | CONTENT-ONLY | Cần ≥ 1 |
| Friends | `friendNotes`, `friendsCopy` | `Friends` | Lời bạn | CONTENT-ONLY | Không trên path cho đến khi `INCLUDE_FRIENDS` true: FLOW CHANGE trong code |
| Finale | `finale.*` | `Finale` | Câu Có/Không | CONTENT-ONLY | Không có data “đã từ chối” |
| Wish | `wish.*` | `WishSky` | Ước | CONTENT-ONLY | Cắt 180 ký tự trong code, không phải trong JSON |
| Letter | `finalLetter.*` | `FinalLetter` | Thư cuối | CONTENT-ONLY. `\n` là ngắt dòng | `signature` một cặp `{vi,en}` |
| Music UI | `ui.musicOn`, `musicOff`, `musicHint`, `musicBlocked` | `MusicButton`, `App` | Nút và toast | CONTENT-ONLY | File mp3 là ASSET |
| Chrome | `flow.next`, `flow.back`, `flow.hints` | `App` | Footer | CONTENT-ONLY | Thiếu hint của một `FLOW` id thì build fail |

## Hình, tiếng, máy, a11y

**Màu:** bảng ở `styles.css` dòng 1–18. Nền tím, chữ kem, nhấn hồng và lavender. Nút vàng thật chất là `--pearl` (`--gold: var(--pearl)`, dòng 8–9).

**Chữ:** system sans, scale compact, không italic trong CSS. Great Vibes cho chữ ký (`letter-sign` dùng `--font-script`). Reveal từng từ. Parker preference “system font, few italics, rounded corners, compact type, word-by-word, Next ẩn đến khi xong, crisp text”: phần lớn **Implemented**. Ngoại lệ Next trên `sky` và `counter` (luôn hiện) là **Partial**.

**Galaxy:** WebGL1 trong `galaxy-gl.ts`. Không có video hay model 3D. Ảnh là bitmap Cloudinary.

**Layout:** một cột, `html, body { position: fixed; overflow: hidden }` (`styles.css` dòng 69–76). Stage cuộn bên trong. Tune iPhone 14 Pro Max nằm ở overlap (`site/scripts/overlap-check.mjs`: viewport `430x932` và `430x739`) và safe area phone rộng (`width >= 428` → top 59px, bottom 34px trong script đó). CSS dùng `env(safe-area-inset-*)` (`styles.css` dòng 29–32), không hardcode 59/34 trong stylesheet.

**Nhạc theo cảnh:** một playlist ngẫu nhiên cho cả visit. Ngoại lệ: `cake` crossfade sang birthday loop; `letter` fade 8s. Không track riêng cho birth sky hay finale.

**SFX:** chỉ `playChime` trên wish, và chỉ khi nhạc đang phát. Không file wav hiệu ứng.

**Climax có thể tựa vào thứ đã có:** pháo hoa + tim ở `finale`, sao bay + chime ở `wish`, fade nhạc + từng chữ + cánh hoa `Petals` ở `letter` (`FinalLetter.tsx` dòng 125). Không có cảnh chòm sao mới sau thư. Đừng bịa thêm asset.

**Reduced motion:** `useReducedMotion` (`site/src/lib/useReducedMotion.ts`) nghe `prefers-reduced-motion`. Reveal hiện cả câu. Galaxy không spin. Toast hết ngay. Universe gọi `onDone` lập tức.

**A11y:** một số `aria-live` (hint footer, toast `role="status"`, countdown `sr-only`). Nút Không không focus-to-activate. Ảnh gallery cần kiểm alt tại chỗ render; caption trống thì `content.ts` dòng 22 đặt `alt` = title era. Scratch canvas có `aria-label` = cover. Không audit máy đọc màn hình thật trong lần đọc này.

**Hiệu năng mobile:** một canvas WebGL khi ở gallery, canvas 2D nền `Starfield` luôn mount (`App.tsx` dòng 378). Ảnh `loading="lazy"` trên lá sau và pairs (đã thấy ở `Memory`). Không đo FPS trong repo.

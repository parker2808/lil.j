# Tổng quan dự án — MJ Universe

Phân tích tĩnh trên `main` tại commit `3fdc2db`. Mọi nhận định dưới đây bám file trong repo. Trạng thái: **Implemented** / **Partial** / **Planned-not-implemented**.

Sự thật đã xác nhận, và code khớp:

- Sinh nhật MJ: `2002-11-18`.
- Giờ sinh: `16:45` UTC+7. Giá trị trong data là `content.birth.when` = `2002-11-18T16:45:00+07:00` (`site/content.json` dòng 111). `site/scripts/selfcheck.mjs` dòng 73–75 assert đúng chuỗi này và chuỗi hiển thị có `16:45`.
- Ngày bắt đầu quan hệ: `2026-07-01T00:00:00+07:00` tại `content.startDate` (`site/content.json` dòng 72; assert ở `site/scripts/selfcheck.mjs` dòng 43).
- Ngày gặp lần đầu `2022-11-18`: **không có trong repo**. `grep` chuỗi `2022` trên toàn workspace không ra kết quả. Đây là fact bị thiếu, không phải fact bị mâu thuẫn bởi một ngày khác.

`gate.password` được định nghĩa tại `site/content.json` → `gate.password`. Tài liệu này không ghi giá trị.

## Framework và phiên bản

Nguồn: `site/package.json` dòng 1–29. Tên package: `vu-tru-cua-em`, `"type": "module"`, `"version": "1.0.0"`.

| Gói | Vai trò | Phiên bản khai báo |
| --- | --- | --- |
| `react`, `react-dom` | UI | `^19.3.1` |
| `vite` | Dev server và build | `^8.3.4` |
| `typescript` | Kiểm kiểu trước build | `~6.0.3` |
| `@vitejs/plugin-react` | Plugin React | `^6.1.2` |
| `framer-motion` | Chuyển cảnh, reveal, một số reel | `^14.6.0` |
| `@fontsource/inter` | Inter Latin + Vietnamese | `^5.3.0` |
| `oxlint` | Lint | `^1.88.0` |
| `playwright-core` | Suite overlap, dùng Chrome có sẵn trên máy | `^1.58.2` |

Không có React Router, Redux, Zustand, Tailwind, Three.js, hay backend. **Implemented.**

Script (`site/package.json` dòng 6–12): `dev` = `vite`; `build` = `tsc -b && vite build`; `lint` = `oxlint`; `preview` = `vite preview`; `overlap` = build rồi `node scripts/overlap-check.mjs`.

## Ngôn ngữ và UI

- TypeScript, JSX trong `site/src`. Entry: `site/src/main.tsx`.
- Style: một file `site/src/styles.css`. Không CSS framework.
- Token màu và chữ ở `:root` (`site/src/styles.css` dòng 1–56): nền `#56406f`, chữ `#fff7fb`, hồng `#f6b7d0`, lavender `#d4c4f6`, giấy `#fff5f8`.
- Font UI là system stack, Inter chỉ là fallback (`--sans`, dòng 20): `-apple-system`, `SF Pro`, rồi `Inter`. `--serif` gán bằng `--sans` (dòng 21). Script: Great Vibes self-host (`@font-face` dòng 59–65, file `site/public/fonts/GreatVibes-Regular.woff2`).
- `grep` `font-style: italic` trong `site/src/styles.css` không có kết quả. **Implemented** đúng hướng ít italic.
- Scale chữ compact: `--text-body: 14px`, `--text-h1: 24px` (dòng 39–43). Bo góc `--radius-sm/md/lg/pill` (dòng 50–53).
- `index.html` (`site/index.html` dòng 6–8): `viewport-fit=cover`, `interactive-widget=resizes-content`, `noindex, nofollow`, `theme-color` `#56406f`.

## Animation

- **Framer Motion** (`site/src/App.tsx` dòng 2, 448–476): `AnimatePresence` đổi `lock` ↔ `stepId`. Thời lượng 0.7s (lock) và 0.78s (bước), ease `[0.16, 1, 0.3, 1]`. `prefers-reduced-motion` thì `duration: 0` và bỏ transform.
- **CSS / DOM**: `Reveal` (`site/src/components/Reveal.tsx`) tách từ, mỗi từ `framer-motion` 0.62s, delay `0.045 * index`. Compliment và thư cuối dùng class `ink-word` (`site/src/styles.css` có `.ink-word`).
- **Canvas 2D**: `Starfield`, `WishSky`, `Fireworks`, foil scratch, confetti bánh.
- **WebGL1**: `mountGalaxy` trong `site/src/lib/galaxy-gl.ts`. Không có context thì fallback canvas 2D (cùng file, nhánh `fallbackMount`).

## State

Không store toàn cục. `useProgress` (`site/src/lib/useProgress.ts`) giữ `progress` và `update`. Persist `localStorage` key `lilj.progress.v1` (`PROGRESS_KEY`, `site/src/lib/progress.ts` dòng 4). Locale riêng: `lilj.locale.v1` (`LOCALE_KEY`, `site/src/lib/i18n.ts` dòng 8). Nhạc đã nghe: `lilj.musicHeard.v1` (`site/src/components/MusicButton.tsx` dòng 6).

`emptyProgress` (`progress.ts` dòng 6–31): `muted: true` ngay lần đầu. `flowVersion` lấy `FLOW_VERSION` (hiện `3` vì `INCLUDE_FRIENDS = false`, `site/src/lib/flow.ts` dòng 1 và 39).

`openedChapters` nằm trong type và được đọc lại khi load (`progress.ts` dòng 10, 92) nhưng không có chỗ ghi thêm trong `site/src`. **Partial**: field chết.

## Routing / navigation

Không URL route cho từng cảnh. Một index `progress.step`, clamp bởi `clampStep` (`flow.ts` dòng 43–47).

`FLOW` khi `INCLUDE_FRIENDS === false` (`flow.ts` dòng 4–23), 15 id theo thứ tự:

`gate`, `sky`, `birth`, `gallery`, `quiz`, `counter`, `cake`, `envelope`, `memory`, `scratch`, `letters`, `dreams`, `finale`, `wish`, `letter`.

`friends` có trong `FLOW_WITH_FRIENDS` (dòng 20) nhưng **không** nằm trên đường đang chạy. Component vẫn lazy-load nếu `stepId === "friends"` (`App.tsx` dòng 341–345). **Partial**: màn có code, không có trên path.

`go` (`App.tsx` dòng 90–107): không `jump` thì chỉ tới `unlocked + 1`. `?dev=1` gọi `go(index, true)`.

Nút Next: `stepDone` (`flow.ts` dòng 70–131) rồi `flowAction` (`App.tsx` dòng 267–275). `letter`, `gate`, hoặc khi quiz đang chiếm sticky, hoặc `!done` → không có Next. Quiz tự đăng ký nút “câu tiếp” qua `useRegisterSticky` (`Quiz.tsx` dòng 20–28), và `stickyAction = quizAction ?? flowAction` (`App.tsx` dòng 276).

Back: nút `←` khi `released && step > 0` (`App.tsx` dòng 383–386). Chấm tiến độ `aria-hidden`, không bấm (`App.tsx` dòng 486–489).

## Audio

`site/src/lib/music.ts`. `HTMLAudioElement`, không thư viện audio.

- `bindPlaylist` (dòng 38–44): chọn index ngẫu nhiên một lần mỗi visit.
- `nextTrackIndex` (dòng 32–36): bài kế không trùng bài vừa xong nếu có lựa chọn.
- `startMusic` (dòng 155): `muted === true` thì không `play()`. Lần đầu `muted` là true.
- `play()` reject: `MusicButton` gọi `onBlocked` → toast. Xem `INTERACTIONS_AND_CONTENT.md`.
- `playBirthday` (dòng 203): crossfade `CROSSFADE_MS = 800` sang `music.birthday`, loop. `App.tsx` dòng 217–224 gọi khi `stepId === "cake"`, cleanup `resumePlaylist`.
- `fadeMusic(8000)` (`music.ts` dòng 186; gọi ở `FinalLetter.tsx` dòng 32–34) khi vào thư cuối. Rời `letter` thì `restoreMusicVolume` (`App.tsx` dòng 213–215).
- SFX: `playChime` (`music.ts` dòng 318–341), hai nốt sine 880 và 1318, chỉ khi nhạc đang phát và volume > 0.01. Caller: `WishSky.tsx` dòng 71 và 159. Không có file SFX trong `public/`.

Playlist file nằm `site/public/music/` (mp3 khai trong `content.music.tracks` và `content.music.birthday`). Đây là bản thu của người khác (Laufey, beabadoobee, sleepvolume, và các file không ghi artist). **Implemented** về playback. Bản quyền file: không kiểm được từ code.

## Content và locale

`site/content.json` import tĩnh trong `site/src/content.ts` dòng 1. `flattenPhotos` (dòng 16–28) đánh `pair: true` cho 2 ảnh đầu mỗi era. `validateContent` (dòng 52 trở đi) chạy lúc render `App`; lỗi thì màn `content.ui.contentError` (`App.tsx` dòng 241–249).

Locale: `LocaleProvider` (`site/src/lib/locale.tsx`). `readLocale` (`i18n.ts` dòng 47–55) mặc định `"en"`. `t()` chọn `vi` hoặc `en`. Đổi ngôn ngữ ghi `lilj.locale.v1`, `document.documentElement.lang`, `document.title`.

Copy dạng `{ vi, en }`. Field plain (không dịch) liệt kê trong `PLAIN` (`i18n.ts` dòng 10–24), gồm `password`, `startDate`, `herName`, `when`, `unlockAt`, …

`vite.config.ts` plugin `contentMeta` nhét `meta.title.en` và `meta.description.en` vào `index.html` lúc build.

## Asset

- Ảnh: public id Cloudinary `lilj/...`. Helper `cloudinaryUrl` (`site/src/lib/images.ts` dòng 29–36) thêm `c_limit,w_<px>/f_auto/q_auto/`. Base host nằm trong file đó (`CLOUD_BASE`). Không commit file ảnh MJ.
- Đếm trên `content.json`: 5 era (`care` 6, `pout` 7, `surprise` 7, `ordinary` 10, `more` 9) = 39 ảnh. Cả 39 `caption` trống. `compliment` đều có chữ. Mọi `eras[].date` là `2026-07-01`. Không ảnh nào có `photo.date`.
- Nhạc: `site/public/music/*.mp3`. Font script: `site/public/fonts/`. `favicon.svg`, `stars.svg`.
- `npm run placeholders` (`site/scripts/make-placeholders.mjs`) ghi SVG và `nen.wav` vào `public/`. Không phải đường chạy của site đang deploy.

## Build và deploy

- Local: `cd site && npm install && npm run dev`. Vite 8 khai `engines.node` là `^20.19.0 || >=22.12.0` trong package của Vite (không có field `engines` trong `site/package.json`).
- Deploy repo: `vercel.json` ở root. `installCommand` / `buildCommand` chạy trong `site/`, `outputDirectory` `site/dist`, rewrite mọi path về `index.html`.
- `site/vercel.json`: `framework: vite`, cùng rewrite SPA.

## Cây thư mục (độ sâu hữu ích)

```
vercel.json
site/
  content.json
  index.html
  package.json
  vite.config.ts
  vercel.json
  public/fonts/  public/music/  public/favicon.svg
  scripts/overlap-check.mjs  selfcheck.mjs  make-placeholders.mjs
  src/main.tsx  App.tsx  styles.css  content.ts  types.ts
  src/components/   Gate, LockScreen, Universe, BirthSky, Cake,
                    Envelope, Letters, Finale, FinalLetter, WishSky,
                    SpiralGalaxy, Starfield, Reveal, MusicButton, StickyNext
  src/chapters/     Gallery, Quiz, Memory, Scratch, Dreams, Friends, Counter
  src/lib/          flow, progress, i18n, locale, music, stars, galaxy, galaxy-gl,
                    images, lock, pure, viewport, useProgress, useReducedMotion
tools/fb-photo-downloader/   không thuộc runtime của site
```

## Entry và cách cảnh được dựng

1. `site/index.html` mount `#root`, script `site/src/main.tsx`.
2. `main.tsx` dòng 16–26: `createRoot` → `StrictMode` → `Boundary` → `LocaleProvider` → `App`. Font Inter import dòng 3–10.
3. `App` đọc `useProgress()`, `validateContent(content)`. Nếu `problem` thì dừng ở màn lỗi.
4. `released` khởi tạo (`App.tsx` dòng 63–65): `(dev && !forceLock) || !isBeforeUnlock(content.lock.unlockAt)`.
   - Trước `lock.unlockAt` (`2026-11-18T00:00:00+07:00`, `content.json` gần cuối file, key `lock.unlockAt`) và không có bypass: render `LockScreen` (`App.tsx` dòng 449–459).
   - `?dev=1`: `dev` true, `forceLock` false → `released` true, bỏ countdown.
   - `?dev=1&lock=1`: `forceLock` true → vẫn countdown đến đúng giờ; hàng nhảy bước chỉ hiện khi `released && dev` (dòng 420).
5. Sau khi mở: `stepId = FLOW[clampStep(progress.step)]` (dòng 77–78). `if/else` dòng 284–373 chọn component. Hầu hết `lazy()` + `Suspense` (dòng 24–36). `Gate` và `Envelope` import tĩnh.
6. Nền luôn có `Starfield` (dòng 378). Header chrome, footer `flow` (ẩn bằng class `lock-off` khi chưa `released`, dòng 481).

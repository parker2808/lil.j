# PROJECT_CONTEXT — MJ Universe (lil.j)

> **Mandatory reading for every agent** (Cursor, Claude Code, Codex, T3 Code threads, cloud agents) before touching this repo.
> Every PR that changes `main` must update **§12 Current status** and **§13 Changelog** in the same PR. CI checks that `PROJECT_CONTEXT.md` exists at HEAD and is changed for PRs touching files outside `docs/`; it does not check individual sections. Docs-only changes are exempt from the update requirement, and the `skip-context` label bypasses CI.
> Sources: Parker's instructions in the lil.j bot chat (2026-10-25 → 2026-10-30, dates in UTC+7), merged PRs #1–#25, draft PR #26, the code on `main` at `3e1c9f3`. Anything marked **(uncertain)** has not been confirmed by Parker.

## 1. Project overview
- **What:** a private birthday website for Parker's girlfriend J, called "MJ Universe" (Vietnamese title *Đến những vì sao cũng biết tên em*; repo README title "Even the Stars Know Your Name").
- **Repo:** https://github.com/parker2808/lil.j · **Production:** https://lil-j.vercel.app (Vercel auto-deploys `main`).
- **Owner / sole decision maker:** Parker. He writes in Vietnamese; reports to him should be in Vietnamese, in plain non-technical language (technical details kept separate) — 2026-10-26.
- It is a gift, not a product: no accounts, no server, no database. Progress and language live in `localStorage`.

## 2. People and confirmed facts
| Fact | Value | Source / status |
|---|---|---|
| Owner | Parker (signs the letter "Parker") | chat 2026-10-26 |
| Recipient | J, also "MJ" (`meta.herName`, `meta.monogram`) and "Jolie" (`meta.constellationName` = `JOLIE`) | chat 2026-10-26 |
| J's birth | 2002-11-18, 16:45, Hanoi, UTC+7 (`birth.when` = `2002-11-18T16:45:00+07:00`) | **Confirmed by Parker 2026-10-30** (date, time 16:45 and place). `birth.timeConfirmed` is already `true` on `main` and in PR #26 |
| Together since | **2026-07-01 00:00 UTC+7** (`startDate`) — the **only confirmed relationship date** | chat 2026-10-26, re-stated 2026-10-30 |
| Site unlock | 2026-11-18 00:00 UTC+7 (`lock.unlockAt` = `2026-11-18T00:00:00+07:00`) | PR #7 (2026-10-26) |

## 3. Unverified and forbidden facts
- **"First met 2022-11-18" is UNVERIFIED (Parker, 2026-10-30).** It must not appear anywhere visitor-facing (VI or EN), must not be used by validators, and **must not be replaced with any other date**. On `main` it still exists (`content.json: "firstMeeting": "2022-11-18"` and copy in birth/gallery/counter ledes); draft PR #26 removes it (`firstMeeting: null`).
- **Never invent** dates, memories, places, captions, people (who went along, who gave flowers, who organised a birthday), or confirmations. Leave unknowns blank and mark them unfinished — 2026-10-28.
- Galaxy v3 rules (req3 plan): don't infer dates from Facebook order; the childhood photo's 2024-05-03 date is the date the print was re-photographed, not the moment; don't show EXIF dates as absolute truth; group 13 ("Ảnh thử") source is unconfirmed.
- Status of the former unknowns, checked against PR #26 (`fix/story-v2-production-review`) on 2026-10-30. These values reach `main` only when PR #26 is merged:
  - First-meeting date: PR #26 sets `firstMeeting: null` (unknown). No "2022" left in its `content.json`. Stays unknown; no photo era is marked `first-meeting`.
  - Era kinds: `g-childhood` = `her-life`, the other 12 eras = `together`. (Same as on `main`; PR #26 did not change this.)
  - Memory photos: PR #26 sets 6 ids: `g-selfies-bb678f64f7`, `g-flowers-3372df2172`, `g-camera-2095ecb7ae`, `g-travels-c177584edc`, `g-together-aa799e7857`, `g-cafes-ffd066137a` (12 cards). Parker has not yet approved this choice visually.
  - Photo dates: **still blank**, 0 of 162 photos have a date, and no era has a date. Only the first photo of each of the 13 eras has a caption.
  - Date invitation (`envelope`): **still has no time or place**; the copy says "we'll work out where to go together".

## 4. Content rules
- **All non-image text (VI and EN) lives in `site/content.json`**, never hardcoded in components — 2026-10-26 (PR #5, #6).
- Visitor-facing copy is `{ "vi": "...", "en": "..." }`; missing translations are checked by runtime validation and `npm run content-check`, not by `npm run build`.
- Plain strings allowed only for ids, `src`, dates, `lock.unlockAt`, `birth.*` coordinates, music titles, the gate answer, `meta` short names.
- **Never expose the gate password or any secret** in chat, reports, PR bodies, logs, or screenshots. (Note: the nickname is stored in plain text in `content.json`; privacy is social, not cryptographic.) Cloudinary API credentials never go into the repo, frontend, Git, or logs.
- Content-only tasks change copy only: no code/UI/scene order/routing/migration changes, no added/removed keys, no edits to logic fields (req4 plan).
- **Default language: ENGLISH** when nothing is saved (Parker's decision, 2026-10-30). ⚠ The code still defaults to Vietnamese (`site/src/lib/i18n.ts`, from PR #20, and the acceptance tests expect VI). A future task must switch it to EN; see §12. `README.md` already says English.

## 5. Tech stack and architecture (verified from code on `main`)
- React 19 + TypeScript + Vite 8 (`site/`), Framer Motion, WebGL galaxy (`src/lib/galaxy-gl.ts`, 2D fallback), Canvas 2D (birth sky, wish sky, starfield, fireworks, scratch, cake), Web Audio + `getUserMedia` (blow out candles; tap fallback), `HTMLAudioElement` playlist, Fontsource Inter + self-hosted Great Vibes. Lint: oxlint. Tests: playwright-core with local Chrome.
- Deploy: root `vercel.json` builds `site/` and serves `site/dist` with SPA rewrite.
- Key files: `site/content.json` (all copy/data), `src/content.ts` (load + validate), `src/lib/flow.ts` (scene order, frozen `FLOW_V1..V4`), `src/lib/story.ts` (5 chapters), `src/lib/progress.ts` (`lilj.progress.v1`, migration), `src/lib/lock.ts`, `src/lib/images.ts` (Cloudinary URLs), `src/lib/i18n.ts` (`lilj.locale.v1`).
- Scripts (`site/`): `npm run build`, `npm run lint`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run overlap`, `npm run story-v2-check`.
- `?dev=1` skips the lock and shows the jump row; `?dev=1&lock=1` keeps the countdown for review. Not persisted.
- Other: `tools/fb-photo-downloader/` (PR #1, local helper, don't touch unless asked).

## 6. Story V2 — the 15 scenes (`FLOW_V4` in `src/lib/flow.ts`)
`LockScreen` is in front of the path and is not a scene. No 16th scene. `friends` stays off.

| # | Scene id | Chapter |
|---|---|---|
| 1 | gate | I · Một vũ trụ mang tên em |
| 2 | sky | I |
| 3 | birth | I |
| 4 | gallery | II · Những điều anh nhớ |
| 5 | memory | II |
| 6 | quiz | II |
| 7 | scratch | II |
| 8 | counter | III · Từ ngày có hai đứa mình |
| 9 | dreams | III |
| 10 | letters | III |
| 11 | cake | IV · Ngày đặc biệt của em |
| 12 | wish | IV |
| 13 | envelope | V · Còn nhiều điều phía trước |
| 14 | finale | V |
| 15 | letter | V (final letter, no Next, the climax) |

Rules (docs/story-v2/implementation.md): memory/scratch/letters have a "later" action; quiz needs every answer; gallery completes after one fully viewed era; Next stays hidden until the scene is done; Back only to unlocked scenes; frozen flows are never edited; progress key stays `lilj.progress.v1`.

## 7. Assets and Cloudinary
- Cloud name `oiounrmh`; folder `lilj/`, one subfolder per era. Current set: **Galaxy v3** under `lilj/galaxy-v3/` — 13 chapters, 162 photos (PR #23). Order: Tuổi thơ → Selfie → Hoa → Dạo phố → Máy ảnh → Cờ đỏ → Du lịch → Váy trắng/cổng xanh → Sinh nhật → Hai đứa → Café → Giáng sinh → Ảnh thử (thematic, not chronological).
- `src` values are public ids (e.g. `lilj/galaxy-v3/childhood/g-childhood-02cb6fb950`); delivery URLs are built in `images.ts`. No image files in the repo.
- The 39 pre-v3 assets were backed up then deleted (backup on the bot's box at `/workspace/galaxy-v3/backup/`). Deleting Cloudinary assets only within MJ Universe scope, after backup, never account-wide.
- `memoryPhotoIds` is empty on `main` → the Memory game is broken; PR #26 picks 6 Galaxy v3 photos (12 cards) pending Parker's visual approval.
- Music: `site/public/music/`, listed in `music.tracks`; `music.birthday` is the cake loop.

## 8. Testing requirements
- Test first on **iPhone 14 Pro Max: 430×932 and 430×739** (toolbar open) — 2026-10-26. Safe areas 59px top / 34px bottom.
- Before asking for review: `npm run lint`, `npm run build`, `selfcheck`, `content-check`, `progress-check`, `story-v2-check`, `npm run overlap` (VI+EN, dev on/off, pending/done) where relevant. Report what was **not** run.
- Checks must fail on regressions such as an empty Memory deck (2026-10-30).
- QA deliverables go in `docs/story-v2-qa/` (report, bug list, before/after screenshots, test results) — 2026-10-30.

## 9. UX preferences (Parker, mostly 2026-10-26)
- Intuitive for first-time visitors; uncluttered; only relevant content.
- Next hidden until the required action is done.
- Smooth word-by-word text reveals; respect `prefers-reduced-motion`.
- Polished, realistic visuals (galaxy should look like a real galaxy); crisp text, at most a very subtle glow; no smeared shadows.
- Compact, consistent type scale; no oversized headings; macOS/system-style fonts; avoid overusing italics.
- **Rounded corners**, no square borders (e.g. no rectangle behind the rounded Wish input — 2026-10-30).
- Tooltips/notices auto-hide after ~3s. Muted music button: after the notice hides, only a subtle glowing border, no persistent label.
- Custom themed scrollbars on desktop.
- Inputs: no iOS auto-zoom, never covered by the keyboard; on desktop just focus.
- Touch elements (scratch cards, etc.) must still let vertical swipes scroll the page.
- Finale: keep the runaway "Để sau" button, show `finale.teases`, brief Yes response, final letter remains the climax, accessible (2026-10-30).

## 10. Git, PR and deploy workflow
- `main` auto-deploys to production. **Never deploy or merge to `main` without Parker's review.**
- One task = one branch + one PR. Parker merges **only after he explicitly says "merge"**, one PR at a time — 2026-10-28.
- Multi-PR work goes through an integration branch (e.g. `story-v2`) that is then merged to `main` as one PR (#25, merged 2026-10-30 07:40 UTC+7 on Parker's request).
- Don't push to another task's branch (e.g. don't touch `fix/story-v2-production-review` unless that is your task).
- Plans and reports: plain language, Vietnamese for Parker.

## 11. Multi-agent coordination rules
1. Read this file and `AGENTS.md` before starting.
2. One agent per branch or git worktree; never share a working tree.
3. Edit only files inside your task's scope. In shared files (e.g. `content.json`), edit only the keys you own (see req4 ownership split: Galaxy agent owns `eras`, `galleryCopy`, gallery chapter/hint, Memory deck; content agent owns other copy). Never overwrite a whole file or parent array to resolve conflicts.
4. Check `git status`/diff first; preserve others' work.
5. Record new decisions from Parker in this file (with date) in your PR; don't invent rules.
6. If facts are missing, stop and ask (via the coordinator) — don't guess.
7. **Skip deferred items (§12a).** Don't work on anything outside the 15 Story V2 scenes unless Parker asks (decision 2026-10-30).

## 12. Current status and open items (as of 2026-10-30)
- `main` @ `3e1c9f3` plus **draft PR #26** (`fix/story-v2-production-review`, merged with current `main`): Story V2 production-review fixes — drop unverified first-meeting date claims (`firstMeeting: null`), set `birth.timeConfirmed: true` with 16:45 in content, restore six Galaxy v3 Memory photo IDs (12 cards), remove Wish keyboard-open rectangle suspect (`.wish-form` backdrop), surface Finale teases and Yes celebration copy, and add `.github/workflows/story-v2-verify.yml` (lint, build, content/progress checks, iPhone screenshots, overlap, full journey).
- **Confirmed by Parker (2026-10-30):** the six Memory deck photo IDs and birth time **16:45** (matches `birth.timeConfirmed: true` in content/code).
- **Draft PR #26 (2026-10-30, iPhone preview):** Memory scene uses full-width tiles, match feedback as a short-lived top overlay toast (grid layout unchanged), random six-photo deal from the full era pool (`?seed=` for QA); Finale “Later” dodge no longer skips or advances (only Yes + sticky Next after `saidYes`); Yes label uses an orange heart.
- **Parker review still before merge:** full VI/EN copy across the 15 scenes; test Wish keyboard layout on a real iPhone (CSS fix is unverified on device).
- **Open: switch the default language to EN** in code (`i18n.ts`) and in tests/acceptance (`story-v2-check`, `docs/story-v2/acceptance.md`). Decided 2026-10-30; not done.
- **Open: update `README.md`.** Its visit list is an older 16-step path; it should list the 15 Story V2 scenes (§6). Its "English is the default" line is already correct.
- Still blank inside the 15 scenes: photo dates (Gallery, scene 4), captions beyond the first photo of each era (Gallery), and the date-invitation time and place (Envelope, scene 13). The first-meeting date stays unknown on purpose.
- Pending: full 15-scene VI/EN review and `docs/story-v2-qa/` deliverables after PR #26 lands.

## 12a. Deferred (phát triển sau)
Parker's decision (2026-10-30): anything not shown in the 15 Story V2 scenes (§6) is out of scope for now. Agents skip these unless Parker asks.
- Friend-notes scene (`friends`, `friendNotes`, `friendsCopy`, `flow.hints.friends`): off the path (`INCLUDE_FRIENDS = false`). It names Minh, Hà and Khoa; whether they are the real senders is unconfirmed. Don't edit it and don't turn it on.
- `tools/fb-photo-downloader/` (PR #1): a local helper, not part of the site.
- Frozen old flows `FLOW_V1`–`FLOW_V3`: kept only for progress migration. Don't edit them.

## 13. Changelog
- 2026-10-30 — Scene 5 Memory end layout: stats line centred above the grid; action row below the grid shows "Play later" only while unfinished and "All matched" + "Play again" (secondary) after completion; no overlap at 430×932, 430×739, 1280×800 (Parker iPhone feedback).
- 2026-10-30 — PR #26: Memory grid height clamp + meta aligned above deck; QA asserts all 12 cards fit 390×844 and desktop.
- 2026-10-30 — PR #26: Memory match feedback moved to auto-hiding overlay toast (screen 5).
- 2026-10-30 — PR #26: seeded Memory deck randomization (`memory-deck.ts` + unit test in Story V2 verify).
- 2026-10-30 — PR #26 mobile fixes: Memory tile layout, Finale Later cannot navigate, orange Yes heart; Parker iPhone feedback on screen 5.
- 2026-10-30 — Parker confirmed Memory deck photo choices and 16:45 birth time; §12 updated (copy review and iPhone Wish keyboard still open).
- 2026-10-30 — Draft PR #26 production review: factual/copy fixes (first meeting unknown, birth time 16:45 confirmed in content), Memory deck IDs, Wish/Finale UX, Story V2 verify workflow on PRs and `main`; merged `main` into the branch and refreshed §12/§13 for context-check.
- 2026-10-30 — PR #27 review fixes: reject missing/deleted context at HEAD; clarify file-level CI enforcement and runtime/content-check translation validation.
- 2026-10-30 — Everything outside the 15 scenes marked Deferred (phát triển sau).
- 2026-10-30 — Parker's decisions recorded: English is the default language; 16:45 birth time confirmed; former unknowns checked against PR #26.
- 2026-10-30 — PROJECT_CONTEXT.md, AGENTS.md and context-check workflow added (this PR).
- 2026-10-30 — #25 story-v2 → main (Story V2 + Galaxy v3 + copy).
- 2026-10-28/29 — #12–#24 into `story-v2`: frozen flows, migration, later actions, chapter labels, private wish, envelope invitation, journey menu + Vietnamese default, browser checks, finale runaway, Galaxy v3, content-only copy.
- 2026-10-27 — #10 portfolio README and case study. (#11 story review closed unmerged.)
- 2026-10-26 — #2 full path, #3 era planets, #4 spiral galaxy, #5 copy to content.json, #6 real copy, #7 birthday lock, #8 iPhone 14 Pro Max layout, #9 music toast + ring.
- 2026-10-25 — #1 Facebook photo downloader.

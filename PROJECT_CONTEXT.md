# PROJECT_CONTEXT — MJ Universe (lil.j)

> **Mandatory reading for every agent** (Cursor, Claude Code, Codex, T3 Code threads, cloud agents) before touching this repo.
> Every PR that changes `main` must update **§12 Current status** and **§13 Changelog** in the same PR. CI checks that `PROJECT_CONTEXT.md` exists at HEAD and is changed for PRs touching files outside `docs/`; it does not check individual sections. Docs-only changes are exempt from the update requirement, and the `skip-context` label bypasses CI.
> Sources: Parker's instructions in the lil.j bot chat (2026-10-25 → 2026-10-30, dates in UTC+7), merged PRs #1–#25, draft PR #26, the code on `main` at `3e1c9f3`. Anything marked **(uncertain)** has not been confirmed by Parker.

## 1. Project overview
- **What:** a private birthday website for Parker's girlfriend J, called "MJ Universe" (Vietnamese title *Đến những vì sao cũng biết tên em*; repo README title "Even the Stars Know Your Name").
- **Repo:** https://github.com/parker2808/lil.j · **Production:** https://lil-j.vercel.app (Vercel auto-deploys `main`).
- **Owner / sole decision maker:** Parker. He writes in Vietnamese; reports to him should be in Vietnamese, in plain non-technical language (technical details kept separate) — 2026-10-26.
- It is a gift, not a product: no accounts, no server, no database. Progress and language live in `localStorage`.
- **One exception (Parker, 2026-10-30): J's scene 9 ticks and scene 11 wishes are copied to Parker's Google Sheet** through a Google Apps Script web app (`tools/sheet-sync/`). Both scenes say so on screen (`dreamsCopy.note`, `wish.note`). A wish sent with "Giữ điều ước cho riêng em" switched on stays on her device and is never sent. Off when `VITE_SHEET_URL` is empty. Vercel flag `VITE_WISH_PRIVATE_SWITCH` (Parker, 2026-10-31): `false` hides that switch, so every new wish is sent and the note reads `wish.noteShared`; `true` or unset keeps the switch. Wishes already kept private are never sent. Changing it needs a redeploy.

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
- **Never expose the gate password or any secret** in chat, reports, PR bodies, logs, or screenshots. (Note: the nickname is stored in plain text in `content.json`; privacy is social, not cryptographic.) Cloudinary API credentials never go into the repo, frontend, Git, or logs. The Apps Script `/exec` URL ends up in the built site, so it is not a secret, but it is kept out of the repo: it lives only in Vercel's `VITE_SHEET_URL`, and only Parker sets it.
- Content-only tasks change copy only: no code/UI/scene order/routing/migration changes, no added/removed keys, no edits to logic fields (req4 plan).
- **Default language: ENGLISH** when nothing is saved (Parker's decision, 2026-10-30). ⚠ The code still defaults to Vietnamese (`site/src/lib/i18n.ts`, from PR #20, and the acceptance tests expect VI). A future task must switch it to EN; see §12. `README.md` already says English.

## 5. Tech stack and architecture (verified from code on `main`)
- React 19 + TypeScript + Vite 8 (`site/`), Framer Motion, WebGL galaxy (`src/lib/galaxy-gl.ts`, 2D fallback), Canvas 2D (birth sky, wish sky, starfield, fireworks, scratch, cake), Web Audio + `getUserMedia` (blow out candles; tap fallback), `HTMLAudioElement` playlist, Fontsource Inter + self-hosted Great Vibes. Lint: oxlint. Tests: playwright-core with local Chrome.
- Deploy: root `vercel.json` builds `site/` and serves `site/dist` with SPA rewrite.
- Key files: `site/content.json` (all copy/data), `src/content.ts` (load + validate), `src/lib/flow.ts` (scene order, frozen `FLOW_V1..V4`), `src/lib/story.ts` (5 chapters), `src/lib/progress.ts` (`lilj.progress.v1`, migration), `src/lib/lock.ts`, `src/lib/images.ts` (Cloudinary URLs), `src/lib/i18n.ts` (`lilj.locale.v1`).
- Scripts (`site/`): `npm run build`, `npm run lint`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run overlap`, `npm run story-v2-check` (builds with a fake sheet URL and checks the sheet sync), `npm run memory-deck-test`, `npm run sheet-sync-test`. `OVERLAP_SHARD=i/n` makes `overlap` check every n-th viewport starting at the i-th (CI runs 6 parts in parallel; together they cover everything).
- Sheet sync: `src/lib/sheet-outbox.ts` (pure queue logic, `lilj.outbox.v1`), `src/lib/sheet-sync.ts` (sending, retries, `lilj.visitor.v1`), Apps Script in `tools/sheet-sync/Code.gs` with setup steps in `tools/sheet-sync/README.md`. `privateSwitchOn` (from `VITE_WISH_PRIVATE_SWITCH`) lives in `sheet-sync.ts`; `npm run wish-flag-check` builds with it set to `false` (also run in the CI `journey` job).
- CI (`.github/workflows/story-v2-verify.yml`, shared setup in `.github/actions/setup-site`): parallel jobs `checks` (lint, build, content/progress, all `scripts/*.test.mjs`, 15 iPhone screenshots), `journey` (`story-v2-check`) and `overlap (1/6…6/6)`. A new push to a PR cancels its older run; runs on `main` are never cancelled.
- `?dev=1` skips the lock and shows the jump row; `?dev=1&lock=1` keeps the countdown for review. Not persisted. Works only when the build has Vercel `VITE_DEV_MODE=true` (`src/lib/dev-mode.ts`, Parker 2026-10-31); unset means off. Browser checks that use it build with `VITE_DEV_MODE=true`; `npm run lock-check` builds without it.
- Lock clock (Parker 2026-10-31): unlock and countdown use the server time from the site's own `Date` header (`src/lib/server-clock.ts`), so changing the device clock does not open the site. The bundle still contains the story, so this is not protection against reading the code.
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
| 11 | wish | IV · Ngày đặc biệt của em |
| 12 | cake | IV |
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

## 12. Current status and open items (as of 2026-10-31)
- **Git guardrails and canonical agent rules (branch `chore/guardrails-agents-md`, 2026-10-31):** `AGENTS.md` consolidates the rules; `AGENT_RULES.md` points to it. `docs/LESSONS.md` records three workflow lessons. A documented pre-commit hook blocks `main`/`master` commits and scans staged changes when Gitleaks is installed; CI runs Gitleaks on PRs and `main` pushes.
- **Dev mode flag and server-time lock (branch `feat/dev-mode-flag`, 2026-10-31):** Parker asked for a Vercel variable to enable dev mode, unset meaning off, and for the lock to use server time so a changed device date cannot open it. After merge `?dev=1` stops working on Production until `VITE_DEV_MODE=true` is set there; Parker should set it on Preview for testing.
- **Wish private-switch flag (PR #36, merged 2026-10-31):** Parker asked for a Vercel flag: `true` keeps "Giữ điều ước cho riêng em", `false` sends every wish by default. Unset behaves like `true`. Copy `wish.noteShared` shown only when the flag is `false`.
- **2026-10-31, PR #30 follow-up:** Parker confirmed the original Sheet integration works; approved table-style formatting and coarse browser/device labels with manual aliases across both tabs. UI refinement must preserve the existing galaxy, pastel-pink palette, rounded shapes, typography/reveal, and approved star/moon privacy switch. New script migration backs up old 5-column tabs, preserves records, separates test/real choices, and adds a device alias registry. Live upgrade still needs Parker to paste the new script, run setup and redeploy it.
- 2026-10-31 — CI standard recorded in `AGENT_RULES.md` (branch `chore/cicd-standard`): future CI changes must keep the current parallel/sharded design. No workflow changed.
- 2026-10-31 — `AGENT_RULES.md` added on `chore/agent-rules` for review. It copies the shared rules verbatim and records this repo's commands, CI, content locations, and PR conventions. No site behavior or content changed.
- **CI speed-up (branch `chore/faster-story-v2-ci`, 2026-10-31):** Story V2 verify took 7–9 min, about 5.5 min of it the overlap check run one case after another. It is now split into parallel jobs with the same coverage (all 2,880 overlap cases). Merged as PR #34 on 2026-10-31 (CI run 1m45s). PR #30 was merged with it; its sheet unit tests run through `node --test scripts/*.test.mjs`.
- `main` @ `3e1c9f3` plus **draft PR #26** (`fix/story-v2-production-review`, merged with current `main`): Story V2 production-review fixes — drop unverified first-meeting date claims (`firstMeeting: null`), set `birth.timeConfirmed: true` with 16:45 in content, restore six Galaxy v3 Memory photo IDs (12 cards), remove Wish keyboard-open rectangle suspect (`.wish-form` backdrop), surface Finale teases and Yes celebration copy, and add `.github/workflows/story-v2-verify.yml` (lint, build, content/progress checks, iPhone screenshots, overlap, full journey).
- **Confirmed by Parker (2026-10-30):** the six Memory deck photo IDs and birth time **16:45** (matches `birth.timeConfirmed: true` in content/code).
- **Draft PR #26 (2026-10-30, iPhone preview):** Memory scene uses full-width tiles, match feedback as a short-lived top overlay toast (grid layout unchanged), random six-photo deal from the full era pool (`?seed=` for QA); Finale “Later” dodge no longer skips or advances (only Yes + sticky Next after `saidYes`); Yes label uses an orange heart.
- **Parker review still before merge:** full VI/EN copy across the 15 scenes; test Wish keyboard layout on a real iPhone (CSS fix is unverified on device).
- **Open: switch the default language to EN** in code (`i18n.ts`) and in tests/acceptance (`story-v2-check`, `docs/story-v2/acceptance.md`). Decided 2026-10-30; not done.
- **Open: update `README.md`.** Its visit list is an older 16-step path; it should list the 15 Story V2 scenes (§6). Its "English is the default" line is already correct.
- Still blank inside the 15 scenes: photo dates (Gallery, scene 4), captions beyond the first photo of each era (Gallery), and the date-invitation time and place (Envelope, scene 13). The first-meeting date stays unknown on purpose.
- Pending: full 15-scene VI/EN review and `docs/story-v2-qa/` deliverables after PR #26 lands.
- **Sheet sync (branch `feat/share-choices`, draft PR #30):** Parker confirmed the original integration works on 2026-10-31. The device-label/table-style upgrade is ready in the PR, pending live Apps Script upgrade using `tools/sheet-sync/README.md`. New UI passed VI/EN iPhone viewport and simulated keyboard checks (`npm run sheet-ui-check`); real iPhone keyboard verification is still needed. Parker approved the shorter `wish.sent` copy on 2026-10-31.
- Scene 11 (wish) now needs at least one wish before Next (Parker, 2026-10-30); the old "keep without writing" button is gone. Old saves with `wishPrivate: true` still count as done.

## 12a. Deferred (phát triển sau)
Parker's decision (2026-10-30): anything not shown in the 15 Story V2 scenes (§6) is out of scope for now. Agents skip these unless Parker asks.
- Friend-notes scene (`friends`, `friendNotes`, `friendsCopy`, `flow.hints.friends`): off the path (`INCLUDE_FRIENDS = false`). It names Minh, Hà and Khoa; whether they are the real senders is unconfirmed. Don't edit it and don't turn it on.
- `tools/fb-photo-downloader/` (PR #1): a local helper, not part of the site.
- Frozen old flows `FLOW_V1`–`FLOW_V3`: kept only for progress migration. Don't edit them.

## 13. Changelog

Older and full entries: `docs/CHANGELOG_ARCHIVE.md` (read only when needed).

- 2026-11-01 — Trimmed this changelog to the latest 5 entries; full history moved to `docs/CHANGELOG_ARCHIVE.md`.
- 2026-10-31 — Agent rules consolidated in `AGENTS.md`, `docs/LESSONS.md`, Gitleaks pre-commit hook and CI secret scan.
- 2026-10-31 — Graphify code map added (PR #38) and refreshed from `main`.
- 2026-10-31 — Vercel flag `VITE_DEV_MODE` gates `?dev=1`; birthday lock follows server time; `lock-check` and `screenshots` scripts.
- 2026-10-31 — Vercel flag `VITE_WISH_PRIVATE_SWITCH` for scene 11 (`false` shares every new wish); `wish-flag-check` in CI.

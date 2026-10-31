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

- 2026-10-31 — Consolidated agent rules in `AGENTS.md`, added `docs/LESSONS.md`, a branch-protecting Gitleaks pre-commit hook, and a CI secret-scan job; documented hook setup in README.
- 2026-10-31 — Refreshed Graphify code map (`graphify update .`, code-only) from current `main`.
- 2026-10-31: Added Graphify code map (`graphify-out/GRAPH_REPORT.md` committed, rest of `graphify-out/` gitignored; built with `--code-only`, no model calls) and shortened `AGENT_RULES.md` to ~30 lines pointing to the shared common rules and TOKEN_FLOW in `<private-memory-repo>`. Merged (PR #38).
- 2026-10-31 — Vercel flag `VITE_DEV_MODE`: `?dev=1` works only when it is `true` (unset is off). The birthday lock and countdown follow the server's `Date` header instead of the device clock. New `npm run lock-check` (in CI `journey`) and `npm run screenshots`; browser checks build with `VITE_DEV_MODE=true`; `story-v2-check` lock test fakes the server time too.
- 2026-10-31 — Vercel flag `VITE_WISH_PRIVATE_SWITCH` for scene 11: `false` hides the keep-private switch and shares every new wish (note `wish.noteShared`); old private wishes stay private. New `npm run wish-flag-check` (in CI `journey`), README steps for Vercel.
- 2026-10-31 — `AGENT_RULES.md` CI workflows: any CI change must follow the shared front-end CI/CD lessons in Parker's memory repo and keep the current design (parallel jobs, sharded browser checks, shared setup action, npm cache, stale-PR cancel, `timeout-minutes`, logs/screenshots uploaded with `if: always()`). Docs only; workflows unchanged.
- 2026-10-31 — Added `AGENT_RULES.md` with a verbatim copy of `<private-memory-repo>/rules/COMMON_RULES.md` and lil.j rules verified against this repo; linked it from `AGENTS.md`.
- 2026-10-31 — CI speed-up: Story V2 verify split into parallel jobs (`checks`, `journey`, `overlap` in 6 parts via `OVERLAP_SHARD`), shared setup action, unit tests run as `scripts/*.test.mjs`, superseded PR runs cancelled, merged branch `fix/story-v2-production-review` removed from push triggers. Same checks and coverage as before.
- 2026-10-31 — PR #30 brought up to `AGENT_RULES.md`: merged current `main` (new parallel CI runs the sheet unit tests through `scripts/*.test.mjs`), rules list `sheet-sync-test` / `sheet-ui-check`, the Sheet data exception, and that the Apps Script URL is never committed.
- 2026-10-31 — PR #30 review fixes: scenes 9 and 11 use the shared title size (24px on phones), kicker spacing and italic lede like every other scene; refinement CSS folded into the original Dreams/Wish rules (unused `.dreams-note` removed, other computed styles unchanged). Parker approved `wish.sent` = "Điều ước đã lên bầu trời rồi ✨ / Your wish is up in the sky ✨". New `npm run sheet-ui-check` (finds Chrome, screenshots only with `--shots`). Sheet README explains what happens if columns are renamed and how to recover, and now says to deploy the new script version before running setup. Fixed `setup` crash on the real Sheet (`setFrozenRows` returns void in Apps Script; the test fake now mirrors that).
- 2026-10-31 — PR #30 follow-up: Dreams uses the approved sharing sentence as its single lede, selected rows gain a subtle pink highlight/check; Wish keeps its existing theme and privacy switch, aligns the dock, and shows a short 3-second sky confirmation only after a new wish. All new copy remains VI/EN in content.json. Sheet labels identify only browser-reported device family/browser (no IP, raw UA, hardware model or personal machine name); old entries stay compatible. Apps Script table-style formatting, aliases, legacy backup/migration and test/real separation added.
- 2026-10-30 — Sheet sync (draft PR, `feat/share-choices`): scene 9 ticks auto-save to Parker's Google Sheet about 1.5s after she changes them (latest list per visitor); each scene 12 wish is sent when it is made, unless the per-wish "Giữ điều ước cho riêng em" switch is on (then it is stored with `private: true` and never queued or sent). Offline sends wait in `lilj.outbox.v1` and retry on open, on reconnect, when the tab hides and every 30s after a failure; `?dev=1` rows are marked test. New copy `dreamsCopy.note`, `wish.note` (VI final, EN approved). Wish layout: note above the input, switch below (Parker chose design A: night-sky track with a pink star when sending, lavender moon when private; a small control, approved as an exception to the pastel-pink surface rule). The switch defaults to off and stays where she left it. The keep-without-writing button is removed, so a wish is required. With the keyboard open the lede hides and the note/input/switch block stays above the keyboard (`[data-keyboard-block]` in `viewport.ts`). Apps Script and Vietnamese setup guide in `tools/sheet-sync/`; unit tests in `scripts/sheet-sync.test.mjs`, end-to-end sheet checks in `story-v2-check`.
- 2026-10-30 — PR #29 round 3 (Parker review). **Theme rule: the site is pastel pink — never introduce dark purple surfaces** (panels use `--pink-panel` / `--pink-ink` / `--pink-line`). Drawer, letters modal, wish bubbles, crash card, constellation oval and Scene 4 card restyled pink. Scene 4: album stack layering restored, caption inside the card (4-line clamp), play/pause + progress sit with the dots below the card (progress fills the active dot). Titles/ledes centred with balance/pretty wrapping, one line when they fit, wider on desktop. Scene 7 "Khám phá sau" is a quiet button under the cards. Wish keyboard-open spacing fixed (inputs 16px, no zoom). Finale "yes" is a pink card with an orange heart bloom (rings + sparks; 🧡 in `finale.yesTitle`). Final-letter seal and header use the scene-1 logo (`LogoMark`). Header is one row: back + logo · centred "Chương N · title" (new copy `ui.chapterWord`; wraps to two balanced lines on ≤480px) · music + menu; VI/EN moved into the drawer header left of ×. Footer dots/hint gap 8px. `<title>` from `meta.docTitle` (MJ🧡); favicon.svg + 32/180/192/512 PNG icons from the logo. **Scenes 11/12 swapped: wish now comes before cake** (`FLOW_V5`, `FLOW_VERSION` 5; v4 saves migrate by scene id; chapter IV = wish, cake). Next copy reordered (Parker approved): `lettersCopy.next` = "Đến điều ước của em / Time for your wish", `cake.next` = "Mở phong bì nhé / Let's open the envelope"; `ui.chapterWord` approved. Wish: the confirmation line (`wish.sent`/`wish.empty`) is its own block below the input (never over the pill); with the keyboard open the form is in normal flow (no sticky) and wish stars/flight canvas are hidden. Header chapter label is always one line with an ellipsis (full text in `title`); overlap-check exempts only that element when its `text-overflow` is ellipsis. Scene 4: the "← Về ngân hà" pill is replaced by a round constellation icon button left of play/pause (aria-label from `galleryCopy.backToGalaxy`); onboarding uses a pink ripple ring + twinkling ✦ sparkle (no tap hand) and the album guide glows the new button. Scene 4 onboarding: first unseen star pulses with a tap hand and the existing `galleryCopy.orbit` bubble (~3s, re-shown once after ~5s idle); first album open shows faint swipe arrows and a glowing back button; dismissed forever on first interaction (`lilj.guide.galleryOrbit.v1`, `lilj.guide.galleryAlbum.v1`); no animation under reduced motion.
- 2026-10-30 — Scene 4 slideshow: an opened album auto-advances every 4s with a thin progress bar and a play/pause button (new copy `galleryCopy.autoPlay` / `autoPause`); it pauses on mouse hover, while fullscreen is open, and stops after a manual swipe/tap; after the last photo it moves to the next era with the arrival transition; off by default under reduced motion.
- 2026-10-30 — PR #29 polish 2: Scene 4 galaxy zoom smoothed (galaxy dives/rises with fade+blur and feathered canvas edge, no black rectangle; photo card fades in; reduced motion skips it) and themed thin scrollbars remove the right-edge black bar. Scene 10 letters open as a centred modal (≤560px) on desktop, sheet on mobile. Scene 12 wishes show comic speech bubbles (4 random shapes, larger star area): anchored + auto-hide on desktop, centred popup with backdrop on mobile. Error screen restyled as a glass card with reload button (new copy `ui.crashReload`). Scene 15 Scorpio constellation (THIÊN YẾT) sits on a night-sky medallion with glowing gold twinkling stars and a legible label.
- 2026-10-30 — PR #29 polish: Scene 4 photo card restyled (dark-lilac glass frame, soft pink glow, caption in a padded glass panel, no edge clipping; wording unchanged). Journey menu is now the same glass drawer (header-button styling, pill scenes, glowing current pill) on mobile and desktop: slides from the right, min(88vw, 420px), safe-area margins, internal scroll, page scroll locked while open.
- 2026-10-30 — Desktop (>768px) Journey menu is now a right-side dark drawer (full height, backdrop/Esc/close button, slide respecting reduced motion, themed scrollbar); mobile sheet kept (scene text contrast fixed). Reset (↻) moved from header into the Journey menu and shown only after all 15 scenes are seen. Desktop footer is full width; header and footer side padding 20px (keeps Continue within 20px of the right edge for overlap-check). New copy: `ui.journeyClose`.
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
- Round 3 (cont.): scene 3 caption/progress and scene 5 move count restyled as pink chips/pills (layout only, no wording change). Scene 4 album: next/prev photos preloaded + decoded (same srcset/sizes) on album open and every slide; every stack card is eager-loaded and sits on a blurred Cloudinary placeholder (c_limit,w_40,e_blur) with a pink shimmer, and the photo fades in only after `img.decode()`, so there is no white gap between slides (verified under slow-3G throttling).
- Round 3 copy (approved by Parker): tightened VI+EN text for scene 3 (birth title, lede, four note bodies, hint VI) and scene 5 (memory title VI, lede, win VI, five match lines, hint). Facts unchanged (16:45, 18/11/2002, Hà Đông Hà Nội, 01/07/2026).
- Round 4: all `.lede` subtitles smaller (min 13.5px) and italic; page background shifted from deep purple (#56406f) to a rosier dusk (#7a4c72) with pink glows; scene 5 card backs use the scene 1 LogoMark on a light pink glass face (monogram text removed); scene 6 quiz wrapped in one pink glass card with a pill counter and filled letter badges; scene 7 scratch cards compact 2-column (3 on desktop) light pink cards (canvas label 15–17px). No copy changes.
- Round 5: reverted the round-4 page background change (back to --bg #56406f and the original glows/vignette, all scenes). Scene 5 card backs keep the light pink glass + LogoMark; the logo's monogram line and dots are now deep rose (#9c3f6c) with a thin white halo so they read clearly on the pink moon.

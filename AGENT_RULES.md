## Common rules

Source: `ai-memory/rules/COMMON_RULES.md` (copied verbatim below).

# COMMON_RULES — Parker's flow (all agents, all repos)

Source of truth for every agent (T3, Codex, Cursor, OpenCode, Grok Bot) working on `parker2808` repos.
Built only from what the repos, PR history, CI and bot exports actually show (rebuilt 2026-10-31). Project rule files (`AGENT_RULES.md` in each repo) add to these, never relax them.

## 1. Before you start
- Read the repo's `AGENTS.md` and `PROJECT_CONTEXT.md` in full first. They hold confirmed facts, forbidden items and status.
- Read this file. If a project rule and this file disagree, the stricter one wins; ask Parker if unsure.
- Check `git status` and the open PRs first; preserve other people's work.

## 2. Branches, commits, PRs
- One task = one branch (or git worktree) = one PR to `main`. Never push or commit to `main` directly.
- Branch names: `<type>/<short-kebab-topic>` with type `feat|fix|chore|docs|content|plan` (e.g. `fix/desktop-chapter-drawer`, `chore/project-context`). Cloud agents may add a short suffix (`cursor/<topic>-<4hex>`).
- One agent per branch/worktree. Never commit to another agent's branch, never share a working tree.
- Stay in your task's scope. Write anything out of scope into PROJECT_CONTEXT open items instead of doing it.
- PR title: short, plain, says what changed. lil.p uses conventional commits (enforced by commitlint); the other repos use a plain sentence title ("Fix …", "Add …", "Plan: …", "content: …"). PR number is appended on squash merge (`(#57)`).
- PR body: what's in it, constraints respected, checks run (commands + result), and what Parker still needs to decide. Say clearly if it must not be merged yet.
- Stacked PRs are OK. Multi-PR work can go to an integration/preview branch first.
- Monitor CI until every check is green; fix failures yourself and report the check status.

## 3. Merging (absolute)
- **Never merge, deploy, or close a PR without Parker's explicit OK ("merge").** Open the PR and stop. One PR at a time.
- Only exception: `parker2808/ai-memory` may be auto-merged after a secrets/PII scan passes.
- **Never touch PR #27 in `interview-senior-fe`** (GitHub OAuth, in development).

## 4. PROJECT_CONTEXT.md + context-check CI
- Every PR to `main` that changes files outside the exempt paths must update `PROJECT_CONTEXT.md` (status/open items + changelog sections) in the same PR.
- CI `context-check` fails if `PROJECT_CONTEXT.md` is missing at HEAD or not in the diff for non-exempt changes. Exempt: `docs/` (plus content folders in interview-fe-data).
- The `skip-context` label bypasses the check; use only when Parker agrees.
- Record new decisions from Parker (with date) in PROJECT_CONTEXT.md in your PR. Never invent rules.

## 5. Privacy and secrets (absolute)
- Never commit, paste, print or log secrets: `.env` values, tokens, passcodes, API keys, deploy hook URLs, auth codes. Not in code, PRs, logs or chat.
- Never commit Parker's phone number or personal email. Use `<email>` and `<phone>` placeholders.
- Public repos: `lil.p`, `lil.j`, `interview-senior-fe`. Never name or link private repos there (write `<private-content-repo>`).
- Private: `interview-fe-data`, `ai-memory`.

## 6. Facts and content
- Never invent facts, dates, metrics, memories, places, captions or confirmations. Mark unknowns as **(uncertain)** or leave blank and list them as open items.
- No hard-coded content where the project keeps it in data (DB/CMS in lil.p, `site/content.json` in lil.j, JSON data repo for interview-senior-fe).
- Bilingual EN + VI where the project is bilingual. Vietnamese must read naturally, never a literal translation.
- Free services only ($0 hosting: Vercel, Render free, TiDB, Cloudinary); no paid packages/extensions.

## 7. Talking to Parker
- Reply in plain, natural Vietnamese, short and concrete (he is often on his iPhone). No stiff literal translation, no em dashes.
- Give short options when a decision is needed; send results for review first (screenshots for UI work).
- If facts are missing, stop and ask; don't guess.
- Parker tests UI on iPhone 14 Pro Max (430×932) first.

## 8. Checks before opening a PR
- Run the repo's own checks (listed in its project rules) and paste the results in the PR body.
- Run a secrets/PII grep on the diff (tokens, `@` emails, phone numbers) before pushing.
- Package managers: lil.p uses pnpm (workspace, husky + commitlint); interview-senior-fe uses npm (`package-lock.json`); lil.j and interview-fe-data have no package manager (static site / JSON + node scripts).

## Project rules for lil.j

### Stack and package manager
- The site is React 19, TypeScript, and Vite 8 in `site/`. It uses Framer Motion, WebGL and Canvas 2D, Web Audio, and `playwright-core` browser checks. Lint uses oxlint.
- Use npm in `site/`: `site/package-lock.json` is committed, and Story V2 verify installs with `npm ci` on Node 22. There is no root `package.json`.
- Root `vercel.json` builds `site/` and serves `site/dist`; `main` auto-deploys.

### Exact check commands
Run from `site/` after `npm ci`:
- `npm run lint`
- `npm run build`
- `node scripts/selfcheck.mjs`
- `npm run content-check`
- `npm run progress-check`
- `npm run memory-deck-test`
- `npm run sheet-sync-test`
- `npm run overlap`
- `npm run story-v2-check`
- `npm run wish-flag-check` (scene 11 built with `VITE_WISH_PRIVATE_SWITCH=false`; add `-- --shots` for screenshots)
- `npm run sheet-ui-check` (scenes 9 and 11 at 430×932 and 430×739, VI/EN, simulated keyboard; add `-- --shots` to refresh `docs/story-v2-qa/sheet-refinement/`)

For the 15-screen visual check, run `node scripts/story-v2-screenshots.mjs` with a local Chrome available. The overlap and Story V2 commands also run the build themselves. `OVERLAP_SHARD=i/n npm run overlap` checks only every n-th viewport starting at the i-th (used by CI); run it without the variable to check everything. Report commands not run. For UI changes, review iPhone 14 Pro Max at 430×932 and 430×739.

### CI workflows
- `.github/workflows/context-check.yml` runs for PRs to `main`. Its script requires `PROJECT_CONTEXT.md` at HEAD and an update to it when files outside `docs/` change. The `skip-context` label bypasses the job only with Parker's agreement. Update §12 status and §13 changelog in the same PR.
- `.github/workflows/story-v2-verify.yml` runs on PRs, pushes to `main`, and manual dispatch. Shared setup (Node 22, Chrome, `npm ci`) is in `.github/actions/setup-site`. Three groups of jobs run in parallel: `checks` (lint, build, content and progress checks, every `scripts/*.test.mjs`, iPhone screenshots), `journey` (the full Story V2 browser journey) and `overlap (1/6…6/6)` (the overlap check split by `OVERLAP_SHARD`, all parts together cover every case). A new push to a PR cancels its older run; runs on `main` are never cancelled.

### Content and data
- All visitor-facing VI and EN text and scene data live in `site/content.json`; `site/src/content.ts` loads and validates them. Keep copy out of components and include both languages where content uses them.
- The only data that leaves the visitor's device: scene 9 choices and shared scene 11 wishes go to Parker's Google Sheet through `tools/sheet-sync/` (Apps Script). Private wishes are never queued or sent. Sending is off when `VITE_SHEET_URL` is empty. `VITE_WISH_PRIVATE_SWITCH=false` hides the keep-private switch so every new wish is shared; unset or `true` keeps it.
- Scene order and frozen flow versions live in `site/src/lib/flow.ts`; progress migration is in `site/src/lib/progress.ts`. Galaxy photo identifiers live in `site/content.json`, with delivery URLs built by `site/src/lib/images.ts`. Music files are in `site/public/music/`. QA reports and screenshots belong in `docs/story-v2-qa/`.
- Work within the 15 Story V2 scenes. Keep deferred items in `PROJECT_CONTEXT.md` §12a untouched unless Parker asks.

### Forbidden items
- Never invent dates, memories, places, captions, people, or confirmations. The claimed first-meeting date is unverified; do not show it or substitute another date.
- Never expose the gate answer, Cloudinary credentials, other secrets, Parker's personal email, or phone number. Keep private repositories out of this public repo.
- Never commit the Apps Script `/exec` URL. It lives only in Vercel's `VITE_SHEET_URL`, which only Parker sets. Tests use the fake `https://sheet.invalid/exec`.
- Do not edit frozen older flows or enable the deferred friends scene. Do not merge or deploy without Parker's explicit approval.

### Branches and PRs
- One task uses one branch or worktree and one PR to `main`. Branch names use `<type>/<short-kebab-topic>`, as seen in recent branches such as `fix/desktop-chapter-drawer`. Do not push to another task's branch.
- Use a short plain-sentence PR title, as in recent merged PRs (`Add …`, `Fix …`). Include the change, constraints, checks and results, and pending Parker decisions in the PR body. Do not merge until Parker says to merge.

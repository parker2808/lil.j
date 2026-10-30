Copied from <private-memory-repo> rules/COMMON_RULES.md, 2026-10-31; keep in sync

# COMMON_RULES — Parker's flow (all agents, all repos)

Source of truth for every agent (T3, Codex, Cursor, OpenCode, Grok Bot) working on `parker2808` repos.
Built only from what the repos, PR history and bot exports actually show (2026-10-31). Project rules may add to these, never relax them.

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
- Only exception: `parker2808/<private-memory-repo>` may be auto-merged after a secrets/PII scan passes.
- **Never touch PR #27 in `interview-senior-fe`** (GitHub OAuth, in development).

## 4. PROJECT_CONTEXT.md + context-check CI
- Every PR to `main` that changes files outside the exempt paths must update `PROJECT_CONTEXT.md` (status/open items + changelog sections) in the same PR.
- CI `context-check` fails if `PROJECT_CONTEXT.md` is missing at HEAD or not in the diff for non-exempt changes. Exempt: `docs/` (plus content folders in <private-content-repo>).
- The `skip-context` label bypasses the check; use only when Parker agrees.
- Record new decisions from Parker (with date) in PROJECT_CONTEXT.md in your PR. Never invent rules.

## 5. Privacy and secrets (absolute)
- Never commit, paste, print or log secrets: `.env` values, tokens, passcodes, API keys, deploy hook URLs, auth codes. Not in code, PRs, logs or chat.
- Never commit Parker's phone number or personal email. Use `<email>` and `<phone>` placeholders.
- Public repos: `lil.p`, `lil.j`, `interview-senior-fe`. Never name or link private repos there (write `<private-content-repo>`).
- Private: `<private-content-repo>`, `<private-memory-repo>`.

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

## Project rules — lil.j
- This is the public MJ Universe repository. `main` auto-deploys to Vercel; never expose the gate password or secrets.
- Never invent dates, memories, places or captions. The claimed first-meeting date `2022-11-18` is unverified: never show it to visitors or substitute another date.
- Keep visitor text in both VI and EN in `site/content.json`. Edit only the keys owned by the task; do not overwrite a whole shared file or array.
- Work only on the 15 live Story V2 scenes unless Parker asks otherwise. `site/src/lib/flow.ts` currently uses `FLOW_V5` (`FLOW_VERSION` 5), with Wish before Cake; `friends` is off the path. Skip deferred work in `PROJECT_CONTEXT.md` §12a.
- Test UI first at iPhone 14 Pro Max sizes 430×932 and 430×739, and send screenshots for review.
- Follow the pastel pink surface theme (`--pink-panel`, `--pink-ink`, `--pink-line`); avoid dark purple surfaces. Use the established fonts and restrained italics.
- The React, TypeScript and Vite app is in `site/`. Run relevant checks there: `npm run lint` (oxlint), `npm run build`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run memory-deck-test`, `npm run story-v2-check`, and `npm run overlap` for UI changes. Report checks not run.
- Update `PROJECT_CONTEXT.md` §12 status/open items and §13 changelog in each non-exempt PR to `main`. The repo's `context-check` exempts docs-only changes.

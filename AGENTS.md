# AGENTS.md — lil.j rules

Read `PROJECT_CONTEXT.md` in full before doing anything. Read `docs/LESSONS.md` before starting; append one line per new lesson.

## Start and scope
- Work in a T3 worktree on a task branch, never in the main checkout or on `main`/`master`. One task = one branch/worktree = one PR.
- Check `git status` and the diff first. Preserve other agents' work; edit only files and keys in your task's scope.
- Small tasks: skip Graphify; find code with `rg` and open only needed ranges. Big tasks: read `graphify-out/GRAPH_REPORT.md`, query `graphify explain`/`graphify path`, refresh with `graphify update .` after code changes.
- Token budget: never read lockfiles, `site/public/**` media or `site/content.json` in full; use `rg`/line ranges and `tail -n 80` for long command output. See `.cursorignore`.
- Small tasks can proceed directly. For big tasks, write a plan (20 lines or fewer) and a spec in `docs/specs/` before coding; work in checked steps, then hand off the plan and diff for review.
- Use `~/ai-tools/t3-run.sh` watchdog for agent work so model failures or quota problems are reported.
- Do not add dependencies or merge outside the agreed plan. Record new decisions from Parker in `PROJECT_CONTEXT.md`; ask when facts are missing.
- Work only on the 15 Story V2 scenes unless Parker asks otherwise. Skip deferred items in `PROJECT_CONTEXT.md` §12a and leave frozen flows alone.

## Facts and content
- Never invent dates, memories, places, captions, people, or confirmations. The first-meeting date is unverified: never show it or substitute another date.
- All visitor-facing VI/EN text and scene data live in `site/content.json`, loaded by `site/src/content.ts`; do not hardcode copy in components.
- English is the intended default language, but the current code still defaults to Vietnamese.
- Never expose the gate answer, secrets, personal email or phone numbers, or the Apps Script `/exec` URL. Use `https://sheet.invalid/exec` in tests.
- Use placeholders `<private-content-repo>` and `<private-memory-repo>` for private repositories in public files.

## Stack and checks
- The site uses React 19, TypeScript, Vite 8, npm and Node 22 in `site/`; root `vercel.json` builds it. `main` auto-deploys.
- After `npm ci` in `site/`, run relevant checks: `npm run lint`, `npm run build`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run memory-deck-test`, `npm run sheet-sync-test`.
- Browser checks: `npm run overlap` (`OVERLAP_SHARD=i/n`), `npm run story-v2-check`, `npm run wish-flag-check`, `npm run sheet-ui-check`, `npm run lock-check`.
- For UI changes, test iPhone 14 Pro Max at 430×932 and 430×739 first. Put QA output in `docs/story-v2-qa/`; report checks not run.
- Flow lives in `site/src/lib/flow.ts`. `?dev=1` requires `VITE_DEV_MODE=true`; the birthday lock uses server time.
- Preserve the parallel and sharded design in `story-v2-verify.yml`: shared setup, npm cache, stale PR cancellation, timeouts, and diagnostic logs/screenshots.

## PRs
- Use a `<type>/<topic>` branch, one PR, a plain-sentence title, and merge commits. Never merge or deploy to `main`; Parker merges only after explicitly saying “merge”.
- Every PR with changes outside `docs/` must update `PROJECT_CONTEXT.md` §12 status and §13 changelog. `context-check` checks the file update, not those sections; `skip-context` bypasses it.

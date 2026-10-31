# AGENT_RULES: lil.j
Common rules and token flow live in `<private-memory-repo>`: `rules/COMMON_RULES.md`, `rules/TOKEN_FLOW.md`, templates in `templates/` (ask Parker if you lack access). This file only adds repo facts; keep it about 30 lines.

## Start (token flow)
- Read `PROJECT_CONTEXT.md`, then `graphify-out/GRAPH_REPORT.md`. Query by exact names (`graphify explain "Name"`, `graphify path "A" "B"`); open only needed line ranges, each file once. Refresh: `graphify update .` (no model calls; the report is committed, the rest of `graphify-out/` is ignored).
- Small task (copy, style, one file): do it directly. Big task: plan (≤ 20 lines) → small steps with checks → handoff → paid review of plan + diff only.
- Free agents: no work outside the plan, no new dependencies, no merging.

## Stack
- Public. React 19 + TypeScript + Vite 8 in `site/` (npm, `site/package-lock.json`, Node 22), oxlint, playwright-core checks. Root `vercel.json` builds `site/`; `main` auto-deploys.

## Checks (from `site/` after `npm ci`, paste results)
- `npm run lint`, `npm run build`, `node scripts/selfcheck.mjs`, `npm run content-check`, `npm run progress-check`, `npm run memory-deck-test`, `npm run sheet-sync-test`.
- Browser: `npm run overlap` (`OVERLAP_SHARD=i/n`), `npm run story-v2-check`, `npm run wish-flag-check`, `npm run sheet-ui-check`, `npm run lock-check`. UI: review at 430×932 and 430×739.
- CI `story-v2-verify.yml` (checks, journey, overlap 1/6–6/6) uses `.github/actions/setup-site`; keep its parallel/sharded design.

## Where things live
- All VI/EN text and scene data: `site/content.json` (loaded by `site/src/content.ts`). Flow: `site/src/lib/flow.ts`. QA output: `docs/story-v2-qa/`.
- `?dev=1` only with `VITE_DEV_MODE=true`; the lock uses the server clock.

## Forbidden
- Never invent dates, memories, places, captions; the first-meeting date is unverified, never show it.
- Never expose the gate answer, secrets, personal email/phone, the Apps Script `/exec` URL, or private repo names. Tests use `https://sheet.invalid/exec`.
- Work only in the 15 Story V2 scenes; leave frozen flows and `PROJECT_CONTEXT.md` §12a deferred items. Never merge or deploy without Parker's OK.

## PRs
- `<type>/<topic>` branch, one PR, plain-sentence title, merge commits. Update `PROJECT_CONTEXT.md` §12 and §13 (context-check).

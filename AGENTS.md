# AGENTS.md

Read [`AGENT_RULES.md`](AGENT_RULES.md) for common and lil.j project rules.

**Read [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) in full before doing anything.** It holds every requirement, confirmed and forbidden fact, and workflow rule for this repo.

Hard rules (details in PROJECT_CONTEXT.md):
- Never invent dates, memories, places or captions. "First met 2022-11-18" is unverified: never show it, never replace it with another date.
- All visitor text (VI + EN) lives in `site/content.json`. The default language is EN (code still VI, to be switched).
- Work only on the 15 Story V2 scenes. Skip deferred items (PROJECT_CONTEXT.md §12a) unless Parker asks.
- Never expose the gate password or secrets.
- Test on iPhone 14 Pro Max (430×932 and 430×739) first.
- One task = one branch/worktree = one PR. Never merge or deploy to `main`; Parker merges only after he says "merge".
- Stay inside your task's scope; don't edit other agents' branches or keys.
- **Every PR that changes `main` must update `PROJECT_CONTEXT.md` (§12 status and §13 changelog) in the same PR.** CI (`context-check`) checks file existence at HEAD and a file update for changes outside `docs/`, not individual sections. Docs-only changes are exempt from the update requirement, and the `skip-context` label bypasses CI.

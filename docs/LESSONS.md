# Lessons

Read this before starting work. Append one dated line for each new lesson.

- 2026-10-31 — An agent edited the main checkout on `main` instead of its worktree. Always use a T3 worktree branch; the pre-commit hook now blocks commits on `main` and `master`.
- 2026-10-31 — A free model failed silently or hit quota without notice. Run agent work through `~/ai-tools/t3-run.sh` watchdog so it switches model and reports failures.
- 2026-10-31 — A big task skipped its plan/spec step. Write a plan and, for big tasks, a spec in `docs/specs/` before coding.

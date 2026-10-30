#!/usr/bin/env bash
# Fails if the diff BASE...HEAD touches files outside docs/ without touching PROJECT_CONTEXT.md.
set -euo pipefail
files=$(git diff --name-only "$1...$2")
echo "Changed files:"; echo "$files"
if echo "$files" | grep -qx 'PROJECT_CONTEXT.md'; then echo "OK: PROJECT_CONTEXT.md updated."; exit 0; fi
outside=$(echo "$files" | grep -v '^docs/' | grep -v '^$' || true)
if [ -z "$outside" ]; then echo "OK: only docs/ changed."; exit 0; fi
echo "::error::This PR changes files outside docs/ but not PROJECT_CONTEXT.md. Update its status (§12) and changelog (§13), or add the 'skip-context' label."
exit 1

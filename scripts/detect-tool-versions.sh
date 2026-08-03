#!/bin/sh
# Best-effort detection of the claude/openspec CLI versions on PATH, shared by
# the pre-commit and prepare-commit-msg hooks so the detection logic lives in
# one place. Emits `KEY=value` lines meant to be consumed via:
#   eval "$(scripts/detect-tool-versions.sh)"
# A tool that isn't found on PATH simply emits no line for it — callers must
# treat an unset variable as "unavailable", never as an error. This script
# always exits 0; a detection failure must never block a git hook.

if command -v claude >/dev/null 2>&1; then
  v=$(claude --version 2>/dev/null | awk '{print $1}')
  [ -n "$v" ] && printf 'CLAUDE_CODE_VERSION=%s\n' "$v"
fi

if command -v openspec >/dev/null 2>&1; then
  v=$(openspec --version 2>/dev/null | awk '{print $1}')
  [ -n "$v" ] && printf 'OPENSPEC_VERSION=%s\n' "$v"
fi

exit 0

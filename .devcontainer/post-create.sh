#!/usr/bin/env bash
# First-create setup for the Intention Horizon dev container.
# Runs once as the `vscode` user after the image + features are built.
set -euo pipefail

# pnpm — pinned to package.json's "packageManager" field via corepack (bundled
# with Node), so the container matches CI and local hosts.
corepack enable
corepack prepare pnpm@11.5.2 --activate

# Global CLIs used in the day-to-day workflow:
#   - Claude Code : the AI pair-programmer / agent
#   - OpenSpec    : spec-driven change workflow (`openspec new change`, etc.)
npm install -g @anthropic-ai/claude-code @fission-ai/openspec

# The node_modules named volume is created root-owned; hand it to `vscode`
# before installing so pnpm can write to it.
sudo chown "$(id -u):$(id -g)" node_modules

# Project dependencies, then the Chromium build matching the project's
# Playwright, plus its OS-level libraries (--with-deps uses sudo).
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium

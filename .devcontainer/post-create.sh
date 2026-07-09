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

# Named volumes are created root-owned; hand them to `vscode` so pnpm can
# install and the CLIs can write their credentials on login.
sudo chown "$(id -u):$(id -g)" node_modules ~/.claude ~/.config/gh

# Project dependencies, then the Chromium build matching the project's
# Playwright, plus its OS-level libraries (--with-deps uses sudo).
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium

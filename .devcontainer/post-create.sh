#!/usr/bin/env bash
# First-create setup for the Intention Horizon dev container.
# Runs once as the `vscode` user after the image + features are built.
set -euo pipefail

# Named volumes are created root-owned; hand them to `vscode` so pnpm can
# install and the CLIs can write their credentials on login.
# This must come FIRST — before corepack, which writes to ~/.cache/node.
# Mounting a volume at ~/.cache/ms-playwright makes Docker create that parent
# root-owned, which breaks every other user of ~/.cache, not just Playwright.
# /cache/pnpm-store is chowned but /cache itself is not: that store is shared
# with every other dev container, so touching it would rewrite other projects'
# data for no reason.
sudo mkdir -p /cache/pnpm-store
sudo chown "$(id -u):$(id -g)" node_modules ~/.claude ~/.config/gh \
  ~/.cache ~/.cache/ms-playwright /cache/pnpm-store

# pnpm — pinned to package.json's "packageManager" field via corepack (bundled
# with Node), so the container matches CI and local hosts.
corepack enable
corepack prepare pnpm@11.5.2 --activate

# Global CLIs used in the day-to-day workflow:
#   - Claude Code : the AI pair-programmer / agent
#   - OpenSpec    : spec-driven change workflow (`openspec new change`, etc.)
npm install -g @anthropic-ai/claude-code @fission-ai/openspec

# Point pnpm at the store shared across every dev container on this machine.
# Only pnpm's global config can do this: pnpm ignores npm_config_store_dir /
# PNPM_STORE_DIR and, as of pnpm 11, ~/.npmrc and the project .npmrc too, so
# devcontainer.json cannot set it. (pnpm-workspace.yaml would work but is
# committed, and would point the host's pnpm at /cache, absent on the host.)
# PNPM_HOME must be exported first — `pnpm config set --global` fails outright
# if its global bin dir isn't on PATH. And it must run from $HOME: until
# store-dir is set, pnpm falls back to a store on the *project's* drive whenever
# its default store is on another drive (always true here), and this command
# self-installs the pinned pnpm, which would leave a stray .pnpm-store in the
# repo. --global makes cwd irrelevant to where the setting lands.
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME/bin:$PATH"
mkdir -p "$PNPM_HOME/bin"
( cd "$HOME" && pnpm config set --global store-dir /cache/pnpm-store )

# Project dependencies, then the Chromium build matching the project's
# Playwright, plus its OS-level libraries (--with-deps uses sudo).
# CI=true: changing the store location invalidates node_modules (pnpm records
# the store it was built against in .modules.yaml), so pnpm wants to purge and
# rebuild it and asks first. postCreateCommand has no TTY, so that prompt is
# fatal (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). node_modules is a
# disposable volume this script rebuilds anyway, so purging unasked is correct.
CI=true pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium

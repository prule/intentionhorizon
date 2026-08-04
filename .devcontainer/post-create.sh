#!/usr/bin/env bash
# Provision the Intention Horizon dev container after it is built.
#
# Runs once (Dev Containers `postCreateCommand`) as the `vscode` user, with the
# repo mounted at the workspace folder (the app lives at the repo ROOT).
# Idempotent: safe to re-run via "Rebuild Container".
set -euo pipefail

echo "==> Intention Horizon dev container: provisioning"

# Named volumes are created root-owned by Docker. Hand them to `vscode` so pnpm
# can install and the CLIs can write their credentials on login.
# Mounting a volume at ~/.cache/ms-playwright makes Docker create the ~/.cache
# parent root-owned, which would break every other user of ~/.cache — so chown
# ~/.cache too. /cache/pnpm-store is chowned non-recursively and /cache itself
# is left alone: that store is shared with every other dev container, so
# recursing would be slow and rewrite other projects' data for no reason.
sudo mkdir -p node_modules ~/.claude ~/.config/gh ~/.cache/ms-playwright /cache/pnpm-store
sudo chown -R vscode:vscode node_modules ~/.claude ~/.config/gh ~/.cache ~/.cache/ms-playwright
sudo chown vscode:vscode /cache/pnpm-store

# Claude Code keeps account/onboarding state (oauthAccount, hasCompletedOnboarding,
# ...) in ~/.claude.json, a file that sits OUTSIDE ~/.claude/ — so the volume
# mounted at ~/.claude doesn't cover it and it resets on every rebuild, forcing
# a re-login even though the real OAuth token (~/.claude/.credentials.json)
# survived fine. Keep the real file inside the volume and symlink it into
# place every time this script runs. Prefer an existing volume copy over a
# freshly-created plain file (the volume copy is the one worth keeping).
claude_json_store="$HOME/.claude/.claude.json"
if [ -e "$HOME/.claude.json" ] && [ ! -L "$HOME/.claude.json" ]; then
  if [ ! -e "$claude_json_store" ]; then
    mv "$HOME/.claude.json" "$claude_json_store"
  else
    rm -f "$HOME/.claude.json"
  fi
fi
ln -sf "$claude_json_store" "$HOME/.claude.json"

# Make fnm + pnpm available in this non-interactive shell (mirrors ~/.bashrc).
export FNM_DIR="$HOME/.fnm"
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$FNM_DIR:$PNPM_HOME/bin:$PATH"
eval "$(fnm env)"

# Reconcile Node with the repo pin. `.node-version` is the source of truth; if
# it names a patch the image didn't bake in, install it now.
fnm use --install-if-missing
fnm default "$(fnm current)"

echo "==> Toolchain versions"
node --version
pnpm --version

# Point pnpm at the store shared across every dev container on this machine.
# This can only be done via pnpm's global config: pnpm ignores
# npm_config_store_dir / PNPM_STORE_DIR and, as of pnpm 11, ~/.npmrc and the
# project .npmrc too — so devcontainer.json cannot set it.
# Run it from $HOME, never the workspace: until store-dir is set, pnpm falls
# back to a store on the *project's* drive whenever its default store is on
# another drive — always true here — and this command self-installs the pinned
# pnpm, which would leave a stray .pnpm-store in the repo. --global makes cwd
# irrelevant to where the setting lands.
echo "==> Pointing pnpm at the shared store (/cache/pnpm-store)"
( cd "$HOME" && pnpm config set --global store-dir /cache/pnpm-store )

# Project dependencies (installed at the repo root).
# CI=true: changing the store location invalidates node_modules (pnpm records
# the store it was built against in .modules.yaml), so pnpm wants to purge and
# rebuild it and asks first. postCreateCommand has no TTY, so that prompt is
# fatal (ERR_PNPM_ABORTED_REMOVE_MODULES_DIR_NO_TTY). node_modules is a
# disposable volume this script rebuilds anyway, so purging unasked is correct.
echo "==> Installing dependencies"
CI=true pnpm install --frozen-lockfile

# Install the Playwright browser (+ system libs) the E2E suite drives. Keyed to
# the pinned @playwright/test, so it lands in the cached volume once.
echo "==> Installing Playwright Chromium"
pnpm exec playwright install --with-deps chromium

echo "==> Done. Start the app with:  pnpm dev   (Vite on :5173)"

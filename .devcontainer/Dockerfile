# syntax=docker/dockerfile:1
# Dev container image for Intention Horizon.
#
# Aligned with the Strength project's approach:
#   - Node via fnm (NOT corepack, which is deprecated/dropped in newer Node)
#   - pnpm installed standalone (version-independent of Node), matching the
#     `packageManager` pin in package.json
#   - OpenSpec CLI baked in (the committed .claude/skills/openspec-* skills
#     require it)
#   - System libraries Playwright's Chromium needs are added by post-create via
#     `playwright install --with-deps`, so they stay keyed to the pinned browser.
#
# Java (for Serenity BDD) and the Claude Code / GitHub CLI binaries are layered
# on as Dev Container Features in devcontainer.json, on top of this image.
#
# The Node/pnpm versions below are the authoritative repo pins. If you bump
# `.node-version` or the `packageManager` pin, update the matching ARG here and
# rebuild the container ("Dev Containers: Rebuild").

FROM mcr.microsoft.com/devcontainers/base:debian-12

# --- Pinned versions (keep in sync with the repo's version files) ------------
ARG NODE_VERSION=24.18.0
ARG PNPM_VERSION=11.5.2
# OpenSpec CLI — the committed .claude/skills/openspec-* skills require it
# (compatibility: "Requires openspec CLI"; they call `openspec list/status/
# archive --json`). Without it Claude falls back to hand-editing openspec/ files.
ARG OPENSPEC_VERSION=1.7.0

# The base image ships a non-root `vscode` user with passwordless sudo; we build
# the JS toolchain under that user so file ownership matches at runtime.
USER vscode
ENV FNM_DIR=/home/vscode/.fnm
ENV PNPM_HOME=/home/vscode/.local/share/pnpm

# --- fnm + Node --------------------------------------------------------------
# Install fnm (Fast Node Manager), then the pinned Node. `--corepack-enabled` is
# deliberately omitted — this project installs pnpm standalone instead.
RUN curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir "$FNM_DIR" --skip-shell \
    && "$FNM_DIR/fnm" install "$NODE_VERSION" \
    && "$FNM_DIR/fnm" default "$NODE_VERSION"

# --- pnpm (standalone) -------------------------------------------------------
# The standalone installer produces a self-contained pnpm that is NOT tied to a
# specific Node install (so an fnm patch bump won't lose it). Pinned to match
# package.json's `packageManager`.
RUN curl -fsSL https://get.pnpm.io/install.sh | env PNPM_VERSION="$PNPM_VERSION" SHELL=/bin/bash sh -

# --- Shell wiring ------------------------------------------------------------
# Put fnm + pnpm on PATH for every interactive shell, and make fnm auto-select
# the Node version from `.node-version` on `cd`. Written to ~/.bashrc AND
# ~/.zshrc so both shells behave identically.
RUN <<'EOF'
set -e
for shell in bash zsh; do
  rc="/home/vscode/.${shell}rc"
  touch "$rc"
  {
    echo ''
    echo '# --- Intention Horizon dev container: fnm + pnpm ---'
    echo 'export FNM_DIR="$HOME/.fnm"'
    echo 'export PNPM_HOME="$HOME/.local/share/pnpm"'
    echo 'export PATH="$FNM_DIR:$PNPM_HOME/bin:$PATH"'
    echo "eval \"\$(fnm env --use-on-cd --shell ${shell})\""
  } >> "$rc"
done
EOF

# Make the tools available to non-interactive RUN/postCreate steps too. pnpm's
# standalone installer places the executable in ${PNPM_HOME}/bin; node comes
# from fnm's default alias (post-create re-points this at the .node-version pin).
ENV PATH="${FNM_DIR}:${PNPM_HOME}/bin:/home/vscode/.fnm/aliases/default/bin:${PATH}"

# --- OpenSpec CLI ------------------------------------------------------------
# Installed globally with npm (not pnpm) on purpose: pnpm's global bin dir needs
# `pnpm setup` and isn't wired here, whereas npm drops the `openspec` binary
# straight into the fnm Node's bin, which is already on PATH above. This is a
# container-level dev tool, not an app dependency, so it's outside the project's
# "use pnpm for the app" rule. The published package is scoped; the bare
# `openspec` name on npm is an unrelated empty placeholder.
RUN npm install -g @fission-ai/openspec@${OPENSPEC_VERSION}

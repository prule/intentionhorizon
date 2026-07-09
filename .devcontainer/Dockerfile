# Intention Horizon dev container image.
#
# Base: Microsoft's TypeScript + Node 24 dev container (Debian bookworm). Ships
# git, a non-root `node` user with passwordless sudo, and the usual CLI tooling.
FROM mcr.microsoft.com/devcontainers/typescript-node:1-24-bookworm

# Java (headless JRE) — Serenity BDD report generation (`pnpm e2e:report` ->
# `serenity-bdd run`) shells out to a Java jar, so the JVM must be present.
RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
      default-jre-headless \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

# pnpm — pinned to the version in package.json's "packageManager" field so the
# container matches CI and local hosts. corepack ships with Node.
RUN corepack enable && corepack prepare pnpm@11.5.2 --activate

# Global CLIs used in the day-to-day workflow:
#   - Claude Code  : the AI pair-programmer / agent
#   - OpenSpec     : spec-driven change workflow (`openspec new change`, etc.)
RUN npm install -g @anthropic-ai/claude-code @fission-ai/openspec

# Playwright system libraries for Chromium. The browser binary itself is
# installed per-project in postCreate (it must match the project's Playwright
# version), but the OS-level deps are baked into the image here (needs root).
RUN npx --yes playwright@1.60.0 install-deps chromium

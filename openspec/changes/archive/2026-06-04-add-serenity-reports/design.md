## Context

The e2e suite runs on Serenity/JS Playwright Test. The reporter array in `playwright.config.ts` already registers `@serenity-js/playwright-test` with a reporter-process `crew` of `@serenity-js/console-reporter` (narrative) and `@serenity-js/core:ArtifactArchiver` (writes screenshots/artifacts to `target/site/serenity`). A worker-process `Photographer` captures failure screenshots.

What's missing is the Serenity BDD report: Serenity/JS emits per-scenario `*.json` files (via `SerenityBDDReporter`), and a separate Java CLI (`serenity-bdd run`) aggregates those into the browsable HTML living-documentation site. Both pieces ship in `@serenity-js/serenity-bdd`.

## Goals / Non-Goals

**Goals:**
- Produce the Serenity BDD HTML report from a local or CI run.
- Keep it opt-in/cheap: normal `npm run e2e` stays fast (list reporter); the report is one extra script.
- Reuse the existing `target/site/serenity` output directory (already git-ignored).

**Non-Goals:**
- No change to specs, Tasks, Questions, or app code.
- Not replacing the Playwright HTML report (kept for CI as-is).
- No CI pipeline redesign here — just make the report reproducible; wiring it into a published artifact is a follow-up.

## Decisions

**Register `SerenityBDDReporter` in the reporter-process `crew`, not `use.crew`.**
The reporter must aggregate events across all Playwright workers, so it belongs in the `['@serenity-js/playwright-test', { crew: [...] }]` block (reporter process) next to `ArtifactArchiver` — not in `use.crew` (per-worker). Alternative considered: worker-scope registration — rejected; it would produce fragmented per-worker JSON.

**Generate JSON always, render HTML on demand.**
Add `SerenityBDDReporter` so JSON is written every run (cheap), but render the HTML only via an explicit `e2e:report` script (`serenity-bdd run`). This keeps the default `npm run e2e` loop fast and avoids invoking Java on every run. The script chains test-run + render so failures still produce a report (use `;`/`&&` such that the report renders even when tests fail).

**Download the CLI jar via `serenity-bdd update`.**
The Java report CLI is fetched on demand. Expose it as a `postinstall` or a documented one-off (`npx serenity-bdd update`). Decision: document it and add a `serenity-bdd:update` script rather than a `postinstall` hook, so `npm install` stays offline-friendly and doesn't fail on machines without Java. CI runs the update step explicitly before rendering.

## Risks / Trade-offs

- **Java requirement** → The render step needs Java 11+. Local has Java 25. Document the prerequisite; the JSON (and Playwright/Serenity console output) still work without Java, only the HTML render needs it.
- **Jar download on first use** (~30 MB) → One-off `serenity-bdd update`; cache in CI.
- **Report renders even on test failure** → Chain with `;` (or `--continue-on-error`) so a red run still yields a diagnostic report.
- **Output dir collisions** → JSON and HTML share `target/site/serenity`; `serenity-bdd run --destination target/site/serenity` is the documented convention and matches `ArtifactArchiver`.

## Migration Plan

1. `npm i -D @serenity-js/serenity-bdd`.
2. Add `SerenityBDDReporter` to the reporter `crew` in `playwright.config.ts`.
3. Add scripts: `serenity-bdd:update` (fetch jar) and `e2e:report` (run suite, then `serenity-bdd run`).
4. Run `npm run serenity-bdd:update` once, then `npm run e2e:report`; open `target/site/serenity/index.html`.
5. Document in `e2e/README.md`. Rollback = revert; nothing in the app surface is touched.

## Open Questions

- Whether to add a `postinstall` jar download later for CI convenience — deferred; explicit step for now.

## Why

The e2e suite already runs on Serenity/JS and archives raw screenshots, but it never renders the Serenity BDD **living-documentation HTML report** — the requirements tree, per-scenario narrative (every Task/Question step), timing, and embedded failure screenshots. Today a developer only gets the console `list` output, so there is no shareable, browsable record of what the suite actually exercised.

## What Changes

- Add the `@serenity-js/serenity-bdd` dev dependency (the `SerenityBDDReporter` plus the Java report CLI).
- Register `SerenityBDDReporter` in the reporter-process `crew` in `playwright.config.ts` (it aggregates per-scenario JSON across workers), alongside the existing `ArtifactArchiver`.
- Provide a way to download the Serenity BDD CLI jar (`serenity-bdd update`) so the report can be generated on a clean machine / in CI.
- Add an `e2e:report` npm script that runs the suite and then renders the HTML report from the JSON artifacts into `target/site/serenity/`.
- Document the report workflow (generate, open, CI) in `e2e/README.md`.
- No change to the specs, Tasks, Questions, application source, or `data-testid` selectors.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `e2e-screenplay-framework`: add a requirement that the suite can produce the Serenity BDD HTML living-documentation report from the run's JSON artifacts.

## Impact

- **Dependencies**: adds `@serenity-js/serenity-bdd` to `devDependencies`; first report generation downloads a Java jar (~30 MB) via `serenity-bdd update`. Requires Java 11+ at report time (Java 25 present locally).
- **Config**: `playwright.config.ts` reporter `crew`; `package.json` scripts.
- **Artifacts**: JSON written under `target/site/serenity/` (already git-ignored); HTML report rendered to the same directory.
- **App/runtime code**: none.

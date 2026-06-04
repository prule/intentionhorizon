## 1. Dependency & CLI

- [x] 1.1 Add `@serenity-js/serenity-bdd@^3.43.2` to `devDependencies` and install.
- [x] 1.2 Add a `serenity-bdd:update` npm script that runs `serenity-bdd update` to fetch the report CLI jar; run it once to verify the download succeeds (Java 11+ required).

## 2. Reporter wiring

- [x] 2.1 Register `SerenityBDDReporter` in the reporter-process `crew` in `playwright.config.ts` (the `['@serenity-js/playwright-test', { crew: [...] }]` block), alongside the existing `ArtifactArchiver`, writing JSON to `target/site/serenity`.

## 3. Report script

- [x] 3.1 Add an `e2e:report` npm script that runs the suite and then renders the HTML via `serenity-bdd run --destination target/site/serenity`, chained so the report is produced even if tests fail.

## 4. Verify & document

- [x] 4.1 Run `npm run e2e:report`; confirm `target/site/serenity/index.html` opens and shows scenarios with Task/Question narrative and any failure screenshots.
- [x] 4.2 Confirm `npm run e2e` still uses the `list` reporter and does not invoke Java; confirm `npm run typecheck` passes and no application source or `data-testid` changed.
- [x] 4.3 Add a "Serenity BDD report" subsection to `e2e/README.md` (update the jar once, generate, open, Java prerequisite).

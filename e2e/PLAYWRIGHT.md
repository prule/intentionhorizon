# Playwright setup

How Playwright is configured for this project and how it plugs into Serenity/JS.
For running specs and flags see [README.md](./README.md); for how tests are
written see [SCREENPLAY.md](./SCREENPLAY.md). The single source of truth is
[`playwright.config.ts`](../playwright.config.ts) at the repo root.

## The stack

```
Playwright Test ── runner, browser, fixtures, trace
      │
      └── @serenity-js/playwright-test ── adds the Screenplay fixtures
                │                          (actor, page override hook)
                └── @serenity-js/web ── Click / Enter / Wait / Photographer
```

Playwright is the engine: it launches Chromium, manages parallel workers,
provides the `page` fixture, captures traces. Serenity/JS layers the Screenplay
fixtures on top — most importantly the `actor`. We type the config with
Serenity's fixture shapes so those extras are available:

```ts
export default defineConfig<SerenityFixtures, SerenityWorkerFixtures>({ ... });
```

## Config reference

Every setting in `playwright.config.ts`, and why it's set:

| Setting | Value | Why |
|---------|-------|-----|
| `testDir` | `./e2e/specs` | Only files under `specs/` are tests. `tasks.ts`, `questions.ts`, etc. are imported, never run directly. |
| `fullyParallel` | `true` | Each test gets its own browser context, so they can't interfere. Targeting one test (`-g`, or a path) removes parallelism. |
| `forbidOnly` | `true` in CI | A stray `it.only` fails the CI run instead of silently skipping the rest. |
| `retries` | `2` in CI, `0` local | Absorbs flake in CI; locally a failure fails immediately so you see it. |
| `reporter` | Serenity + list/html | See **Reporting** below. |
| `use.baseURL` | `http://localhost:5173` | `Navigate.to('/')` resolves against this. Matches the Vite dev server port. |
| `use.trace` | `on-first-retry` | First retry records a trace; open with `npx playwright show-trace`. Zero cost on passing runs. |
| `use.defaultActorName` | `Tess` | The name Serenity gives the actor injected via the `actor` fixture. |
| `use.crew` | `Photographer` | Worker-process crew; screenshots on failure (or every step with `PHOTOS=all`). |
| `projects` | `chromium` only | One browser. Add entries here to run Firefox/WebKit. |
| `webServer` | `npm run dev` | See **Dev server** below. |

## Reporting

Two reporter registrations, because Serenity's crew runs in the **reporter
process** while the Photographer runs in the **worker process**:

```ts
reporter: [
  ['@serenity-js/playwright-test', { crew: [
    '@serenity-js/console-reporter',     // prints the actor's Task/Question narrative
    '@serenity-js/serenity-bdd',         // emits per-scenario BDD JSON
    ['@serenity-js/core:ArtifactArchiver', { outputDirectory: 'target/site/serenity' }],
  ]}],
  ...(process.env.CI
    ? [['github'], ['html', { open: 'never' }]]   // CI: annotations + HTML report
    : [['list']]),                                 // local: terse list
],
```

- **console-reporter** + **list** are what you see in the terminal locally.
- **serenity-bdd** writes JSON to `target/site/serenity/`; `npm run e2e:report`
  renders it to HTML via the Java CLI (needs `serenity-bdd:update` once).
- **html** (Playwright's own report) only registers in CI; opt in locally with
  `-- --reporter=html`.
- **Photographer** lives under `use.crew`, not here — it needs the worker
  process where the browser is.

## Dev server

```ts
webServer: {
  command: 'npm run dev',           // vite
  url: 'http://localhost:5173',
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
},
```

Playwright boots Vite before the suite and waits for the URL to respond.

- **Why dev, not a build?** The deterministic seed hook is gated behind
  `import.meta.env.DEV` and stripped from production builds. No dev server →
  no seed → no deterministic tests.
- **`reuseExistingServer`** — locally, if you already have `npm run dev`
  running on 5173, Playwright reuses it (fast). CI always starts fresh.

## Isolation & determinism

Playwright gives each test a fresh browser context — isolated IndexedDB and
localStorage, so no test sees another's data. On top of that, `e2e/fixtures.ts`
**overrides Playwright's `page` fixture** to inject the per-test seed before the
app boots:

```ts
page: async ({ page, seed }, use) => {
  await page.addInitScript((s) => { window.__IH_E2E_SEED__ = s; }, seed);
  await use(page);
},
```

`addInitScript` runs before any app code, so `store.initStore()` finds the seed
on first load. This is the seam between Playwright (owns `page`) and our
Screenplay layer (the actor browses that seeded page). See SCREENPLAY.md for the
actor side.

## Scripts

| Script | Command | Use |
|--------|---------|-----|
| `npm run e2e` | `playwright test` | Headless, all specs. |
| `npm run e2e:headed` | `playwright test --headed` | Visible browser. |
| `npm run e2e:debug` | `playwright test --debug` | Playwright Inspector, step through. |
| `npm run e2e:report` | `playwright test; serenity-bdd run ...` | Run, then render the Serenity BDD HTML report (chained with `;` so it renders even on failure). |
| `npm run serenity-bdd:update` | `serenity-bdd update` | One-off: download the report CLI jar (needs Java 11+). |

Anything after `--` forwards to `playwright test` — see README.md for targeting
recipes.

## Adding a browser

`projects` has Chromium only. To add WebKit:

```ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
],
```

Every spec then runs in both. Scope a run to one with `-- --project=chromium`.

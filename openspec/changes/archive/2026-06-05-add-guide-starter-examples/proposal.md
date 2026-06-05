## Why

Fresh (real) installs start with an empty slate — no categories or intentions — so a first-time user opens the app to nothing and has to invent both a structure and content from a blank page. The user guide explains the mechanics (logging, targets, the heatmap) but never shows what a good set of categories and intentions actually looks like, leaving the hardest part — getting started — unsupported.

## What Changes

- Add a new section to the user guide (`src/screens/Guide.tsx`) that presents a small, concrete set of example categories with a few example intentions under each, so users can see a sensible starting structure.
- Examples cover a spread of intention styles: a frequent daily-ish habit, a weekly target, and a rare/long-period target, so users understand the range targets can express.
- Examples are illustrative copy only (shown inside the guide's existing `GExample` framing) — they do not auto-seed or modify the user's data.
- Keep the guide's existing tone: light, brief, "a few you genuinely care about beats a long list."

## Capabilities

### New Capabilities
- `user-guide`: The in-app user guide overlay — its content sections and the onboarding guidance it must give first-time users, including starter examples of categories and intentions.

### Modified Capabilities
<!-- None: no existing spec covers the guide's content. -->

## Impact

- `src/screens/Guide.tsx` — new example section added; presentational only.
- No data-model, store, or persistence changes; no auto-seeding of the user's real data.
- No new dependencies.

## Context

The guide (`src/screens/Guide.tsx`) is a static, presentational overlay built from small local helpers: `GBlock` (numbered section), `GExample` (framed example strip), and `ExRow` (icon + label row). Real installs seed no data, so the guide is the first thing many users meaningfully read. The mock seed in `src/data/store.ts` already encodes a tasteful starter set (Movement / Mind / Finance / Connection with intentions like "Walk 8k steps", "Meditate", "Invest"), which we can mirror as copy.

## Goals / Non-Goals

**Goals:**
- Give first-time users a concrete picture of a good category → intention structure.
- Show the spread of target cadences (frequent weekly vs. rare long-period).
- Reuse existing guide primitives so the section matches the surrounding visual language.

**Non-Goals:**
- No "seed these for me" button or auto-population of real data (could be a future change).
- No new components, dependencies, or data-model changes.
- Not an exhaustive catalog — a short, opinionated handful only.

## Decisions

- **Render examples as static copy, not seeded data.** The guide is reference material; wiring it to the store would couple presentation to persistence and risk overwriting a user's work. Mirroring the mock seed's names keeps the examples credible without importing it. Alternative considered: import the mock seed array and render it — rejected as unnecessary coupling for three or four lines of illustrative text.
- **Place the new section near the top (after the intro, around section 1).** Getting-started guidance is most useful before the mechanics; renumber the existing `GBlock` sections accordingly. Alternative: append at the end — rejected because by then the user has already hit the blank slate.
- **Group as 3–4 categories with 1–3 intentions each, annotating one frequent and one rare target inline.** Use the existing `GExample`/`ExRow` framing for visual consistency.

## Risks / Trade-offs

- [Examples drift from the actual mock seed over time] → They are illustrative, not a contract; minor wording divergence is acceptable. If we want them locked, a later change can source both from one constant.
- [Adding a section lengthens the guide] → Keep it to a compact strip; the closing "keep it light" note already sets expectations.

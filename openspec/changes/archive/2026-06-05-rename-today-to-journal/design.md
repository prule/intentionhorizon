## Context

The daily entry page (`EntryScreen`) is internally the `entry` tab. Today its user-facing name is hardcoded as "Today" in three places — the `TabBar` and `Sidebar` items in `src/components/ui.tsx`, and the `ScreenHeader title` in `src/screens/EntryScreen.tsx`. The page already supports navigating up to 7 days back via `DateNav`, with the viewed `date` held in `App` state and persisted to `localStorage` (`ih-entry-date`). Routing in `src/App.tsx` maps the internal `entry` tab to the URL slug `today` through the `TAB_TO_SLUG` / `SLUG_TO_TAB` tables, and the hash is the source of truth for the active page.

This change is a rename plus a small UI affordance. It is low-risk; it touches the routing tables but the old `#/today` hash does not need to be preserved.

## Goals / Non-Goals

**Goals:**
- Replace the user-visible "Today" label with "Journal" consistently.
- Give users a one-tap way back to the current day from any past day.

**Non-Goals:**
- Preserving the old `#/today` URL — it is dropped and falls back to the default page.
- Changing the 7-day back-navigation window or how the date is persisted.
- Renaming internal identifiers (the `entry` tab id, `EntryScreen`, `ih-entry-date`) — internal names stay to limit churn.
- Adding forward navigation beyond today.

## Decisions

### Decision: Rename the slug to `journal`
`TAB_TO_SLUG.entry` becomes `'journal'` and `SLUG_TO_TAB` becomes `{ journal: 'entry', ... }`. The old `today` slug is removed; an inbound `#/today` is now an unknown route and follows the existing fallback path (default page, normalized via `replaceState`, no spurious history entry). No special-casing is required.

- *Alternative considered:* keep the slug as `today`. Rejected — the slug is user-visible in the URL and "today" is the same misnomer we are fixing.
- *Alternative considered:* keep `#/today` as a legacy alias. Rejected — the user confirmed it does not need to be preserved, and dropping it keeps the routing tables minimal.

Note the `legacy ih-tab` upgrade path in `initialTab()` keys off internal tab ids (`entry`), not slugs, so it is unaffected.

### Decision: Return-to-today is a button inside `DateNav`
`DateNav` already computes `t = IH.today()` and the viewed `date`. The control is shown only when `!IH.sameKey(date, t)` (i.e. not today) and calls `setDate(t)`. Placing it in `DateNav` keeps all date-navigation affordances together and reuses existing helpers. Visually it sits with the prev/next chevrons; when on today it is hidden to avoid a dead control.

- *Alternative considered:* disable rather than hide on today. Either satisfies the spec; hiding is chosen to keep the header uncluttered on the common (today) case.

### Decision: Centralize the page name
Introduce a single label constant/usage so "Journal" is not re-typed in three files independently. Minimal approach: update each of the three literals; optionally export a `PAGE_LABELS` map. Given only three sites, inline updates are acceptable, but they MUST all change together.

## Risks / Trade-offs

- [E2E tests assert `#/today` or the "Today" label] → Update affected screenplay/e2e specs and selectors as part of the tasks; the `data-testid` attributes on `DateNav` are unchanged, limiting churn.
- [Stale `localStorage` from old sessions] → No risk: `ih-entry-date` stores a date key, not a slug; `ih-tab` stores the internal `entry` id, both unchanged.
- [Users with `#/today` bookmarks] → Such links now fall back to the default page (which is Journal anyway), so they still land on the right screen; only the exact hash is not preserved.

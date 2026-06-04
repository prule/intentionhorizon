## Context

`aggregate()` in `src/data/store.ts` builds buckets oldest-first (loops from
`rangeDays - 1` down to `0`, pushing labels in ascending date order). The
`TotalsBlock` in `src/screens/AnalyticsScreen.tsx` renders that array top-to-
bottom, so the newest bucket lands at the bottom. The heatmap, streaks, and CSV
export are separate code paths and are out of scope.

## Goals / Non-Goals

**Goals:**
- Totals list reads newest-first for all groupings.
- Day grouping still caps at the 10 most recent buckets.

**Non-Goals:**
- Changing `aggregate()` ordering (other call sites / future consumers may
  expect oldest-first).
- Touching heatmap, streak stats, or CSV ordering.

## Decisions

- **Reverse at the presentation layer, not in `aggregate()`.** Keep the
  data-layer contract stable and apply ordering only where it is displayed.
  Alternative — reversing inside `aggregate()` — was rejected because it changes
  a shared, unscoped helper for a view-specific concern.
- **Slice before reverse for Day grouping.** Current code does
  `data.slice(-10)` to take the 10 most recent (still ascending), then renders.
  Take the slice first, then reverse, so the cap stays "10 most recent" and the
  order becomes descending. Reversing first would slice the wrong (oldest) end.

## Risks / Trade-offs

- [Bucket index keys / animation delays computed from list index] → Indices are
  positional only (`key={i}`, stagger delay); reversing the array reindexes
  cleanly with no semantic dependence on original order.
- [Someone later assumes Totals matches heatmap left-to-right order] → Acceptable;
  the heatmap is calendar-oriented and the Totals list is a ranked recency view.

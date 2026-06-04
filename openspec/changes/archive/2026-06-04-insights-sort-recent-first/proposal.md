## Why

The Insights page Totals list renders oldest-to-newest, so the most relevant
data (the most recent day/month/year) is at the bottom of the list. Users
expect recency first, so they currently have to scroll/scan past stale buckets
to find what matters now.

## What Changes

- Reverse the Totals list display order so buckets render most-recent-first
  (newest at top, oldest at bottom) across all groupings (Day, Month, Year).
- For Day grouping, keep showing the most recent 10 buckets, but ordered
  newest-first.
- No change to the heatmap, streak stats, CSV export, or underlying
  `aggregate()` data ordering — this is a presentation-order change in the
  Totals block only.

## Capabilities

### New Capabilities
- `insights-totals`: Defines how the Insights Totals block selects, orders, and
  displays aggregated completion buckets.

### Modified Capabilities

## Impact

- `src/screens/AnalyticsScreen.tsx` — `TotalsBlock` component display order.
- No data-layer or storage changes; `aggregate()` in `src/data/store.ts`
  remains oldest-first as other consumers may rely on it.

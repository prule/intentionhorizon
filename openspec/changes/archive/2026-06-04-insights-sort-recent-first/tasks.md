## 1. Reverse Totals display order

- [x] 1.1 In `src/screens/AnalyticsScreen.tsx` `TotalsBlock`, after computing `shown` (slice for Day grouping), reverse it so the most recent bucket renders first
- [x] 1.2 Confirm Day grouping still caps at the 10 most recent buckets (slice before reverse)
- [x] 1.3 In `Heatmap`, reverse week rows at render so the newest week (and month labels) appear at top

## 2. Verify

- [x] 2.1 Run the app and check the Insights Totals list shows newest-at-top for Day, Month, and Year groupings
- [x] 2.2 Confirm heatmap, streak stats, and CSV export are unchanged

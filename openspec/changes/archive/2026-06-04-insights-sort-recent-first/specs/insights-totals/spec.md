## ADDED Requirements

### Requirement: Totals buckets display most-recent-first

The Insights Totals block SHALL display aggregated completion buckets in
descending chronological order, with the most recent bucket at the top and the
oldest bucket at the bottom, for every grouping (Day, Month, Year).

#### Scenario: Day grouping shows newest day first
- **WHEN** the user views the Totals block with grouping set to "Day"
- **THEN** today's bucket appears at the top of the list
- **AND** earlier days appear below in descending date order

#### Scenario: Month grouping shows newest month first
- **WHEN** the user views the Totals block with grouping set to "Month"
- **THEN** the most recent month appears at the top of the list
- **AND** earlier months appear below in descending order

#### Scenario: Year grouping shows newest year first
- **WHEN** the user views the Totals block with grouping set to "Year"
- **THEN** the most recent year appears at the top of the list
- **AND** earlier years appear below in descending order

### Requirement: Heatmap weeks display most-recent-first

The Insights heatmap SHALL render week rows in descending chronological order,
with the most recent week at the top and the oldest week at the bottom. Month
labels SHALL follow that order.

#### Scenario: Recent weeks at top
- **WHEN** the user views the heatmap
- **THEN** the week containing today is the top row
- **AND** month labels read newest-to-oldest down the left (e.g. May, Apr, Mar)

### Requirement: Day grouping limits to ten most recent buckets

The Insights Totals block SHALL, when grouping is "Day", display only the ten
most recent day buckets.

#### Scenario: More than ten days of history
- **WHEN** the data range contains more than ten days
- **AND** grouping is set to "Day"
- **THEN** exactly the ten most recent days are shown
- **AND** they are ordered most-recent-first

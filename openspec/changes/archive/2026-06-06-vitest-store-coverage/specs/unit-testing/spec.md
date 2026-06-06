## ADDED Requirements

### Requirement: Unit tests cover the store mutation layer

The unit suite SHALL cover the store's category and intention mutations and their side effects. It SHALL verify: adding/updating/deleting categories including reparenting orphaned intentions to uncategorized on delete; adding intentions with defaulted fields, updating, and deleting intentions including removal of their completions; toggling a completion on and off; and reordering intentions and categories.

#### Scenario: Deleting a category reparents its intentions

- **WHEN** a category with intentions is deleted
- **THEN** those intentions remain but become uncategorized (no category)

#### Scenario: Deleting an intention removes its completions

- **WHEN** an intention with completed days is deleted
- **THEN** the intention and all of its completion records are gone

#### Scenario: Toggling a completion is reversible

- **WHEN** a completion is toggled on and then off for the same intention and day
- **THEN** the day ends up not completed

### Requirement: Unit tests cover analytics computation

The unit suite SHALL cover the store's analytics functions over a known dataset: per-day completion lists, day-met evaluation, the per-day metric, aggregation by day/month/year grouping, and streak computation (current, best, and rate, including the grace for a not-yet-logged today).

#### Scenario: Aggregation groups completions by the chosen grouping

- **WHEN** aggregate is computed over a range with a given grouping
- **THEN** the returned buckets reflect the number of completions in each day/month/year bucket

#### Scenario: Current streak counts consecutive met days with today-grace

- **WHEN** the most recent days are met but today is not yet logged
- **THEN** the current streak still counts the consecutive prior met days rather than resetting to zero

### Requirement: Unit tests cover persistence and the data-source flag

The unit suite SHALL verify that the data-source flag defaults correctly and persists, and that a store mutation survives re-initialisation: after mutating and re-running store initialisation against the same in-memory IndexedDB, the hydrated state SHALL contain the mutation.

#### Scenario: Mutations survive re-initialisation

- **WHEN** the store is mutated and then re-initialised against the same database
- **THEN** the re-hydrated state contains the mutation

### Requirement: Unit tests cover consent persistence

The unit suite SHALL cover analytics-consent handling: reading a stored choice returns the valid value, returns null for an absent or invalid value, and setting a choice persists it and updates Google Consent Mode via the global gtag function.

#### Scenario: Reading consent handles valid, invalid, and absent values

- **WHEN** the stored consent value is valid, invalid, or absent
- **THEN** the read returns the valid choice, null, and null respectively

#### Scenario: Setting consent persists and updates gtag

- **WHEN** a consent choice is set
- **THEN** the choice is written to storage and the global gtag is called to update analytics consent

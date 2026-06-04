## ADDED Requirements

### Requirement: TypeScript source files

All application source under `src/` SHALL be authored in TypeScript: React components use `.tsx` and non-component modules use `.ts`. No `.jsx` or `.js` source files SHALL remain under `src/`.

#### Scenario: No JavaScript source remains

- **WHEN** the repository is inspected after migration
- **THEN** `src/` contains no `.jsx` or `.js` files
- **AND** every former source file has a corresponding `.ts` or `.tsx` file

#### Scenario: Entry point references TypeScript

- **WHEN** `index.html` loads the app
- **THEN** its module script references `src/main.tsx` (not `src/main.jsx`)

### Requirement: Project type-checks

The project SHALL provide a `typecheck` script that runs `tsc --noEmit`, and it SHALL pass with zero errors on the migrated codebase.

#### Scenario: Typecheck passes

- **WHEN** `npm run typecheck` is run
- **THEN** the TypeScript compiler reports zero errors and exits 0

### Requirement: Build gated on types

The `build` script SHALL fail when the project contains type errors.

#### Scenario: Build fails on type error

- **WHEN** a type error is introduced and `npm run build` is run
- **THEN** the command exits non-zero before producing a bundle

#### Scenario: Clean build succeeds

- **WHEN** the codebase has no type errors and `npm run build` is run
- **THEN** the command type-checks then produces the Vite bundle in `dist/`

### Requirement: Typed data store

The Dexie database in `src/data/store.ts` SHALL declare typed tables so that records and queries are checked against their schema.

#### Scenario: Store table is typed

- **WHEN** code reads or writes a record via the store
- **THEN** the record shape is checked against the declared TypeScript interface at compile time

### Requirement: Typed component contracts

React components that accept props SHALL declare those props with a TypeScript type or interface.

#### Scenario: Missing required prop is caught

- **WHEN** a component is rendered without a required prop
- **THEN** the TypeScript compiler reports an error

### Requirement: Runtime behavior unchanged

The migration SHALL NOT alter user-facing runtime behavior; only types, file extensions, and tooling change.

#### Scenario: App behaves identically

- **WHEN** the migrated app is built and run
- **THEN** all screens and interactions behave as they did before the migration

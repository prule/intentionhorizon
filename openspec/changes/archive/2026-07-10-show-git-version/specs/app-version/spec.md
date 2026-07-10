## ADDED Requirements

### Requirement: Version derived from git at build time

The build SHALL compute the app version from git history rather than from a stored version string. The version's minor number MUST be the count of commits on `main`'s first-parent history, and the major number MUST be a hand-set constant. Feature branches MUST NOT change how the version is computed.

#### Scenario: Version computed from main's commit count

- **WHEN** the app is built from a checkout whose `main` first-parent history has N commits
- **THEN** the version's minor number is N
- **AND** the version is formatted as `v<major>.<minor>` (e.g. `v1.42`)

#### Scenario: Branch build reflects main's count, not the branch's

- **WHEN** the app is built from a feature branch
- **THEN** the minor number is still computed from `main`'s first-parent history
- **AND** no version string is read from or written to the branch

### Requirement: Short commit hash injected

The build SHALL inject the short commit hash of the built `HEAD` alongside the version so a specific build can be identified.

#### Scenario: Commit hash accompanies the version

- **WHEN** the app is built at commit `a1b2c3d`
- **THEN** the short hash `a1b2c3d` is available to the app as a build-time constant
- **AND** it is displayed next to the version (e.g. `v1.42 · a1b2c3d`)

### Requirement: Build-time injection via Vite define

Version and commit-hash values SHALL be injected as build-time constants via Vite `define`, with no runtime git or filesystem access from the app bundle.

#### Scenario: Values are compile-time constants

- **WHEN** the bundle is built
- **THEN** the version and hash are baked into the JavaScript as literal constants
- **AND** the running app performs no git or network call to obtain them

### Requirement: Graceful fallback when git metadata is unavailable

When git metadata cannot be read (e.g. a shallow checkout, a non-git source tarball, or `git` not on PATH), the build SHALL NOT fail; it MUST substitute a safe development marker.

#### Scenario: Missing git falls back to a dev marker

- **WHEN** the build runs where git history or the `git` binary is unavailable
- **THEN** the build completes successfully
- **AND** the app displays a fallback marker (e.g. `dev`) instead of a git-derived version

### Requirement: Version shown on the Manage screen

The Manage screen SHALL display the version and short commit hash in an unobtrusive location.

#### Scenario: Manage screen shows the version line

- **WHEN** the user opens the Manage screen
- **THEN** a version line showing the version and short commit hash is visible

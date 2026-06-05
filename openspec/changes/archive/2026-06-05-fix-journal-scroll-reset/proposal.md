## Why

On the Journal page, toggling an intention's completion forces the scroll container to remount, jumping the view back to the top. A user scrolled to the bottom of a long list loses their place every time they complete an intention, making it hard to work through the list.

## What Changes

- Preserve the Journal page scroll position when an intention's completion is toggled (and on any other in-page data mutation).
- Remove the `key={version}` remount trigger on the Journal scroll container; rely on prop-driven re-render to refresh data without discarding the DOM (and its scroll offset).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `journal-page`: add a requirement that completing/toggling an intention preserves the current scroll position rather than resetting the view to the top.

## Impact

- `src/screens/EntryScreen.tsx` — Journal scroll container (`.ih-scroll`, currently keyed on `version`).
- Re-render path: `bump()` → `version` prop change in `src/App.tsx` still triggers re-render and fresh `IH.load()`; only the forced remount is removed.
- Side effect: the `fade-up` entry animation no longer replays on every mutation (acceptable / desirable).

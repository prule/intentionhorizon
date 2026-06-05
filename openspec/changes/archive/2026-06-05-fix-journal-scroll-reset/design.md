## Context

The Journal page (`src/screens/EntryScreen.tsx`) renders its content inside a scroll container with `className="ih-scroll fade-up"` and `key={version}`. `version` is a global counter in `App.tsx` incremented by `bump()` whenever stored data is mutated. Toggling an intention calls `IH.toggleCompletion(...)` then `onChange()` → `bump()`.

Because `key` changes, React unmounts and remounts the entire subtree on every mutation. A remounted scroll container starts at scrollTop 0, so the view jumps to the top. With a long intention list, completing an item near the bottom throws the user back to the top.

## Goals / Non-Goals

**Goals:**
- Preserve scroll position when toggling an intention's completion on the Journal page.
- Keep displayed data fresh after a mutation (counts, toggle state, mini-history).

**Non-Goals:**
- No change to the data layer or `toggleCompletion` semantics.
- No new scroll-restoration framework or state persistence across navigation.

## Decisions

**Remove `key={version}` from the `.ih-scroll` container.**
The component already receives `version` as a prop. A prop change re-renders `EntryScreen`, which re-runs `IH.load()` and recomputes all derived values — so the data refresh does not depend on the `key`. The `key` only forced a full remount, whose sole observable effects were (a) discarding scroll position and (b) replaying the `fade-up` animation. Removing it keeps the data-refresh behavior while preserving the DOM and its scroll offset.

Alternatives considered:
- *Imperatively save/restore scrollTop around the mutation* — more code, race-prone, and unnecessary since the remount is self-inflicted.
- *Keep `key` but scroll back after render* — fights the framework; visible flicker.

## Risks / Trade-offs

- [The `fade-up` entry animation stops replaying on each mutation] → Intended; the animation is meant for page entry, not per-toggle. Net UX improvement.
- [Some other consumer relies on the remount to reset child component state] → Reviewed: children (`IntentionRow`, `MiniHistory`, `DateNav`) derive their state from props/store on each render; none hold stale local state that the remount was masking. Date changes flow through `setDate`/`date` prop, not `key`.

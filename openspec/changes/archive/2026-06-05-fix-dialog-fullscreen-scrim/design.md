## Context

`Sheet` (`src/components/ui.tsx`) returns `.ih-sheet-scrim` (`position: fixed; inset: 0`) inline in the React tree. On desktop it is mounted inside `<main>` → the screen → `.ih-scroll.fade-up`. The `fade-up` class applies `animation: fadeUp 0.4s ... both` ([styles.css:182-183](src/styles.css:182)). CSS rule: any computed `transform` other than `none` makes an element the containing block for fixed-position descendants. With `fill-mode: both`, the element retains the `to` keyframe (`transform: none`), which resolves to `matrix(1, 0, 0, 1, 0, 0)` — an identity matrix that is **not** `none`. So `.ih-scroll.fade-up` becomes the containing block and the scrim is clamped to the 720px content column (observed: scrim x=316 w=720 in a 1100px viewport).

## Goals / Non-Goals

**Goals:**
- Backdrop covers the entire window (sidebar included) and blocks interaction behind it.
- Robust against any ancestor transform/filter, present or future.

**Non-Goals:**
- No redesign of the fade-up animation or other screen transitions.
- No change to dialog content, sizing, or the blur/rounded-corner styling already in place.

## Decisions

**Render `Sheet` via `ReactDOM.createPortal(..., document.body)`.**
Move the scrim out of the transformed subtree to a stable parent (`document.body`) that never carries a transform. The fixed positioning then resolves against the viewport. Chosen over the alternatives:
- *Remove `both` fill-mode / rewrite `fadeUp`* — fragile; the residual identity matrix can reappear with any transform-bearing ancestor (e.g. Guide, future animations), and dropping the fill could reintroduce a post-animation flicker.
- *Add `transform: none !important` to a wrapper* — doesn't help; the transformed element is the animated one itself, and forcing `none` would kill the animation.

`createPortal` keeps React context/state intact (event bubbling still follows the React tree), so `onClose` and focus handling are unaffected.

## Risks / Trade-offs

- [Portaled content escapes ancestor `overflow`/stacking] → Intended; `.ih-sheet-scrim` already uses `z-index: 200` and is meant to overlay everything.
- [SSR / `document` undefined] → App is a client-only Vite SPA; `document` is always available when `Sheet` renders (guarded by `if (!open) return null`).
- [Multiple sheets stacking] → Each portals independently to body; existing usage opens one at a time.

## Why

On desktop, the dialog backdrop only blurs/dims the centered content column — the left sidebar stays sharp and interactive. The `Sheet` renders inside `.ih-scroll.fade-up`, whose `fadeUp` animation uses `both` fill mode; its final `transform: none` keyframe computes to an identity matrix, which establishes a containing block. That traps the `position: fixed` scrim inside the content column instead of the viewport, so it can't cover the whole window.

## What Changes

- Render the `Sheet` backdrop and panel through a portal to `document.body` so no ancestor `transform` can confine the fixed-position scrim.
- The backdrop SHALL cover and dim the entire window — sidebar included — and block interaction with everything behind it.

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `modal-dialog`: Backdrop coverage requirement strengthened — must cover the full window regardless of where the dialog is mounted in the tree or what transforms ancestors carry.

## Impact

- `src/components/ui.tsx` — `Sheet` component (add `createPortal` from `react-dom`).
- No CSS change required; `.ih-sheet-scrim` is already `position: fixed; inset: 0`. The portal removes the transformed ancestor that was scoping it.
- Affects all `Sheet` consumers (Add Category, Add Intention).

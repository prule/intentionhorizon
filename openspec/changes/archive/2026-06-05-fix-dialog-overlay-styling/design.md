## Context

The shared `Sheet` component (`src/components/ui.tsx`) renders as a bottom sheet on mobile and a centered modal on desktop. Its styling lives in `src/styles.css`:

- `.ih-sheet-scrim` — `position: fixed; inset: 0` container.
- `.ih-sheet-bg` — `position: absolute; inset: 0; background: oklch(0.3 0.02 70 / 0.32)` — the backdrop.
- `.ih-sheet` — the panel; `border-radius: 26px 26px 0 0` mobile, `22px` all corners desktop.

Two defects:
1. The backdrop is a flat semi-transparent grey with no blur, so the screen behind stays sharp and the modal reads as flat/grey.
2. The footer (`borderTop` + `background: var(--surface)`, full width, square corners) paints over the panel's rounded bottom corners. The panel does not clip its children, so the bottom corners render square — "cut off."

## Goals / Non-Goals

**Goals:**
- Backdrop blurs the content behind the modal and fully covers the viewport.
- Dialog bottom corners stay rounded (desktop centered modal) — footer respects the panel radius.

**Non-Goals:**
- No change to dialog content, layout, sizing, or animations.
- No change to the mobile bottom-sheet's intentionally-square bottom edge (it sits flush to the screen bottom).
- No change to `Sheet`'s API or its consumers.

## Decisions

**Add `backdrop-filter: blur(...)` to `.ih-sheet-bg`.**
Apply blur plus a lighter tint so the underlying screen is obscured but visible. Include `-webkit-backdrop-filter` for Safari/WebKit (the app targets mobile). Chosen over blurring the page root because the scrim already overlays everything and isolates the effect to modal-open state.

**Add `overflow: hidden` to `.ih-sheet`.**
Clips children (notably the footer) to the panel's `border-radius`, restoring rounded bottom corners on desktop. Chosen over adding a bottom radius to the footer because the panel already has the correct radius and `overflow: hidden` fixes any child (grab handle, scroll area, footer) generically. The mobile sheet's `0 0` bottom radius is preserved, so its flush bottom is unaffected.

**Coverage.** `.ih-sheet-scrim` is `position: fixed; inset: 0` and `.ih-sheet-bg` is `absolute; inset: 0` within it — already full-viewport. The "doesn't cover the whole window" symptom is the missing blur making the tint read as a partial patch; the blur + tint fix resolves the perceived gap. No layout change needed for coverage.

## Risks / Trade-offs

- [`backdrop-filter` unsupported on very old browsers] → The existing grey tint remains as a graceful fallback; modal stays usable.
- [`overflow: hidden` could clip a child that intentionally overflows the panel] → `Sheet` has no overflowing children (scroll is internal via `.ih-scroll`); verify in preview after change.
- [Blur is GPU-cost on low-end devices] → Single short-lived overlay; negligible.

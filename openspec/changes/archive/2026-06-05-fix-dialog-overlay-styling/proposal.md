## Why

The Add Category and Add Intention dialogs render incorrectly: the backdrop is a flat grey tint instead of a blurred scrim, and the dialog's bottom corners look square/cut off because the footer paints over the rounded container. This makes the modals feel broken and unpolished.

## What Changes

- Blur the backdrop behind modal dialogs (`backdrop-filter`) so the underlying screen is obscured, replacing the current flat grey tint.
- Ensure the backdrop fully covers the viewport on all screen sizes.
- Fix the dialog's bottom corners so they stay rounded — the footer must not overpaint the rounded container edges.

## Capabilities

### New Capabilities
- `modal-dialog`: Presentation behavior of the shared bottom-sheet / centered-modal component (`Sheet`) — backdrop scrim, blur, and rounded-corner clipping.

### Modified Capabilities
<!-- none -->

## Impact

- `src/styles.css` — `.ih-sheet-scrim`, `.ih-sheet-bg`, `.ih-sheet` rules.
- Affects every consumer of the `Sheet` component in `src/components/ui.tsx` (Add Category, Add Intention, and any other sheet usage).

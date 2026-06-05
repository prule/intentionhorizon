## 1. Backdrop blur

- [x] 1.1 In `src/styles.css`, update `.ih-sheet-bg`: add `backdrop-filter: blur(...)` and `-webkit-backdrop-filter: blur(...)`, and lighten the tint so blurred content stays visible.

## 2. Rounded corners

- [x] 2.1 In `src/styles.css`, add `overflow: hidden` to `.ih-sheet` so the footer and other children respect the panel's `border-radius`.

## 3. Verify

- [x] 3.1 Run the dev server; open Add Category and Add Intention dialogs.
- [x] 3.2 Confirm backdrop is blurred and covers the full viewport.
- [x] 3.3 Confirm dialog bottom corners are rounded on desktop and the mobile sheet bottom stays flush; check no content is clipped.

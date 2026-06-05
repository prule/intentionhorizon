## 1. Portal the Sheet

- [x] 1.1 In `src/components/ui.tsx`, import `createPortal` from `react-dom`.
- [x] 1.2 In `Sheet`, wrap the returned `.ih-sheet-scrim` tree in `createPortal(..., document.body)` so it mounts outside any transformed ancestor. Keep the early `if (!open) return null`.

## 2. Verify

- [x] 2.1 Run the dev server; on a wide viewport open Add Category and Add Intention.
- [x] 2.2 Confirm the backdrop blurs and dims the whole window including the left sidebar, and the sidebar is not interactive.
- [x] 2.3 Confirm clicking the backdrop still closes the dialog and the mobile bottom sheet is unaffected.

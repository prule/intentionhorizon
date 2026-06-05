## 1. Fix

- [x] 1.1 In `src/screens/EntryScreen.tsx`, remove `key={version}` from the `.ih-scroll fade-up` root container so the scroll subtree is not remounted on every data mutation.
- [x] 1.2 Confirm `version` is still received as a prop and drives re-render (no other behavior change needed); leave `IH.load()` and derived counts as-is.

## 2. Verify

- [x] 2.1 Run the app, scroll to the bottom of a long Journal list, toggle an intention near the bottom, and confirm the scroll position does not jump to the top.
- [x] 2.2 Confirm the "X of Y intentions complete" summary and category counts still update on toggle.
- [x] 2.3 Add/extend an e2e check (see `e2e/specs/`) asserting scroll position is preserved across a completion toggle on the Journal page.

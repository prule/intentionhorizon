## 1. Routing helpers

- [x] 1.1 In `src/App.tsx`, add a bidirectional slug↔tab map (`today↔entry`, `insights↔analytics`, `manage↔settings`) plus `DEFAULT_TAB = 'entry'`
- [x] 1.2 Add `tabToHash(tab)` and `hashToTab(hash)` helpers; `hashToTab` returns null for empty/unknown hashes

## 2. URL as source of truth

- [x] 2.1 Initialize `tab` state from the current hash; if the hash is empty/unknown, seed from legacy `localStorage('ih-tab')` (mapped) or fall back to default, and normalize the URL with a replace (no history entry)
- [x] 2.2 Add a `hashchange` listener that updates `tab` state from the hash (only when the derived tab differs), so Back/Forward and external hash edits sync the page
- [x] 2.3 Change navigation so `setTab` updates `location.hash` (a normal assignment = pushes history); let the `hashchange` listener drive the state update

## 3. Cleanup

- [x] 3.1 Remove the `useEffect` that writes `ih-tab` as the page source of truth (URL now governs); keep reading `ih-tab` only as the one-time upgrade seed in 2.1
- [x] 3.2 Confirm `TabBar` and `Sidebar` still receive `tab`/`setTab` and need no internal change

## 4. Verify

- [x] 4.1 Run `npm run typecheck` clean
- [x] 4.2 Manual: navigating Today/Insights/Manage updates the URL hash; reload stays on the same page
- [x] 4.3 Manual: deep-link to `#/insights` opens Insights; empty hash and an unknown hash both land on Today (normalized, no junk Back entry)
- [x] 4.4 Manual: Back/Forward move between visited pages; legacy `ih-tab` value restores the last page on first upgrade load

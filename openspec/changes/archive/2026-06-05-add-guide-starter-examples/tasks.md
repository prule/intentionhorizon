## 1. Add starter-examples section to the guide

- [x] 1.1 In `src/screens/Guide.tsx`, add a new `GBlock` for "Starter examples" placed right after the intro paragraph (before "Log your day on Journal")
- [x] 1.2 List 3–4 example categories (e.g. Movement, Mind, Finance, Connection), each with 1–3 example intentions, using `GExample` and `ExRow` for framing
- [x] 1.3 Annotate at least one frequent target (e.g. "Walk 8k steps — 6×/week") and one rare target (e.g. "Invest — once in 30 days") so the cadence range is visible
- [x] 1.4 Keep copy concise and on-tone; reinforce "start with a few"

## 2. Renumber and tidy

- [x] 2.1 Renumber the subsequent `GBlock` `n` props so the section numbers stay sequential
- [x] 2.2 Ensure no store/data imports are added — examples are static copy only

## 3. Verify

- [x] 3.1 Run the dev server and open the guide; confirm the new section renders correctly in light and dark themes
- [x] 3.2 Confirm viewing the guide creates/changes no categories, intentions, or completions (Journal still showed "0 of 0 intentions")
- [x] 3.3 Run lint/typecheck and the e2e suite to confirm nothing regressed (typecheck clean; 13/15 e2e pass — the 2 `targets.spec.ts` failures are pre-existing on commit 515d172, unrelated to this change)

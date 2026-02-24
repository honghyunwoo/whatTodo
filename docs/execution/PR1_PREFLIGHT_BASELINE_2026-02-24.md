# PR1_PREFLIGHT_BASELINE_2026-02-24

Project: `whatTodo`  
Branch: `feature/solo-active-project-docs`  
Target PR: `PR-1 Quick Capture Top Strip`

## 1) PR-1 Objective

Improve Today quick capture flow first, without rewrite or architecture expansion.

Success intent:

1. Reduce capture friction for solo daily usage.
2. Keep change small and reversible.
3. Preserve current local-first data behavior.

## 2) Scope Lock (In/Out)

In scope:

1. Today capture UX only.
2. Copy/feedback/state improvements for quick capture.
3. Minimal layout ordering adjustment only if needed for capture prominence.

Out of scope:

1. Top3/Next1 logic implementation (PR-2).
2. Closing loop implementation (PR-3).
3. Storage schema change.
4. New dependency.
5. Backend/sync/login/payment.

## 3) File Touch Plan (Expected)

Primary candidates:

1. `components/today/TodayEntry.tsx`
2. `app/(tabs)/index.tsx` (only if capture block order or wrapping needs adjustment)

Optional small additions:

1. `components/today/*` new helper component for quick capture UI
2. Related style/constants file only when strictly needed

No-touch rule for PR-1:

1. `store/*` storage model contracts
2. backup/restore core logic
3. learning/reward engines

## 4) Risk Review

Technical risks:

1. Capture UX update can accidentally break task/diary insertion path.
2. Visual tweak can hide keyboard actions on small screens.
3. Large diff can mix behavior + style + refactor.

Process risks:

1. PR grows over 300 LOC.
2. Cross-file expansion beyond capture scope.

Mitigation:

1. Keep PR-1 under 220 LOC target.
2. No store contract change.
3. No component rename/move unless required.
4. Manual smoke scenario fixed before merge.

## 5) Data Safety / Migration Gate

Storage/schema change in PR-1: `No`.

Therefore:

1. Migration plan not required for PR-1.
2. Rollback still required (`git revert` + backup restore rehearsal).

## 6) Rollback + Backup Plan

Before merge:

1. Manual backup export from settings.
2. Keep one backup file outside app sandbox.

If regression found:

1. Revert PR commit.
2. Re-run smoke flows.
3. Restore latest valid backup JSON if state mismatch appears.

## 7) Baseline Quality (Before PR-1)

Executed on 2026-02-24:

```bash
npm run lint
npm run typecheck
npm test -- --watchAll=false
```

Results:

1. `lint`: pass with 4 warnings (0 errors)
2. `typecheck`: pass
3. `test`: 7 suites / 178 tests all pass

## 8) Baseline UX (Current Today Capture)

Current implementation source:

1. `app/(tabs)/index.tsx`
2. `components/today/TodayEntry.tsx`

Observed flow from code:

1. Default capture type is `memo`.
2. Action buttons appear after input focus (`isExpanded=true`).
3. Save action closes expanded area and dismisses keyboard.

Current friction signals:

1. Todo capture requires extra type toggle tap (`memo -> todo`).
2. Repeated quick capture is slower because keyboard is dismissed after save.
3. No explicit inline success badge/message after save in `TodayEntry`.

Proxy baseline (code-derived):

1. Memo path minimum taps: 2 (`input focus -> save`)
2. Todo path minimum taps: 3 (`select type -> input focus -> save`)
3. Capture confirmation clarity: low (implicit, not explicit)

Measurement limitation:

1. This baseline is code-derived, not stopwatch-measured on device.
2. Exact `Capture-3s Success Rate` manual trials (n=10) will be recorded right after PR-1 UI changes.

## 9) Reproduce / Validate Scenarios

Reproduce current pain:

1. Open Today tab.
2. Add todo from Today entry.
3. Immediately add second todo.
4. Observe extra taps and keyboard dismissal.

Validate PR-1 target:

1. Open Today tab.
2. Add one item quickly with visible success feedback.
3. Add second item without unnecessary re-setup.
4. Confirm created item appears in Today timeline/list.

## 10) DoD for PR-1

1. Quick capture interaction is simpler than baseline.
2. Success/empty/error feedback is explicit in capture block.
3. No regressions in task/diary creation.
4. `lint`, `typecheck`, `test` pass.
5. PR size <= 300 LOC.

## 11) Execution Update (2026-02-24)

Status: `In progress (implementation + automated checks done)`

Implemented changes:

1. `TodayEntry` default type set to `todo` for faster solo productivity capture.
2. Capture panel kept expanded by default (no extra reveal step).
3. Inline feedback state added (`saved` / `empty`).
4. Post-save keyboard context kept for repeated capture (`focus 유지`).
5. Today screen order adjusted to place capture block before learning cards.
6. Web bundling validation path stabilized by mapping `lottie-react-native` to existing web mock (`metro.config.js`), avoiding new dependency.

Changed files:

1. `components/today/TodayEntry.tsx`
2. `app/(tabs)/index.tsx`
3. `metro.config.js`

Diff size:

1. `+93 / -13` (within guardrail)

Automated verification:

```bash
npm run lint
npm run typecheck
npm test -- --watchAll=false
```

Outcome:

1. lint: pass (existing warnings only, no new errors)
2. typecheck: pass
3. tests: pass (7/7 suites, 178/178 tests)
4. web bundle: pass (`npm run web -- --port 19007`, bundled successfully)

Pending before PR finalize:

1. Manual capture trial (n=10) to record actual `Capture-3s Success Rate`.
2. Small copy polish pass if any ambiguity is found in real usage.
3. Trial runbook execution and result write-back:
   - `docs/execution/CAPTURE_3S_TRIAL_RUNBOOK.md`

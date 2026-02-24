# SPRINT_MINIGAME_PIVOT_2026-02-24

Updated: 2026-02-24  
Owner: hynoo (solo)  
Mode: whatTodo only (ACTIVE)

## A) 1-Page Diagnosis

### Problem

- 2048 is technically working but does not support daily execution behavior.
- Play loop and Today loop are disconnected, so motivation does not turn into action.
- Recent crash history on game gesture lowered trust in "quick break" feature.

### Root Cause

1. Game choice was novelty-first, not workflow-first.
2. Entry point is in Settings only, not in execution context (Today/Next1).
3. Success condition of game is "score", not "return to Next1".
4. Stability boundary was weak for gesture and state synchronization.

### Priority

1. P0: Crash-free game session (0 crash).
2. P0: Mini reset after completion must push Next1 start.
3. P1: Keep session short enough (<= 45s) to avoid productivity drift.
4. P1: No new production dependency.
5. P2: Keep old 2048 route as fallback only.

### Risks

1. Scope creep into full standalone game.
2. Added metrics/storage keys breaking backup restore.
3. UI polish work delaying behavior validation.

### Risk Control

1. One-week Top1 metric only.
2. PR split under 300 LOC.
3. Feature flag + rollback route to old `/game`.
4. Backup rehearsal after any storage key addition.

## B) This Week One Metric

- Metric: `Reset->Action Conversion`
- Definition: mini reset completion sessions where user starts Next1 within 60s
- Target: `>= 70%`
- Guardrail:
1. Average session length <= 45s
2. Crash count = 0
3. One session entry max 2 taps

## C) UX Flow / Screen / Copy / States

### Flow

1. Today `Top3/Next1` card footer -> `30초 리셋` tap.
2. Mini reset round starts immediately (countdown visible).
3. Round end -> result card.
4. Primary CTA `Next1 시작` -> returns to Today Next1 context.

### Screen Structure

1. `MiniResetIntro` (optional first visit only)
2. `MiniResetRound`
3. `MiniResetResult`

### Key Copy

- Entry label: `30초 리셋`
- Intro helper: `집중 리셋 후 바로 Next1로`
- Round title: `리셋 진행 중`
- Result title: `리셋 완료`
- Primary CTA: `Next1 시작`
- Secondary CTA: `한 번 더`
- Error copy: `리셋 실행에 실패했어요. 다시 시도해주세요`

### State Contract

1. Loading: `리셋 준비 중...`
2. Empty: Next1 없음 -> `먼저 Next1을 정해주세요`
3. Running: timer + score/meter only
4. Completed: result + one clear primary CTA
5. Error: retry + fallback to Today

## D) Issue/PR Plan + DoD + Rollback + Backup

## PR-1 (<= 180 LOC): 2048 De-emphasis + Entry Contract

- Scope:
1. Settings mini-game card copy update
2. Today entry placeholder/CTA contract
3. Fallback route rule (`/game` 유지)
- DoD:
1. 2048 is no longer promoted as default
2. New copy is action-oriented
3. Existing navigation still works
- Rollback:
1. `git revert <commit>`
2. Restore old Settings card labels

## PR-2 (<= 280 LOC): Mini Reset Prototype Round

- Scope:
1. `/game` screen renamed conceptually to mini reset
2. 30-45s round loop
3. Result screen with `Next1 시작`
- DoD:
1. Session completes under 45s
2. No crash on rapid gestures/taps
3. Result always has one primary action
- Rollback:
1. `git revert <commit>`
2. Feature flag default off

## PR-3 (<= 260 LOC): Today Integration + Local Metric Stamp

- Scope:
1. Today card entry button
2. Session completion + next1 start timestamps
3. Local metric helper function
- DoD:
1. One-tap entry from Today
2. Conversion metric calculable locally
3. No regression in existing Top3/Next1 flow
- Rollback:
1. `git revert <commit>`
2. Ignore metric keys gracefully when missing

## PR-4 (<= 220 LOC): Backup Compatibility + Stability QA

- Scope:
1. Backup import/export compatibility check for new keys
2. Rehydrate stability check
3. Release checklist update
- DoD:
1. Backup restore passes with/without new keys
2. Android emulator smoke test passes
3. No P0 crash in logs
- Rollback:
1. `git revert <commit>`
2. Restore latest known-good JSON backup

## Reproduce / Validate / Commands

### Reproduce (current pain)

1. Open Settings -> Mini Game.
2. Play old game for 30-60s.
3. Return to Today and observe weak action continuation.

### Validate (target)

1. Open Today and tap `30초 리셋`.
2. Complete one round.
3. Tap `Next1 시작`.
4. Verify Next1 starts in <= 60s.
5. Reopen app and verify state persists.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

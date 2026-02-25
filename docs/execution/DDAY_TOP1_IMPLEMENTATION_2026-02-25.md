# DDAY_TOP1_IMPLEMENTATION_2026-02-25

Date: 2026-02-25  
Scope: Wedding D-day registration in Settings + instant D-day visibility on Today header

## A) One-Page Diagnosis

### Problem

1. Critical personal date (wedding) is not visible on Today.
2. User has to remember mentally or use another app.
3. Core daily cockpit misses one high-value, low-effort utility.

### Root Cause

1. No user-state field for important date.
2. No date picker flow for critical date in Settings.
3. Today header has no D-day module.

### Priority

1. P0: Register/clear wedding date safely.
2. P0: Show D-day in Today header without extra taps.
3. P1: Include date state in backup/restore.

### Risks

1. Timezone/day-boundary mismatch in D-day calculation.
2. Restore without user store rehydrate can show stale value.
3. UI crowding in Today header.

### Risk Controls

1. Compute D-day with local-date midnight normalization.
2. Add backup key + rehydrate for user store.
3. Keep one compact card under greeting line.

## B) This Week One Metric

Metric: `Critical Date Recall Time`  
Definition: app open -> wedding D-day recognition time on Today.  
Target: <= 2 seconds (manual 10/10 success).

## C) UX Flow + Copy + States

### Flow

1. Settings -> `중요한 날짜` section.
2. Tap `결혼 날짜 설정`.
3. Pick date, save automatically.
4. Return to Today -> see `결혼 D-xxx` immediately.

### Copy

1. Section title: `중요한 날짜`
2. Field label: `결혼 날짜`
3. Empty helper: `아직 설정되지 않았어요`
4. Header badge: `결혼 D-128` / `결혼 D-day`

### States

1. Loading: existing screen-level load behavior.
2. Empty: show setup CTA.
3. Active: show date + D-day + clear button.
4. Error: reuse alert fallback.

## D) Issue/PR Plan + DoD + Rollback

### Issue 1 / PR-1: D-day Data Model + Backup Safety

Scope:

1. Add wedding date state/actions in `userStore`.
2. Add date utility for D-day calculation.
3. Include user store key in backup/restore + rehydrate.

DoD:

1. Wedding date persists after app restart.
2. Backup export/restore keeps wedding date.
3. Legacy backup (without user key) restores without crash.

Rollback:

1. `git revert` PR commit.
2. Optional state ignored if absent.

### Issue 2 / PR-2: Settings + Today Header UX

Scope:

1. Add wedding date picker and clear action in Settings.
2. Add compact D-day card in Today header.

DoD:

1. Set/clear works on device.
2. Today shows D-day instantly after set.
3. Header remains readable on small screens.

Rollback:

1. `git revert` PR commit.
2. Existing header layout remains intact.

## Reproduce Steps

1. Open Today.
2. Verify no wedding D-day is visible.

## Validate Steps

1. Set wedding date in Settings.
2. Return to Today and confirm `결혼 D-xxx` appears.
3. Restart app and confirm value persists.
4. Export/restore backup and confirm value remains.

## Commands

```bash
npm run lint
npm run typecheck
npm test -- --runInBand __tests__/utils/backup.test.ts
```

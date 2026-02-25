# TODO_CHECK_HISTORY_IMPLEMENTATION_2026-02-25

Date: 2026-02-25  
Scope: Todo check toggle + date-based "what I did" history accuracy

## A) One-Page Diagnosis

### Problem

1. Date history does not always match real execution date.
2. Some views still derive todo history from `createdAt` or `dueDate` only.
3. User intent is "what I actually did on that day", so completion date must be first-class.

### Root Cause

1. Day aggregation in `utils/day.ts` filters todo by `dueDate` only.
2. Records tab date for completed todo can use `createdAt`.
3. Day timeline supports viewing, but quick check-toggle convenience is weak.

### Priority

1. P0: Make completion date (`completedAt`) drive history.
2. P0: Keep quick check action available where user reviews a day.
3. P1: Keep due-date context without breaking existing behavior.

### Risks

1. Changing day aggregation can shift calendar/day counts unexpectedly.
2. Duplicate inclusion risk when `dueDate` and `completedAt` are same day.
3. Regression in timeline ordering if date source is inconsistent.

### Risk Controls

1. Use unique task id dedupe for day aggregation.
2. Add tests for `completedAt`-based history and fallback logic.
3. Run lint/typecheck/test before merge and manual emulator smoke.

## B) This Week One Metric

Metric: `History Recall Accuracy`  
Definition: Completed todo appears on the correct day (`completedAt` date) in Day/Records views.  
Target: `100%` for manual smoke scenarios.

## C) UX Flow + Screen Copy + States

### Flow

1. User checks a todo.
2. System stores `completedAt` immediately.
3. User opens date view or records list.
4. Completed todo is shown on completion date (not only created/due date).

### Screen behavior

1. Day screen timeline:
   - Completed section shows tasks done that day.
   - Check icon is tappable for quick toggle.
2. Records tab:
   - Completed todo record date uses `completedAt` first.

### Microcopy and states

1. Loading: keep existing screen loading copy (no new spinner added).
2. Empty: keep existing "이 날짜에 할 일이 없어요" copy.
3. Error: no new error channel; rely on existing error boundary behavior.

## D) Issue/PR Plan + DoD + Rollback/Backup

### Issue 1 / PR-1: History Date Accuracy for Todo

Scope:

1. `utils/day.ts` day aggregation uses `completedAt` and `dueDate` with dedupe.
2. `app/(tabs)/records.tsx` completed todo record date uses `completedAt` first.

DoD:

1. Completed todo appears under completion date in Day view.
2. Records tab date for completed todo aligns with completion date.
3. Existing unfinished due-date todo still visible on its due date.

Rollback:

1. `git revert` PR commit.
2. No storage schema change, so no data migration rollback required.

### Issue 2 / PR-2: Day Timeline Quick Check Convenience

Scope:

1. Make check icon on Day timeline tappable (toggle complete).

DoD:

1. Tap check toggles completion state without entering detail page.
2. Timeline sections update immediately.

Rollback:

1. `git revert` PR commit.
2. Keep previous read-only check icon behavior.

## Reproduce Steps (Before)

1. Create todo with due date yesterday.
2. Complete it today.
3. Open today Day view and Records tab.
4. Observe mismatch risk (record can appear by created/due date behavior).

## Validate Steps (After)

1. Repeat same scenario.
2. Confirm task appears on completion date in Day + Records.
3. Toggle check in Day timeline and confirm immediate section update.

## Required Commands

```bash
npm run lint
npm run typecheck
npm test -- --runInBand __tests__/utils/day.test.ts __tests__/store/taskStore.test.ts
```

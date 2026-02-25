# RELEASE_CHECKLIST

Updated: 2026-02-24  
Product mode: Solo, local-first, one ACTIVE project

## 1) Branch and scope gate

1. Confirm work is on feature branch, not `main`.
2. Confirm PR size <= 300 LOC. Split if larger.
3. Confirm no unapproved production dependency addition.
4. Confirm no hidden rewrite scope.

## 2) Data safety gate

1. Export manual backup before release candidate.
2. Confirm backup file opens and JSON is valid.
3. Run backup restore rehearsal once.
4. If storage/schema change exists: migration + rollback + data-loss tests all complete.

## 3) Quality gate (required commands)

```bash
npm run lint
npm run typecheck
npm test
```

If any command fails: `No-Go`.

## 4) UX gate (Today core loop)

1. Capture loop: save one line item within 3 seconds.
2. Execute loop: Top3 and Next1 visible above fold.
3. Closing loop: carry-over and short reflection saved successfully.
4. Each key block has explicit loading/empty/error state copy.

## 5) Manual smoke scenarios

1. Today open -> quick capture -> save feedback.
2. Top3 select -> Next1 start -> complete.
3. End of day -> carry-over -> reflection save.
4. Settings -> backup export/import.
5. App restart -> persisted state validation.
6. If health tracker enabled: weight logs and goal value survive restore.

## 6) Go/No-Go decision

Go conditions:

1. All gates in sections 1-5 pass.
2. No unresolved P0 bug.
3. Rollback path is confirmed.

No-Go conditions:

1. Any data-loss risk remains unknown.
2. Any core loop breaks.
3. Backup rehearsal fails.
4. New schema data (e.g., weight logs) is missing after restore.

## 7) Release rollback checklist

1. Revert release commit (`git revert`).
2. Rebuild and run smoke checks.
3. Restore latest known good backup.
4. Record root cause and preventive action.


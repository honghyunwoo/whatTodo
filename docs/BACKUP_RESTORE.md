# BACKUP_RESTORE

Updated: 2026-02-24  
Scope: Solo, local-first operation for `whatTodo`

## 1) Why this matters

For solo daily use, backup/restore reliability is more important than adding features.  
If data trust breaks once, daily habit breaks.

## 2) Current system reference

Implementation anchors:

1. `utils/backup.ts`
2. `store/backupStore.ts`
3. `app/(tabs)/settings.tsx`
4. `__tests__/utils/backup.test.ts`

## 3) Backup policy (operational)

1. Auto backup stays enabled (24h cycle).
2. Manual export is required before every release candidate.
3. Weekly manual backup: every Sunday night.
4. Keep at least 3 latest manual backup files outside app sandbox.

File naming convention:

`whatTodo-백업-YYYY-MM-DD.json`

## 4) Restore rehearsal policy

Cadence:

1. Mini rehearsal weekly.
2. Full rehearsal bi-weekly before release.

Mini rehearsal (5-10 minutes):

1. Export backup.
2. Add one test task and one test memo.
3. Import the exported backup.
4. Confirm test data is reverted.

Full rehearsal (15-20 minutes):

1. Export backup and keep file copy.
2. Create multiple test records (task, diary, learning progress).
3. Import backup.
4. Verify key screens: Today, Learn, Settings.
5. Verify no crash and expected counts.

## 5) Data-loss prevention gates

If storage/schema format changes are introduced, all below are mandatory:

1. Migration plan document.
2. Rollback plan document.
3. Data-loss prevention tests.

No exception.

## 6) Rollback playbook (incident)

Trigger examples:

1. Restore succeeds but data mismatch appears.
2. App crash after restore.
3. Key stores are empty unexpectedly.

Immediate actions:

1. Stop rollout and freeze further changes.
2. Revert suspect commit with `git revert`.
3. Re-import last known good backup JSON.
4. Run backup tests and core smoke flow.
5. Log incident summary in release notes.

## 7) Verification steps and commands

Reproduce:

1. Make sample data on Today.
2. Export backup.
3. Delete or edit sample data.
4. Restore from exported backup.

Validate:

1. Data matches backup point.
2. App remains stable after restart.
3. No critical error banners in settings.

Commands:

```bash
npm run lint
npm run typecheck
npm test -- backup.test.ts
```


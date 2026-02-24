# PROJECT_DECISION

Updated: 2026-02-24  
Owner: hynoo (solo)  
Mode: One ACTIVE project for 90 days

## 1) Current Workspace/Repo Check

- Current working repo: `C:\Users\hynoo\_archive\whatTodo`
- Git remote: `https://github.com/honghyunwoo/whatTodo.git`
- Current branch: `fix/backup-banner-loop`
- Decision: ACTIVE candidate is `whatTodo` only

## 2) One-Page Diagnosis

### Problem

You split execution context into 4 projects. Each project has value, but daily usage quality drops because attention and iteration speed are fragmented.

### Root Causes

1. Product boundary and implementation boundary were split at the same time.
2. Rebuild temptation (rewrite path) consumed cycles better spent on daily UX friction.
3. Today screen currently mixes many blocks, so the core loop (Capture -> Top3/Next1 -> Closing) is not dominant.
4. "What to improve next" was not fixed to one weekly metric.

### Priority (P0 -> P2)

1. P0: Restore daily continuity by running one ACTIVE project only.
2. P0: Make Today screen finish 80% of daily actions.
3. P1: Make backup/restore rehearsal explicit and repeatable.
4. P2: Import selective ideas from other projects only as copy/port units.

### Risks

1. Hidden rewrite scope in "small improvements".
2. Large PRs over 300 LOC causing unstable merges.
3. Storage format edits without migration/rollback tests.
4. Re-activation of frozen repos due to novelty bias.

### Risk Controls

1. One metric per week, one Top1 improvement only.
2. PR split policy: max 300 LOC/PR.
3. No storage format change without migration doc + rollback plan + data-loss test.
4. Active/Frozen decision reviewed every 2 weeks, not daily.

## 3) ACTIVE/FROZEN Classification (4 Projects)

| Project | Path | Status | Role | Why |
|---|---|---|---|---|
| whatTodo | `C:\Users\hynoo\_archive\whatTodo` | ACTIVE | Daily product | Existing integrated flow (todo + learning + journal) and fastest path to "daily use". |
| whattodo-v2 | `C:\Users\hynoo\OneDrive\바탕 화면\mymy\whattodo-v2` | FROZEN | Architecture/pattern lab | Useful design patterns and tests, but lower immediate daily utility. |
| personal-execution-os | `C:\Users\hynoo\personal-execution-os` | FROZEN | Kotlin/KMP reference | Scope fixed to schedule/diary only, useful as implementation reference. |
| english-coach | `C:\Users\hynoo\english-coach` | FROZEN | English learning reference | Strong learning pipeline, but product is intentionally separated from todo scope. |

### Import Rule from FROZEN

1. Import only by small copy/port units (pure functions, copy strings, single component pattern).
2. No cross-repo runtime dependency.
3. No branch-level merge/cherry-pick from frozen repos into active mainline.

## 4) This Week One Metric

Metric name: `Capture-3s Success Rate`  
Definition: ratio of Today quick-capture attempts completed within 3 seconds (tap input -> `저장됨`).  
Target this week: `>= 80%` on personal daily usage.

Guardrails:

1. Photo attach save success must stay at 100% (no crash/data loss).
2. No new production dependency.
3. Existing todo/learn/diary flow must remain intact.

Trial guide:

1. `docs/execution/CAPTURE_3S_TRIAL_RUNBOOK.md`
2. `docs/execution/TODO_DIARY_PHOTO_IMPLEMENTATION_2026-02-24.md`

## 5) Sprint Backlog (2 Weeks Top10)

1. Today 3초 캡처 버튼/입력 흐름 최적화.
2. Diary 사진 첨부(갤러리 선택 + 썸네일 + 삭제) 추가.
3. 백업/복원에 diary key 포함 (기존 백업 호환 유지).
4. Top3 + Next1 고정 영역 가시성 강화.
5. 일기 3줄 회고 템플릿 개선.
6. 투두 상세의 불필요 탭/입력 단순화.
7. 영어 90초 시작 버튼을 Today에 명확히 노출.
8. 자동 이월 + 내일 준비 루프 문구 정리.
9. 기록 탭 검색/필터 반응 속도 개선.
10. 릴리즈 체크리스트 기준으로 일일 스모크 검증.

### This Week Top1 Improvement

Top1: `Today Quick Capture + Diary Photo Attach` (3초 캡처 + 사진 첨부 안정성).

Execution reference:

1. `docs/execution/TODO_DIARY_PHOTO_IMPLEMENTATION_2026-02-24.md`

## 6) Verification Scenario (Reproduce/Validate)

### Reproduce current pain

1. Open Settings -> Routine Island.
2. Run one settlement session (claim + one upgrade).
3. Observe session duration and flow clarity.
4. Return to Today and check whether Next1 starts immediately.

### Validate target behavior

1. Open Today -> `섬 정산` entry.
2. Finish one settlement session in <= 90 seconds.
3. Tap `Next1 시작` from result screen.
4. Confirm Next1 starts within 60 seconds and app remains stable.

### Commands for quality checks

```bash
npm run lint
npm run typecheck
npm test
```

Manual run:

```bash
npm run android
# or
npm run web
```

## 7) Issue/PR Plan (Small + Safe)

### Issue 1 / PR-1: Diary Photo Attach (No New Dependency)

- Scope: diary entry photo attach + preview + remove + save.
- LOC target: <= 300.
- DoD:
  - User can attach at least one image from gallery.
  - Saved entry preserves photo list after app restart.
  - Existing entries without photos remain readable.
- Rollback:
  - `git revert` PR commit.
  - Optional `photos` field ignored safely.

### Issue 2 / PR-2: Backup Compatibility for Diary Key

- Scope: include diary storage key in backup export/restore and tests.
- LOC target: <= 220.
- DoD:
  - Export includes diary key.
  - Restore works with legacy backup (without diary key).
  - Restore works with new backup (with photo metadata).
- Rollback:
  - `git revert` PR commit.
  - Existing schemaVersion kept (backward compatible).

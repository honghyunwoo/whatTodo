# PROJECT_DECISION

Updated: 2026-02-25  
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

Metric name: `Critical Date Recall Time`  
Definition: app open -> wedding D-day recognition time on Today.  
Target this week: `<= 2초` (manual 10/10).

Guardrails:

1. Date calculation must remain correct across timezone/day boundary.
2. No new production dependency.
3. Existing todo/learn/diary flow must remain intact.

Trial guide:

1. `docs/execution/DDAY_TOP1_IMPLEMENTATION_2026-02-25.md`
2. `docs/execution/TODO_DIARY_PHOTO_IMPLEMENTATION_2026-02-24.md`

## 5) Sprint Backlog (2 Weeks Top10)

1. 결혼 D-day 설정 + Today 즉시 표시.
2. 백업/복원에 user key 포함 (중요 날짜 보존).
3. Today 3초 캡처 버튼/입력 흐름 최적화.
4. Top3 + Next1 고정 영역 가시성 강화.
5. 일기 3줄 회고 템플릿 개선.
6. 투두 상세의 불필요 탭/입력 단순화.
7. 영어 90초 시작 버튼을 Today에 명확히 노출.
8. 자동 이월 + 내일 준비 루프 문구 정리.
9. 기록 탭 검색/필터 반응 속도 개선.
10. 릴리즈 체크리스트 기준으로 일일 스모크 검증.

### This Week Top1 Improvement

Top1: `Wedding D-day Quick Recall` (설정 1회 + Today 즉시 확인).

Execution reference:

1. `docs/execution/DDAY_TOP1_IMPLEMENTATION_2026-02-25.md`

## 6) Verification Scenario (Reproduce/Validate)

### Reproduce current pain

1. Open Today.
2. Try to check wedding D-day.
3. Confirm no immediate information path.

### Validate target behavior

1. Open Settings -> set `결혼 날짜`.
2. Return to Today and confirm `결혼 D-xxx` appears.
3. Restart app and confirm persistence.
4. Export/import backup and confirm D-day preserved.

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

### Issue 1 / PR-1: D-day Model + Backup Safety

- Scope: `userStore` important date field + backup key/rehydrate + utility.
- LOC target: <= 220.
- DoD:
  - Wedding date persists locally.
  - Backup restore keeps wedding date.
  - Legacy backup remains compatible.
- Rollback:
  - `git revert` PR commit.
  - Optional field ignored safely.

### Issue 2 / PR-2: Settings + Today D-day UX

- Scope: date picker in settings + compact D-day card in header.
- LOC target: <= 220.
- DoD:
  - Date set/clear works.
  - Today header shows D-day immediately.
  - No layout break on small devices.
- Rollback:
  - `git revert` PR commit.

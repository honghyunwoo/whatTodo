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

Metric name: `Reset->Action Conversion`  
Definition: ratio of mini reset session completions where user starts Next1 within 60 seconds.  
Target this week: `>= 70%` on personal daily usage.

Guardrails:

1. Average mini reset session must stay <= 45 seconds.
2. Mini reset crash count must stay at 0.
3. No new production dependency.

Trial guide:

1. `docs/execution/MINIGAME_RESET_TRIAL_RUNBOOK.md`

## 5) Sprint Backlog (2 Weeks Top10)

1. Retire 2048 default entry copy and define fallback route policy.
2. Define one custom mini reset game concept tied to Next1 (not standalone puzzle loop).
3. Implement 30-45 second single-round game session.
4. Add explicit result CTA: `Next1 시작`.
5. Wire Today card entry point: `30초 리셋`.
6. Add local-only event stamps for metric calculation.
7. Define loading/empty/error states for game entry/result.
8. Add kill switch flag to disable game instantly on crash.
9. Verify backup/export/import keeps working with new game data.
10. Final copy pass to reduce taps and ambiguity.

### This Week Top1 Improvement

Top1: `2048 -> Start Dash prototype` (crash-free, short session, Next1 복귀 버튼 포함).

Execution reference:

1. `docs/execution/SPRINT_MINIGAME_PIVOT_2026-02-24.md`

## 6) Verification Scenario (Reproduce/Validate)

### Reproduce current pain

1. Open Settings -> Mini Game.
2. Enter 2048 and play for 30-60 seconds.
3. Observe crash risk and weak relevance to Today execution.
4. Return to Today and check whether Next1 starts immediately.

### Validate target behavior

1. Open Today -> `30초 리셋` entry.
2. Finish one short session in <= 45 seconds.
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

### Issue 1 / PR-1: 2048 De-emphasis + Entry Contract

- Scope: Settings/TODAY entry copy and navigation contract only.
- LOC target: <= 180.
- DoD:
  - 2048 is not the default promoted game.
  - New entry label and helper copy match Top1 metric intent.
  - Existing route fallback works when new game is disabled.
- Rollback:
  - `git revert` PR commit.
  - Keep current `/game` route available as fallback.

### Issue 2 / PR-2: Start Dash Core Session (No New Dependency)

- Scope: one screen, one round, one score model.
- LOC target: <= 280.
- DoD:
  - Session auto-ends in <= 45 seconds.
  - No app crash on rapid taps/swipes.
  - Result screen exposes one clear CTA (`Next1 시작`).
- Rollback:
  - `git revert` PR commit.
  - Feature flag defaults to off if crash is detected.

### Issue 3 / PR-3: Today Link + Metric Stamp

- Scope: Today entry chip + local metric stamping.
- LOC target: <= 260.
- DoD:
  - Today card can open mini reset in one tap.
  - Session completion and Next1 start timestamps are stored locally.
  - Metric computation script outputs conversion rate.
- Rollback:
  - `git revert` PR commit.
  - Ignore new metric keys gracefully if missing.

### Issue 4 / PR-4: Backup and Stability Hardening

- Scope: backup compatibility, test scenarios, release checklist alignment.
- LOC target: <= 220.
- DoD:
  - Export/import succeeds with and without new game metric keys.
  - Rehydrate after app restart remains stable.
  - Emulator smoke run passes (Today, Settings, Mini Game).
- Rollback:
  - `git revert` PR commit.
  - Restore from latest known-good JSON backup.

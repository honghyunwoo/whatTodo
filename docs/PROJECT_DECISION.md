# PROJECT_DECISION

Updated: 2026-02-24  
Owner: hynoo (solo)  
Mode: One ACTIVE project for 90 days

## 1) Current Workspace/Repo Check

- Current working repo: `C:\Users\hynoo\_archive\whatTodo`
- Git remote: `https://github.com/honghyunwoo/whatTodo.git`
- Current branch: `feature/solo-active-project-docs`
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
Definition: ratio of captures completed within 3 seconds from input focus to saved state.  
Target this week: `>= 80%` on personal daily usage.

Trial guide:

1. `docs/execution/CAPTURE_3S_TRIAL_RUNBOOK.md`

## 5) Sprint Backlog (2 Weeks Top10)

1. Today quick capture bar: 3-second flow, 2-tap max.
2. Top3 selector: today tasks can be pinned/unpinned.
3. Next1 focus card: one clear "start now" action.
4. Closing loop card: auto carry-over with reason tags.
5. 30-second daily review prompt (1 line + mood).
6. Timeline collapse by default, expand on demand.
7. Empty/loading/error states and copy refinement on Today.
8. Settings backup block UX cleanup (manual export/import clarity).
9. Backup rehearsal helper copy in settings.
10. Basic local event stamps for One Metric calculation.

### This Week Top1 Improvement

Top1: `Quick capture flow` on Today screen.

Execution reference:

1. `docs/execution/PR1_PREFLIGHT_BASELINE_2026-02-24.md`

## 6) Verification Scenario (Reproduce/Validate)

### Reproduce current pain

1. Open app -> Today tab.
2. Try to add one quick task while holding one concrete thought.
3. Observe tap count/time until saved feedback appears.
4. Try to identify Top3 and Next1 without scrolling.

### Validate target behavior

1. Open app -> focus quick capture instantly.
2. Add item in <= 3s and get explicit saved feedback.
3. Top3 and Next1 visible above the fold.
4. End-of-day action shows carry-over + short review prompt.

### Commands for quality checks

```bash
npm run lint
npm run typecheck
npm test
```

Manual run:

```bash
npm run start
# or
npm run web
```

## 7) Issue/PR Plan (Small + Safe)

### Issue 1 / PR-1: Quick Capture Top Strip

- Scope: Today capture entry UX only.
- LOC target: <= 220.
- DoD:
  - Input focus in one tap.
  - Save feedback visible within same screen context.
  - No regression in existing task creation.
- Rollback:
  - `git revert` PR commit.
  - Restore last manual backup JSON if user data mismatch is found.

### Issue 2 / PR-2: Top3 + Next1 Block

- Scope: Today prioritization block only.
- LOC target: <= 260.
- DoD:
  - Top3 pin/unpin works.
  - Next1 is always singular.
  - Above-fold layout verified on common phone size.
- Rollback:
  - `git revert` PR commit.
  - Top3 metadata reset script (if new storage key added).

### Issue 3 / PR-3: Closing Loop Card

- Scope: carry-over + short reflection copy.
- LOC target: <= 260.
- DoD:
  - Unfinished tasks can be carried over quickly with reason.
  - Reflection can be saved in <= 30 seconds.
  - Empty/error states are explicit.
- Rollback:
  - `git revert` PR commit.
  - Disable feature flag style guard (if introduced).

### Issue 4 / PR-4: Backup UX Hardening

- Scope: settings backup/restore experience and rehearsal guidance.
- LOC target: <= 240.
- DoD:
  - Export/import wording is unambiguous.
  - Recovery path is explicit on failure.
  - Backup tests still pass.
- Rollback:
  - `git revert` PR commit.
  - Keep latest valid backup JSON outside app before release.

# ROUTINE_ISLAND_IMPLEMENTATION_2026-02-24

Updated: 2026-02-24  
Owner: hynoo (solo)  
Status: Ready for implementation (doc-first)

## A) 1-Page Diagnosis

### Problem

- Existing 2048 flow is playable but disconnected from the real product loop (Today -> Next1).
- The game does not reliably turn motivation into execution.
- Prior crash history reduced trust in game entry.

### Root Cause

1. Reward target was score, not execution recovery.
2. Entry point was hidden in Settings, not in Today context.
3. No explicit `return-to-work` CTA after game session.
4. Game loop and app actions (todo/diary/english) were not coupled.

### Priority

1. P0: Keep app stable (zero crash in game loop).
2. P0: Force game result to lead to Next1 start.
3. P1: Preserve local-first and backup compatibility.
4. P1: Keep session short (30-90s) to avoid distraction.

### Risk

1. Scope creep into full standalone idle game.
2. Data key expansion causing restore mismatch.
3. Over-gamification harming intrinsic motivation.

### Risk Control

1. MVP lock: 4 resources + 3 crops + 3 buildings + 10 research nodes.
2. PR size control: <=300 LOC each.
3. Optional keys only in persistence + backward-safe defaults.
4. No punishment/FOMO mechanics.

## B) This Week One Metric

- Metric: `Island->Next1 Conversion`
- Definition: settlement sessions where user starts Next1 within 60s after claim
- Target: `>= 70%`
- Guardrails:
1. Mean session length <= 90s
2. Crash count = 0
3. No new production dependency

## C) UX Flow / Screen / Copy / States

### Core loop (30-90s)

1. Settlement claim
2. Daily focus choice (one of three cards)
3. One investment (upgrade/build/plant)
4. Primary CTA `Next1 시작`

### Screen IA

1. `IslandHome`
- Header: `지난 접속 후 성장`
- Primary button: `정산 받기`
- Secondary blocks: focus card, mission shortcuts

2. `SettlementResult`
- Summary: coin/seed/water/sunlight gained
- Optional: return bonus badge
- Primary CTA: `Next1 시작`
- Secondary CTA: `섬으로 돌아가기`

3. `BuildAndResearch`
- Buildings: 온실/우물/도서관
- Research: 10-node compact tree
- Single action emphasis per visit

4. `MissionBridge`
- `투두 1개 완료`
- `일기 3줄`
- `영어 90초`
- Each button jumps to corresponding tab

### Copy contract

- Entry label: `루틴 섬`
- Today chip: `섬 정산`
- Empty (no Next1): `먼저 Next1을 정해주세요`
- Claim success: `정산 완료`
- Error: `정산에 실패했어요. 다시 시도해주세요`

### State contract

1. Loading: settlement computation
2. Ready: claim available
3. Claimed: summary visible
4. Error: retry + fallback
5. Offline-only: fully functional

## D) Economy and Mapping (MVP)

### Resource model

- `seed` (Plan): todo/focus actions
- `water` (Reflect): diary actions
- `sunlight` (Learn): english actions
- `coin` (general): island production output

### App event mapping

1. `TodoCompleted` -> `seed +5`
2. `FocusMinute` -> `seed +1` per minute (cap per session)
3. `DiarySaved(lengthScore>=2)` -> `water +6`
4. `EnglishMinute` -> `sunlight +2` per minute
5. `EnglishSessionCompleted` -> bonus `sunlight +8`

### Offline soft-cap

1. 0-12h: 100%
2. 12-48h: 60%
3. 48-120h: 25%
4. 120h+: production near-zero + return bonus

### Anti-cheat (local-only)

1. `dt` clamp upper bound
2. abnormal time-jump dampening
3. higher reward weight on app events vs passive time

## E) Data Contract / Migration / Rollback

### Optional storage keys (draft)

```ts
@whattodo:island = {
  schemaVersion: 1,
  lastClaimAt: string,
  resources: { seed: number, water: number, sunlight: number, coin: number },
  buildings: { greenhouse: number, well: number, library: number },
  research: Record<string, boolean>,
  focus: { date: string, type: 'plan' | 'reflect' | 'learn' | null },
  metrics: {
    settlementCompletedAt?: string,
    next1StartedAt?: string
  }
}
```

### Migration plan

1. New key only (no destructive change on existing stores).
2. Missing island key -> initialize defaults at runtime.
3. Unknown future fields -> ignore safely.

### Rollback plan

1. Feature flag off for island entry.
2. Keep existing `/game` fallback route.
3. Revert commits with `git revert`.
4. Restore latest known-good backup JSON.

### Data-loss prevention tests

1. Restore with no island key (legacy backup) must pass.
2. Restore with island key must pass.
3. App restart after restore must preserve main stores.

## F) 2-Week Backlog Top10

1. Settings/Today entry copy and navigation contract.
2. Island state store (resources + settlement timestamps).
3. Offline settlement engine with soft-cap.
4. Daily focus card (plan/reflect/learn).
5. Crop trio and growth timers.
6. Building trio and cost curve.
7. 10-node research tree.
8. App event adapters (todo/diary/english -> resources).
9. Settlement result -> Next1 CTA integration.
10. Backup/restore tests and rehearsal update.

## G) Issue/PR Plan + DoD + Rollback

### PR-1 (<=180 LOC): Entry + copy contract

- Scope: Settings/TODAY entry only.
- DoD:
1. `루틴 섬` entry visible.
2. Today `섬 정산` chip visible.
3. `/game` fallback intact.
- Rollback:
1. `git revert <commit>`

### PR-2 (<=300 LOC): Island settlement core

- Scope: store + settlement math + result view.
- DoD:
1. Claim works with soft-cap.
2. Session ends <=90s.
3. Primary CTA `Next1 시작` present.
- Rollback:
1. feature flag off
2. `git revert <commit>`

### PR-3 (<=300 LOC): App events integration

- Scope: todo/diary/english mappings.
- DoD:
1. Resource increments deterministic.
2. Conversion timestamps captured.
3. No regression in existing tabs.
- Rollback:
1. disable event bridge flag
2. `git revert <commit>`

### PR-4 (<=240 LOC): Backup compatibility and QA

- Scope: backup tests + rehearsal + release checklist.
- DoD:
1. legacy/new backup both restore.
2. emulator + real-device smoke pass.
3. no critical error in logs.
- Rollback:
1. `git revert <commit>`
2. restore known-good JSON

## H) Reproduce / Validate / Commands

### Reproduce (before)

1. Open game route.
2. Play without app-action coupling.
3. Return to Today and observe weak Next1 conversion.

### Validate (target)

1. Open Today -> `섬 정산`.
2. Claim settlement and apply one investment.
3. Tap `Next1 시작`.
4. Confirm Next1 starts <=60s.
5. Restart app and confirm persistence.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

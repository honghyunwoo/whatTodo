# UX_SPEC_TODAY

Updated: 2026-02-24  
Scope: `app/(tabs)/index.tsx` and Today related components  
Goal: Make Today screen the single daily cockpit

## 1) Product Goal for Today

Today screen must complete 80% of daily actions with minimal cognitive load.

Priority loops:

1. Ultra-fast capture (within 3 seconds).
2. Execution focus (Top3 + Next1).
3. Closing loop (carry-over + short reflection + tomorrow prep).
4. Mini reset loop (30-45s boost, then immediate Next1 start).

## 2) Information Architecture (Today only)

Order from top to bottom:

1. `TodayHeaderCompact`
2. `QuickCaptureStrip`
3. `Top3Next1Card`
4. `MiniResetChip` (inside Top3 block footer)
5. `ClosingLoopCard` (shown stronger in evening)
6. `TimelinePreview` (collapsed default)

Non-goal for this iteration:

1. Big visual redesign for all tabs.
2. New backend or sync architecture.
3. New paid or social features.

## 3) Primary UX Flow

### Flow A: Capture (3s)

1. User opens Today.
2. Input is visible immediately.
3. User types one line and taps save.
4. Saved feedback appears inline (`저장됨`).
5. Item is available in Top3 candidate list.

### Flow B: Execute (Top3 + Next1)

1. User sees Top3 and Next1 above fold.
2. User taps `지금 시작` on Next1.
3. User marks done or postpones with reason.
4. Next1 is automatically reassigned from remaining Top3.

### Flow C: Close day

1. User opens Closing card.
2. Unfinished tasks are auto-listed.
3. User taps carry-over reason quickly.
4. User writes one-line reflection and saves.

### Flow D: Mini reset -> Next1

1. User taps `30초 리셋` on Today.
2. User completes one short game round (<= 45 seconds).
3. Result card shows one primary CTA: `Next1 시작`.
4. User returns to Today task context and starts execution.

## 4) Wireframe (Text)

```text
[오늘 02.24 화 | 연속 n일 | 설정]

[빠른 입력__________________][저장]
 도움말: "할일, 메모, 일기 모두 한 줄로 시작"
 저장 피드백: "저장됨"

[오늘의 실행]
 Top3
 1) ______ [완료] [미루기]
 2) ______ [완료] [미루기]
 3) ______ [완료] [미루기]
 Next1: ______
 [지금 시작]
 [30초 리셋]

[마감 루프]
 자동 이월 후보 n개
 이유: [시간부족] [우선순위변경] [외부이슈]
 한 줄 회고: __________________
 [오늘 마감]

[오늘 기록 미리보기 ▼]
 (기본 접힘, 필요 시 펼침)
```

## 5) Component Spec + Copy + States

## 5.1 QuickCaptureStrip

Core copy:

- Placeholder: `지금 해야 할 일이나 메모를 한 줄로 적어주세요`
- Success: `저장됨`
- Empty warning: `한 글자 이상 입력해주세요`
- Error: `저장에 실패했어요. 다시 시도해주세요`

States:

1. Loading: hydrating store (`입력 준비 중...`).
2. Empty: default placeholder.
3. Typing: save button active.
4. Saved: 1.5s success badge.
5. Error: inline retry.

Rules:

1. Tap count from app open to save <= 2.
2. Keep keyboard open after save if user continues.

## 5.2 Top3Next1Card

Core copy:

- Section title: `오늘의 실행`
- Helper: `딱 3개만 고르고, 지금 1개부터`
- Next1 label: `지금 할 일`
- Empty state: `아직 Top3가 없어요. 아래 후보에서 3개를 골라보세요`

States:

1. Loading: `오늘 우선순위 불러오는 중...`
2. Empty: no tasks.
3. Active: Top3 and Next1 visible.
4. Error: `우선순위 불러오기에 실패했어요`

Rules:

1. Next1 is always one item.
2. Completion of Next1 triggers immediate reassignment.

## 5.3 ClosingLoopCard

Core copy:

- Title: `오늘 마감`
- Carry-over title: `내일로 넘길 항목`
- Reflection placeholder: `오늘 한 줄 회고`
- Save CTA: `오늘 마감`
- Success: `내일 준비까지 저장했어요`

States:

1. Hidden/minimized before afternoon.
2. Active after configurable time.
3. Empty unfinished list: `이월할 항목이 없어요`.
4. Error: `마감 저장 실패. 다시 시도해주세요`.

Rules:

1. Carry-over reasons are one tap.
2. Reflection is optional but encouraged.

## 5.4 TimelinePreview

Core copy:

- Title: `오늘 기록`
- Default: collapsed summary only.
- Empty: `오늘 기록이 아직 없어요`.

States:

1. Collapsed default.
2. Expanded on user action.
3. Error fallback message if rendering fails.

## 5.5 MiniResetChip

Core copy:

- Label: `30초 리셋`
- Helper: `머리 비우고 바로 Next1로`
- Result title: `리셋 완료`
- Result CTA: `Next1 시작`
- Error: `리셋 실행에 실패했어요. 다시 시도해주세요`

States:

1. Hidden: no Next1 candidate.
2. Ready: Next1 exists.
3. Running: timer active.
4. Completed: result + one CTA.
5. Error: fallback toast + retry.

Rules:

1. Round duration must be <= 45 seconds.
2. Completed state must always show `Next1 시작` first.
3. Optional secondary CTA can be `다시 리셋`, never primary.

## 6) Interaction and Visual Rules

1. Above fold must include capture + Top3/Next1.
2. Primary CTA count per block: exactly one.
3. Touch targets >= 44x44.
4. Korean copy is action-first and short.
5. Keep current theme tokens; reduce decorative noise on Today.
6. Mini reset is support feature, never blocks core Today actions.

## 7) Acceptance Criteria

1. First capture can be completed within 3 seconds in normal use.
2. User can identify Top3 and Next1 without scrolling.
3. End-of-day carry-over + reflection can be done within 30 seconds.
4. Each key block has explicit loading/empty/error copy.
5. Mini reset completion must allow Next1 start within 60 seconds.

## 8) Validation Scenario

1. Open app and measure capture flow time with stopwatch.
2. Add 5 tasks and pin Top3.
3. Complete Next1 and verify auto-next assignment.
4. Simulate end-of-day and complete carry-over + reflection.
5. Trigger mini reset and confirm `Next1 시작` flow.
6. Reopen app and verify state persistence.

Commands:

```bash
npm run lint
npm run typecheck
npm test
```


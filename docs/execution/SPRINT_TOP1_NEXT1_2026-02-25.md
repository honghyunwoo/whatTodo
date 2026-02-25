# SPRINT_TOP1_NEXT1_2026-02-25

Date: 2026-02-25
Branch: `feature/today-convenience-check-flow`
Theme: 기능은 풍성하게, 사용은 단순하게

## A) 1-Page Diagnosis

### Problem

Today에서 입력은 빠르지만 “지금 뭘 해야 하는지(Next1)”가 상단에서 즉시 고정되지 않아 실행 전환이 느리다.

### Root Cause

1. 입력과 실행이 시각적으로 분리되어 있다.
2. 완료/미완료 전환이 타임라인 중심이라 “지금 할 일” 집중이 약하다.
3. Top3가 명시적 카드로 고정되어 있지 않다.

### Priority

1. P0: Today 상단에 Top3와 Next1 고정 카드 추가
2. P0: Top3 항목은 1탭 체크 가능
3. P1: Next1 CTA로 상세/실행 진입 단축

### Risks

1. Today 상단 요소 과밀로 스크롤 부담 증가
2. 기존 타임라인 체크 UX와 중복 가능
3. 선택 기준 혼란 (`dueDate` 없는 태스크 처리)

### Risk Controls

1. 오늘(`dueDate=today`) 기준만 포함
2. 카드 내 항목 최대 3개
3. Next1은 Top3 첫 항목으로 단순 고정

## B) One Metric

- Name: 60초 2행동 달성률
- Definition: 앱 진입 후 60초 내 `할 일 체크 + 다음 할 일 확인` 완료 세션 비율
- Target: +20%

## C) UX Flow and Screen

### Flow

1. Today 진입
2. `오늘의 실행` 카드에서 Top3 확인
3. 한 항목 체크
4. Next1 `지금 시작` 탭으로 상세 진입

### Copy and State

- Title: `오늘의 실행`
- Helper: `딱 3개만, 지금 1개부터`
- Empty: `오늘 마감 할 일이 없어요. 한 줄 입력에서 바로 추가해보세요`
- Next1 Label: `Next1`
- CTA: `지금 시작`

## D) Issue and PR Plan

### PR-1 (UI)

- File: `components/today/TodayExecutionCard.tsx` (new)
- Scope: Top3 표시 + Next1 CTA + 1탭 체크
- DoD:
1. 오늘 할 일 상위 3개 노출
2. 체크 즉시 상태 변경
3. Next1 CTA 동작
- Rollback:
1. 컴포넌트 제거 시 기존 Today 구조로 복귀

### PR-2 (Wiring)

- File: `app/(tabs)/index.tsx`
- Scope: TodayExecutionCard 삽입 위치 고정
- DoD:
1. TodayEntry 바로 아래 노출
2. 레이아웃 깨짐 없음
- Rollback:
1. import/render 제거로 즉시 복구

## Reproduce and Validate

1. Today에서 오늘 dueDate 할 일 3개 이상 생성
2. 상단 카드 Top3 노출 확인
3. 체크 아이콘 탭 시 완료 처리 확인
4. Next1 CTA 탭 시 상세 진입 확인
5. 앱 재시작 후 완료 상태 유지 확인

## Commands

```bash
npm run lint
npm run typecheck
npm test
```

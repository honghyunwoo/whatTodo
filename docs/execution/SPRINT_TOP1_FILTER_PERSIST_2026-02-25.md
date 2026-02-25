# SPRINT_TOP1_FILTER_PERSIST_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 기록 필터의 재진입 편의성

## A) 1-Page Diagnosis

### Problem

Today 기록 필터를 추가했지만, 화면 재진입/앱 재시작 시 매번 `전체`로 돌아가서 반복 탭이 필요하다.

### Root Cause

1. 필터 선택 상태가 컴포넌트 로컬 state에만 존재한다.
2. 사용자 의도(예: 나는 주로 일기만 본다)가 세션 간 유지되지 않는다.

### Priority

1. P0: 마지막 필터 선택을 로컬에 저장/복원한다.
2. P1: 저장값이 손상되었을 때 안전하게 `전체`로 복구한다.

### Risks

1. 잘못된 저장값으로 초기 렌더가 깨질 수 있다.
2. 저장 실패 시 UX가 불안정해질 수 있다.

### Controls

1. 화이트리스트 타입 가드(`all/todo/diary/memo`) 적용.
2. 저장/복원 실패는 조용히 무시하고 기본값(`all`) 유지.

## B) This Week One Metric

- 이름: `Today 재진입 1탭 절감률`
- 정의: Today 재진입 시 원하는 기록 타입 접근에 필요한 탭 수 감소율
- 목표: 수동 10회 기준 평균 탭 수 `1.0` 이상 감소

## C) UX Flow + Copy + States

### Flow

1. Today에서 기록 필터 선택
2. 다른 탭 이동 또는 앱 재실행
3. Today 재진입 시 이전 필터 자동 복원

### States

- Loading: 기존과 동일(필터 복원 중에도 UI 사용 가능)
- Empty(filtered): 기존 `선택한 유형의 기록이 없어요` 유지
- Error(storage): 복원 실패 시 `전체`로 자동 fallback

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `components/today/TodayTimeline.tsx`
2. `docs/UX_SPEC_TODAY.md`
3. `docs/PROJECT_DECISION.md`

### DoD

1. 필터 선택 후 재진입하면 마지막 필터가 유지된다.
2. 앱 재시작 후에도 마지막 필터가 유지된다.
3. 유효하지 않은 저장값이면 `전체`로 정상 표시된다.
4. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. `TodayTimeline.tsx`에서 저장/복원 로직만 revert하면 기존 동작으로 복귀.
2. 데이터 스키마 변경 없음.

## Reproduce / Validate

### Reproduce

1. Today 기록 필터를 `일기`로 선택.
2. 캘린더 탭 이동 후 Today로 복귀.
3. 앱 강제종료 후 재실행해 Today 진입.

### Validate

1. 복귀/재실행 후에도 `일기` 필터가 유지된다.
2. `전체 보기` 누르면 다시 전체가 보인다.
3. 필터 저장 실패(시뮬레이션) 시 UI는 깨지지 않고 기본값으로 동작한다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

# TODAY_CAPTURE_RECENT_CHIPS_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 초고속 캡처(3초 입력) 강화

## A) 1-Page Diagnosis

### Problem

Today 입력은 이미 단순하지만, 반복적으로 비슷한 문장을 다시 타이핑해야 해서 실제 사용 시 3초 목표가 흔들린다.

### Root Cause

1. 재사용 가능한 최근 문구를 UI에서 바로 선택할 수 없다.
2. 타입(할일/메모/일기)별 입력 패턴이 달라도 동일한 빈 입력에서 시작한다.

### Priority

1. P0: 타입별 최근 입력 칩으로 한 탭 재사용 제공.
2. P1: 칩 선택 후 바로 수정/저장을 이어갈 수 있도록 포커스 유지.

### Risks

1. 칩이 많아지면 오히려 입력 영역이 복잡해질 수 있다.
2. 의미 없는 짧은 문자열이 쌓이면 품질이 낮아질 수 있다.

### Controls

1. 최근 칩은 최대 4개로 제한.
2. 공백/중복/너무 짧은 텍스트는 제외.
3. 칩은 타입별로 분리(할일/메모/일기).

## B) This Week One Metric

- 이름: `반복 입력 탭 절감`
- 정의: 유사 입력을 다시 작성할 때 필요한 탭+타이핑 횟수 감소
- 목표: 수동 시나리오 10회 기준 평균 입력 액션 `30%` 감소

## C) UX Flow + Copy + States

### Flow

1. Today에서 타입 선택(할일/메모/일기)
2. `최근 입력` 칩 탭
3. 입력창 자동 채움 + 포커스 유지
4. 필요 시 수정 후 저장

### Microcopy

- 섹션 라벨: `최근 입력`
- 칩 액션: 탭 시 텍스트 채우기

### States

- Suggestions available: 최근 칩 1~4개 노출
- Suggestions empty: 섹션 미표시
- Error: 없음(읽기 전용 표시 데이터)

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `components/today/TodayEntry.tsx`
2. `docs/UX_SPEC_TODAY.md`
3. `docs/PROJECT_DECISION.md`

### DoD

1. 타입별 최근 입력 칩이 최대 4개 노출된다.
2. 칩 선택 시 텍스트가 입력창에 채워지고 포커스가 유지된다.
3. 공백/중복 문자열은 칩에서 제외된다.
4. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. `TodayEntry.tsx`의 칩 섹션만 revert하면 기존 입력 UX로 복귀.
2. 데이터 스키마 변경 없음.

## Reproduce / Validate

### Reproduce

1. Today에서 할일/메모/일기를 각 2건 이상 저장.
2. 같은 타입을 다시 작성할 때 매번 직접 타이핑 필요.

### Validate

1. 타입 전환 시 해당 타입의 최근 칩이 보인다.
2. 칩 탭 후 입력창에 즉시 반영된다.
3. 저장 후 같은 타입으로 다시 진입하면 최신 문구가 칩에 반영된다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

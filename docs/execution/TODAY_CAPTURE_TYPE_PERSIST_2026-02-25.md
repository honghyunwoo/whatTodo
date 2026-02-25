# TODAY_CAPTURE_TYPE_PERSIST_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 입력 타입 선택 유지

## A) 1-Page Diagnosis

### Problem

앱 재진입 시 입력 타입이 항상 `할일`로 시작되어, 메모/일기 위주 사용자에게는 매번 타입 전환 탭이 추가된다.

### Root Cause

1. 입력 타입 state가 세션 메모리에만 존재한다.
2. 사용자별 기본 흐름(할일 중심/일기 중심)이 로컬에 반영되지 않는다.

### Priority

1. P0: 마지막 선택 타입(`할일/메모/일기`)을 저장/복원.
2. P1: 손상값은 안전하게 `할일`로 fallback.

### Risks

1. 복원 실패 시 초기 렌더 지연 또는 타입 불일치 가능.

### Controls

1. 화이트리스트 타입 가드 적용.
2. 저장/복원 실패 시 기본값 `todo` 유지.

## B) This Week One Metric

- 이름: `입력 시작 1탭 절감률`
- 정의: Today 진입 후 실제 입력 시작 전 탭 횟수 감소율
- 목표: 수동 10회 기준 평균 탭 수 `1.0` 감소

## C) UX Flow + Copy + States

### Flow

1. Today에서 입력 타입 선택
2. 항목 작성/저장
3. 탭 이동 또는 앱 재실행
4. Today 재진입 시 마지막 타입 자동 복원

### States

- Restored: 저장된 타입 정상 복원
- Fallback: 유효하지 않은 값/오류 시 `할일` 유지

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `components/today/TodayEntry.tsx`
2. `docs/UX_SPEC_TODAY.md`

### DoD

1. 마지막 입력 타입이 재진입/재실행 후 유지된다.
2. invalid 저장값이면 `할일`로 안전 복귀한다.
3. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. 입력 타입 저장/복원 로직만 revert 시 기존 동작 복귀.
2. 스키마 변경 없음.

## Reproduce / Validate

### Reproduce

1. Today에서 `일기` 탭 선택 후 임의 저장.
2. 다른 탭 이동 후 Today 복귀 또는 앱 재실행.

### Validate

1. Today 진입 시 `일기` 탭이 유지된다.
2. `메모`로 바꾼 뒤 재진입하면 `메모`로 유지된다.
3. 오류 상황에서도 기본 입력은 정상 동작한다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

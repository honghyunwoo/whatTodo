# TODAY_CAPTURE_ENTER_SAVE_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 3초 캡처 고도화 (엔터 즉시 저장)

## A) 1-Page Diagnosis

### Problem

최근 입력 칩을 추가했지만, 빠르게 적고 저장할 때 `저장` 버튼 탭이 여전히 1회 더 필요해 반복 캡처 속도를 제한한다.

### Root Cause

1. `할일/메모`도 다이어리와 동일 입력 패턴으로 처리되어 엔터 저장이 약하다.
2. 입력 중에도 최근 칩이 계속 보이면 시선 분산이 생긴다.

### Priority

1. P0: `할일/메모`는 엔터 키(`done`)로 즉시 저장 가능.
2. P0: 입력 중에는 최근 칩을 숨겨 노이즈를 줄인다.
3. P1: `일기`는 멀티라인 유지(기록 품질 보존).

### Risks

1. 플랫폼별 키보드 동작 차이로 엔터 동작이 불안정할 수 있다.
2. 기존 사용자가 저장 버튼 동작과 혼동할 수 있다.

### Controls

1. 저장 버튼은 그대로 유지해 fallback 확보.
2. 엔터 저장은 `할일/메모`에만 적용하고 `일기`는 기존 방식 유지.
3. 마이크로카피로 `완료 키로 바로 저장` 힌트 제공.

## B) This Week One Metric

- 이름: `캡처 2탭 완료율`
- 정의: Today에서 `입력 시작 → 저장 완료`를 2동작 이내로 끝낸 비율
- 목표: 수동 시나리오 10회 기준 `+30%`

## C) UX Flow + Copy + States

### Flow

1. `할일` 또는 `메모` 탭 선택
2. 한 줄 입력
3. 키보드 완료 키 탭
4. 즉시 저장 + 입력창 포커스 유지

### Microcopy

- Quick hint: `완료 키로 바로 저장`
- Success: `저장됨`
- Empty: `한 글자 이상 입력해주세요`

### States

- Quick mode: `할일/메모` (single-line + done submit)
- Journal mode: `일기` (multi-line + 저장 버튼 중심)
- Suggestion visibility: 텍스트가 비어있을 때만 표시

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `components/today/TodayEntry.tsx`
2. `docs/UX_SPEC_TODAY.md`
3. `docs/PROJECT_DECISION.md`

### DoD

1. `할일/메모`에서 엔터(`done`)로 저장된다.
2. 저장 후 입력창 포커스가 유지되어 연속 입력이 가능하다.
3. 텍스트 입력 중에는 최근 칩이 숨겨진다.
4. `일기`는 멀티라인 작성 흐름이 유지된다.
5. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. `TodayEntry.tsx`의 quick-mode 분기만 revert하면 기존 동작으로 복귀.
2. 저장 포맷 변경 없음.

## Reproduce / Validate

### Reproduce

1. Today에서 `할일` 탭 선택 후 한 줄 입력.
2. 저장 버튼을 눌러야만 저장되는지 확인.

### Validate

1. `할일/메모`에서 완료 키 입력 시 즉시 저장된다.
2. 저장 후 같은 위치에서 바로 다음 입력이 가능하다.
3. 입력 중에는 최근 칩이 보이지 않는다.
4. `일기`에서는 멀티라인 입력이 유지된다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

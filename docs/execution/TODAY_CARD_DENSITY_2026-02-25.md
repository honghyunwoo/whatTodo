# TODAY_CARD_DENSITY_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Today 상단 정보 밀도 최적화

## A) 1-Page Diagnosis

### Problem

Today 첫 화면에서 카드가 연속으로 노출되어 핵심 행동(입력, 체크, 기록 확인)이 상대적으로 묻힌다.

### Root Cause

1. 사용 빈도가 다른 카드(핵심/보조)가 동일 레벨로 배치되어 있다.
2. 학습 보조 카드(퀵 시작, 복습, 추천)가 첫 진입 시 항상 펼쳐져 있다.

### Priority

1. P0: 핵심 카드(입력/실행/기록)는 항상 노출.
2. P0: 보조 카드(학습/추천)는 접기/펼치기로 단계적 노출.
3. P1: 사용자 선택(펼침 여부) 재진입 시 유지.

### Risks

1. 보조 카드가 숨겨져 존재를 놓칠 수 있다.
2. 토글 UI가 추가되면서 오히려 복잡도가 증가할 수 있다.

### Controls

1. 토글 행에 포함 카드 개수와 목적을 명확히 표시한다.
2. 기본은 접힘으로 두되 1탭으로 즉시 펼칠 수 있게 한다.
3. 마지막 선택 상태를 저장해 반복 탭을 줄인다.

## B) This Week One Metric

- 이름: `Today 첫 화면 핵심 행동 도달 시간`
- 정의: Today 진입 후 입력 또는 Top3 체크 시작까지 걸리는 시간
- 목표: 수동 10회 기준 평균 `20%` 단축

## C) UX Flow + Copy + States

### Flow

1. Today 진입
2. 입력/실행 카드로 핵심 행동 수행
3. 필요 시 `학습 도우미 펼치기`로 보조 카드 확인

### Microcopy

- 섹션 제목: `학습 도우미`
- 설명: `복습/추천 카드 3개`
- 토글 액션: `펼치기` / `접기`

### States

- Collapsed(default): 보조 카드 숨김
- Expanded: `QuickStartCard`, `SrsWidget`, `PackRecommendation` 노출
- Persisted: 재진입 시 마지막 토글 상태 유지

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `app/(tabs)/index.tsx`
2. `docs/UX_SPEC_TODAY.md`
3. `docs/PROJECT_DECISION.md`

### DoD

1. Today 진입 시 핵심 카드가 먼저 노출된다.
2. `학습 도우미` 토글로 보조 카드가 접기/펼치기 된다.
3. 토글 상태가 재진입/재실행 후 유지된다.
4. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. `index.tsx` 토글 섹션만 revert하면 기존 전체 노출로 복귀.
2. 저장 스키마 변경 없음.

## Reproduce / Validate

### Reproduce

1. Today 진입 시 카드들이 연속 노출되어 타임라인까지 스크롤이 길어짐을 확인.

### Validate

1. Today 진입 시 학습 보조 카드는 접힌 상태다.
2. `학습 도우미 펼치기` 탭 시 보조 카드 3개가 나타난다.
3. 토글 후 다른 탭 이동/앱 재실행 시 상태가 유지된다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

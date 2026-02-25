# SPRINT_TOP1_TIMELINE_FILTER_2026-02-26

Updated: 2026-02-26
Owner: hynoo (solo) + Codex
Scope: Today 화면 기록 탐색 마찰 감소

## A) 1-Page Diagnosis

### Problem

Today 화면의 `오늘의 기록`은 기능이 많아질수록 리스트가 길어져서, 사용자가 원하는 기록(할일/일기/메모)을 빠르게 찾기 어렵다.

### Root Cause

1. 한 리스트에 서로 다른 기록 타입이 시간순으로만 섞여 있다.
2. 확인 목적(“오늘 할일 완료 내역만 보기”)과 작성 목적(“방금 일기 저장 확인”)이 같은 UI에 혼재되어 있다.
3. 풍성한 기능을 유지하려다 스캔 비용(인지 부하)이 증가했다.

### Priority

1. P0: 기록 타입 필터를 상단에 제공해 스캔 시간을 줄인다.
2. P1: 필터별 빈 상태를 분리해 혼란을 줄인다.
3. P2: 추후 필터 상태 영속화(선택 기억)는 데이터 안정성 검토 후 추가한다.

### Risks

1. 필터 UI를 과하게 키우면 오히려 시각 복잡성이 증가할 수 있다.
2. 필터로 항목이 숨겨질 때 사용자가 “기록이 사라졌다”고 오해할 수 있다.

### Controls

1. 필터는 `전체/할일/일기/메모` 4개로 고정한다.
2. 각 칩에 개수를 표시해 정보가 숨겨진 것이 아님을 명확히 한다.
3. 필터 빈 상태에 `전체 보기` 복귀 CTA를 둔다.

## B) This Week One Metric

- 이름: `기록 탐색 15초 성공률`
- 정의: Today 화면 진입 후 15초 내 원하는 타입 기록(할일/일기/메모)을 확인한 세션 비율
- 목표: 수동 시나리오 10회 기준 성공률 `+30%`

## C) UX Flow + Copy + States

### Flow

1. Today 진입
2. `오늘의 기록` 헤더 아래 필터 칩 선택
3. 선택 타입 목록만 확인
4. 필요 시 `전체 보기`로 복귀

### Wire (Text)

1. Header: `오늘의 기록`
2. Filter row: `전체 (n) | 할일 (n) | 일기 (n) | 메모 (n)`
3. List: 선택 타입에 맞는 카드 목록

### Microcopy

- 필터 라벨: `전체`, `할일`, `일기`, `메모`
- 필터 빈 상태: `선택한 유형의 기록이 없어요`
- 복귀 CTA: `전체 보기`

### States

- Loading: 기존과 동일(로컬 스토어 즉시 렌더, 별도 로딩 없음)
- Empty(all): 기존 빈 상태 유지
- Empty(filtered): 타입 전용 빈 상태 + `전체 보기`
- Error: 기존 런타임 에러 바운더리 경로 유지

## D) Issue/PR Plan + DoD + Rollback/Backup

### Issue / PR

- PR: `TodayTimeline 기록 필터 칩 추가`
- 파일:
1. `components/today/TodayTimeline.tsx`
2. `docs/UX_SPEC_TODAY.md`
3. `docs/PROJECT_DECISION.md` (Top1 갱신)

### DoD

1. Today에서 필터 칩 선택 시 해당 타입 기록만 표시된다.
2. 칩에 타입별 개수가 정확히 표시된다.
3. 필터 전용 빈 상태에서 `전체 보기`로 즉시 복귀된다.
4. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. `TodayTimeline.tsx` 변경 revert 시 기존 타임라인 동작으로 안전 복귀.
2. 데이터 스키마 변경 없음(마이그레이션 불필요).

### Backup

1. 백업 포맷 변경 없음.
2. 기존 `백업 내보내기/불러오기` 리허설 시나리오만 재실행.

## Reproduce / Validate

### Reproduce

1. Today에서 할일 1건, 메모 1건, 일기 1건 저장.
2. `오늘의 기록`에서 원하는 타입 기록을 찾을 때 전체 목록을 스캔해야 한다.

### Validate

1. `할일` 칩 선택 시 할일만 보인다.
2. `일기` 칩 선택 시 일기만 보인다.
3. 해당 타입이 없으면 전용 빈 상태 문구와 `전체 보기` CTA가 보인다.
4. `전체` 칩으로 돌아오면 전체 목록이 복원된다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

## UX Research Notes (Applied)

1. Progressive disclosure: 고급/다양한 정보를 단계적으로 보여 인지 부담을 줄임.
   - Source: https://www.nngroup.com/articles/progressive-disclosure/
2. Minimize cognitive load: 스캔 비용이 높은 UI는 핵심 행동 속도를 떨어뜨림.
   - Source: https://www.nngroup.com/articles/minimize-cognitive-load/
3. Touch target 기준: 작은 칩이라도 충분한 터치 영역 보장 필요.
   - Apple HIG: https://developer.apple.com/design/human-interface-guidelines/layout
   - Android a11y: https://support.google.com/accessibility/android/answer/7101858?hl=en

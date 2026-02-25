# UX_SPEC_TODAY

Updated: 2026-02-25
Scope: `app/(tabs)/index.tsx` and Today/Day/Calendar linked flow
Goal: 기능은 풍성하게 유지하면서도 Today에서 80%를 빠르게 끝낸다

## 1) This Week Focus

- Top1: `오늘의 기록 탐색 마찰 감소 (타입 필터)`
- One Metric: `기록 탐색 15초 성공률`

## 2) UX Principles (Simple but Full)

1. Above-the-fold에는 “오늘 당장 해야 할 행동”만 둔다.
2. 한 블록에는 Primary CTA 1개만 둔다.
3. 고급 기능은 숨기지 말고 한 단계 아래로 내린다(Progressive disclosure).
4. 같은 개념은 같은 날짜 기준을 쓴다(`dueDate` 중심, 완료는 `completedAt` 보조).
5. 상태 피드백은 짧고 즉시 보이게 한다.

## 3) Information Architecture

### L1: 매일 (Today)

1. Header + D-day
2. 통합 입력(메모/할일/일기)
3. 오늘의 실행(체크 가능한 목록)
4. 오늘의 기록 미리보기

### L2: 확인 (Calendar/Day)

1. 캘린더 월 뷰
2. 날짜 요약 카드
3. Day 상세: 완료/미완료 구분 + 즉시 체크

### L3: 관리 (Settings)

1. 알림, 사운드, 진동
2. 백업/복구
3. 중요한 날짜(D-day)
4. 확장 기능(체중 추적 등)은 별도 섹션
5. 고급 기능(백업/실험)은 기본 진입에서 접기(Progressive disclosure)

## 4) Core User Flows

### Flow A: 3초 입력

1. Today 진입
2. 한 줄 입력
3. 저장 탭
4. `저장됨` 피드백 확인

### Flow B: 즉시 체크

1. Today 또는 Day 상세에서 할 일 확인
2. 체크 아이콘 탭
3. 완료/미완료 그룹 즉시 재배치
4. 캘린더 요약에 반영

### Flow C: 날짜 회고

1. 캘린더에서 날짜 선택
2. `상세 보기` 진입
3. 그날 할 일/학습/일기 확인
4. 필요 시 바로 완료 처리

### Flow D: 기록 빠른 탐색

1. Today `오늘의 기록` 헤더에서 타입 필터 선택
2. 선택 타입만 빠르게 확인
3. 항목이 없으면 `전체 보기`로 복귀

## 5) Microcopy and States

### Quick Input

- Placeholder: `오늘 해야 할 일이나 메모를 한 줄로 적어주세요`
- Success: `저장됨`
- Empty: `한 글자 이상 입력해주세요`
- Error: `저장에 실패했어요. 다시 시도해주세요`

### Day Todo List

- Section title: `오늘의 할 일`
- Empty: `이 날짜에 할 일이 없어요`
- Toggle success: 시각 상태 변경으로 즉시 피드백
- Error fallback: `완료 상태 변경에 실패했어요`

### Today Timeline Filter

- Filter labels: `전체`, `할일`, `일기`, `메모`
- Filter empty: `선택한 유형의 기록이 없어요`
- Recovery CTA: `전체 보기`
- Persist: 마지막 선택 필터를 재진입/재실행 시 복원

### Calendar Summary

- Empty day: `이 날의 기록이 없습니다`
- CTA: `상세 보기`

## 6) Acceptance Criteria

1. Today에서 입력 저장까지 3초 내 가능.
2. Day 상세에서 상세 화면 이동 없이 완료/해제 가능.
3. 캘린더 요약과 Day 상세가 같은 해석 기준을 사용.
4. 핵심 블록마다 빈/오류 상태 문구가 있다.
5. Today 기록에서 타입 필터로 1탭 탐색이 가능하다.

## 7) Validation Scenario

1. Today에서 할 일 1개 추가.
2. Calendar에서 해당 날짜 선택 후 Day 상세 이동.
3. Day 상세에서 체크 아이콘 탭으로 완료 처리.
4. Calendar로 돌아와 요약 수치 확인.
5. 앱 재시작 후 상태 유지 확인.
6. Today로 돌아와 `할일/일기/메모` 필터 탐색 확인.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

# SPRINT_TOP1_TODO_CHECK_2026-02-25

Date: 2026-02-25
Branch: `feature/today-convenience-check-flow`
Top1: 할 일 체크 즉시성 + 날짜별 추적 일관성

## 1) Internal Agent Meeting Summary

Participants:
1. CTO Lead Agent
2. UX Lead Agent
3. Todo Flow Agent
4. Calendar Historian Agent
5. QA and Verification Agent

Decision:
1. 게임 확장은 보류하고 Today/Calendar 실사용 루프를 먼저 고정한다.
2. Day 상세에서 상세 이동 없이 체크 가능해야 한다.
3. Calendar 요약 계산 기준을 dueDate 중심으로 통일한다.

## 2) One Metric

- Name: 60초 2행동 달성률
- Definition: 앱 진입 후 60초 안에 할 일 체크 + 기록 확인/저장을 완료한 세션 비율
- Weekly target: +20% (수동 시나리오 기준)

## 3) Scope

Included:
1. `components/day/DayTimeline.tsx` 체크 아이콘 즉시 토글
2. `app/(tabs)/calendar.tsx` 날짜 집계 기준 보정
3. `docs/PROJECT_DECISION.md`, `docs/UX_SPEC_TODAY.md`, `docs/agents/AGENT_SYSTEM.md`

Excluded:
1. 체중 추적 기능 구현
2. 미니게임 기능 확장
3. 백엔드/동기화 변경

## 4) DoD

1. Day 상세에서 체크 아이콘 탭만으로 완료/해제 가능
2. 체크 즉시 완료/미완료 섹션 재배치
3. Calendar 요약이 dueDate 해석과 충돌하지 않음
4. lint/typecheck/test 통과

## 5) Rollback Plan

1. 코드 PR revert 시 기존 동선으로 복귀 가능
2. 문서 변경만 revert해도 제품 동작 영향 없음
3. 스토리지 스키마 변경 없음 (데이터 롤백 리스크 낮음)

## 6) Reproduce and Validate

Reproduce:
1. Calendar에서 날짜 선택
2. Day 상세 이동
3. 할 일 완료 처리 시 상세 이동이 필요한지 확인

Validate:
1. Day 상세 체크 아이콘으로 즉시 완료/해제
2. Day 상세 완료/미완료 수치 즉시 갱신
3. Calendar 요약 반영 확인
4. 앱 재시작 후 상태 유지 확인

Commands:

```bash
npm run lint
npm run typecheck
npm test
```

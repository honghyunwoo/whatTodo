# PROJECT_DECISION

Updated: 2026-02-25
Owner: hynoo (solo)
Mode: One ACTIVE project for 90 days

## 1) Current Workspace and ACTIVE Candidate

- Current working repo: `C:\Users\hynoo\_archive\whatTodo`
- Git remote: `https://github.com/honghyunwoo/whatTodo.git`
- Active candidate decision: `whatTodo` only

## 2) One-Page Diagnosis

### Problem

기능 수는 충분하지만, Today와 Calendar에서 핵심 행동이 분산되어 실제 체감 편의성이 떨어진다.

### Root Cause

1. 날짜 기준이 화면마다 다르다 (`createdAt` vs `dueDate` vs `completedAt`).
2. 할 일 완료 체크 동선이 길다(일자 상세에서 즉시 체크가 어려움).
3. 고급 기능과 매일 기능의 위계가 섞여 인지 부하가 생긴다.
4. 기능 확장 속도 대비 “이번 주 하나” 원칙이 흔들린다.

### Priority (P0 to P2)

1. P0: Today/Day/Calendar에서 할 일 체크 즉시성 확보.
2. P0: 날짜별 기록 인식 일관성 확보(“몇일에 뭐 했는지” 신뢰 회복).
3. P1: 사진 첨부/일기/투두를 한 흐름에서 빠르게 처리.
4. P2: 체중 추적은 데이터 모델 검증 후 별도 스프린트로 추가.

### Risks

1. 작은 UX 개선에 큰 리팩터링 범위가 섞일 위험.
2. PR 300 LOC 초과로 회귀 위험 증가.
3. 스토리지 필드 확장 시 백업 호환성 깨질 위험.
4. 미니게임/부가기능이 핵심 루프를 다시 가릴 위험.

### Risk Controls

1. 이번 주 Top1 1개만 구현.
2. PR 분할: `문서` / `체크 동선` / `캘린더 일관성`.
3. 저장 포맷 변경 시 백업/복원 테스트 필수.
4. 게임 기능은 FROZEN으로 유지하고 핵심 루프 이후 재검토.

## 3) ACTIVE and FROZEN Classification (4 Projects)

| Project | Path | Status | Role | Why |
|---|---|---|---|---|
| whatTodo | `C:\Users\hynoo\_archive\whatTodo` | ACTIVE | Daily product | 이미 실사용 루프와 데이터가 모여 있어 품질 개선 속도가 가장 빠름 |
| whattodo-v2 | `C:\Users\hynoo\OneDrive\바탕 화면\mymy\whattodo-v2` | FROZEN | Idea lab | 패턴 참고용. 실행 코드는 복사/이식 단위만 허용 |
| personal-execution-os | `C:\Users\hynoo\personal-execution-os` | FROZEN | Reference | 화면/상태 아이디어 참고용 |
| english-coach | `C:\Users\hynoo\english-coach` | FROZEN | Learning reference | 학습 컨셉 참고용, 런타임 연동 금지 |

## 4) This Week One Metric

- Metric name: `60초 2행동 달성률`
- Definition: 앱 진입 후 60초 안에 `할 일 체크`와 `기록 1건 확인/저장`을 완료한 세션 비율
- Target this week: `+20%` (수동 10회 시나리오 기준)

## 5) Sprint Backlog (2 Weeks Top10)

1. 일자 상세 화면에서 체크 아이콘 즉시 완료/해제.
2. 캘린더 요약 계산 기준 일관화 (`dueDate` + `completedAt`).
3. Today에서 Top3/Next1 가시성 강화.
4. 할 일 상세에서 완료 상태 가시성(문구/배지) 강화.
5. D-day 카드와 캘린더 연결 문구 정리.
6. 일기 사진 첨부 로딩/빈/오류 상태 마이크로카피 정리.
7. “오늘의 기록” 섹션에서 완료/미완료 빠른 필터.
8. 체중 기록 데이터 모델 초안 + 백업 호환성 설계.
9. 설정 `기본`/`고급` 구획 분리.
10. 릴리즈 체크리스트 기반 수동 스모크 자동화 문서화.

### This Week Top1 Improvement

- `Today 핵심 행동 우선 + 초고속 캡처(최근 입력 칩)`

## 6) Verification Scenario (Reproduce and Validate)

### Reproduce

1. 캘린더에서 날짜 선택 후 Day 상세로 이동.
2. 할 일 상세를 열어야만 완료 처리가 가능한지 확인.
3. 캘린더 요약 수치가 실제 dueDate 기준과 다른지 확인.

### Validate

1. Day 상세에서 체크 아이콘만으로 완료/해제가 즉시 된다.
2. 체크 직후 같은 화면의 완료/미완료 섹션이 즉시 갱신된다.
3. 캘린더 날짜 요약이 dueDate 기준으로 일관되게 반영된다.
4. 앱 재시작 후 상태가 유지된다.

### Required Commands

```bash
npm run lint
npm run typecheck
npm test
```

## 7) Issue and PR Plan (Small and Safe)

### Issue 1 / PR-1: Day 화면 즉시 체크 UX

- Scope: `components/day/DayTimeline.tsx`
- DoD:
1. 체크 아이콘 탭으로 완료/해제가 가능하다.
2. 상세 이동 없이 같은 화면에서 상태 변경이 보인다.
3. 미완료/완료 섹션 수치가 즉시 갱신된다.
- Rollback:
1. 해당 PR revert 시 기존 동작(상세에서만 변경)으로 안전 복귀.

### Issue 2 / PR-2: Calendar 날짜 계산 일관성

- Scope: `app/(tabs)/calendar.tsx`
- DoD:
1. 날짜 요약 기준이 dueDate와 완료 이벤트에 맞게 동작한다.
2. 기존 데이터에서도 크래시 없이 렌더된다.
3. Day 상세와 수치 해석이 충돌하지 않는다.
- Rollback:
1. 기존 계산 로직으로 revert 가능.

### Issue 3 / PR-3: 운영 문서 and 에이전트 협업

- Scope: `docs/UX_SPEC_TODAY.md`, `docs/agents/*`
- DoD:
1. 회의 역할, 결정 규칙, 인수인계 포맷이 문서화된다.
2. 매 스프린트 Top1/검증/롤백 템플릿이 포함된다.
- Rollback:
1. 문서 변경만 revert하면 코드 영향 없음.

# MINIGAME_RESET_TRIAL_RUNBOOK

Updated: 2026-02-24

## 목적

- Mini reset이 실제로 실행 루프를 강화하는지 7일간 검증한다.
- 판단 기준은 재미 점수보다 `Next1 시작 전환율`이다.

## 실험 지표

1. `reset_sessions_completed`
2. `next1_started_within_60s`
3. `conversion_rate = next1_started_within_60s / reset_sessions_completed`
4. `avg_session_seconds`
5. `crash_count`

## 일일 기록 포맷

```text
date:
completed_sessions:
started_next1_within_60s:
conversion_rate:
avg_session_seconds:
crash_count:
memo:
```

## 실행 단계 (하루 5-10분)

1. Today에서 `30초 리셋` 2회 실행.
2. 각 회차 종료 후 `Next1 시작` 버튼 사용.
3. 60초 안에 실제 Next1 시작 여부 기록.
4. 앱 재시작 1회 후 상태 유지 확인.
5. 크래시/지연/혼란 카피를 메모.

## 합격 기준 (주간)

1. Conversion rate >= 70%
2. Average session <= 45s
3. Crash count = 0
4. "다시 쓸 의향" 주관 점수 >= 4/5

## 실패 시 액션

1. 전환율 미달:
   - 결과 화면 CTA 문구/배치 우선 수정
2. 세션 과다:
   - 라운드 시간 45s -> 30s 단축
3. 크래시 발생:
   - 기능 플래그 즉시 off 후 로그 기반 hotfix

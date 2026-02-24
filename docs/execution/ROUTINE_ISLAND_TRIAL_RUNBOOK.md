# ROUTINE_ISLAND_TRIAL_RUNBOOK

Updated: 2026-02-24

## Goal

- Validate that island gameplay increases real execution, not idle distraction.
- Primary success signal is conversion to Next1 start.

## Weekly metric set

1. `settlement_sessions_completed`
2. `next1_started_within_60s`
3. `island_to_next1_conversion = next1_started_within_60s / settlement_sessions_completed`
4. `avg_island_session_seconds`
5. `island_crash_count`

## Daily log template

```text
date:
settlement_sessions_completed:
next1_started_within_60s:
conversion_rate:
avg_session_seconds:
crash_count:
notes:
```

## Daily protocol (5-10 minutes)

1. Execute 2 island settlement sessions from Today.
2. Use `Next1 시작` after each claim.
3. Record whether Next1 started within 60s.
4. Restart app once and verify state persistence.
5. Record confusion points in copy or flow.

## Weekly pass criteria

1. Conversion rate >= 70%
2. Average session <= 90s
3. Crash count = 0
4. Subjective usefulness >= 4/5

## If failed

1. Low conversion:
   - tighten result screen hierarchy and CTA wording
2. Session too long:
   - reduce choices shown per claim
3. Crash:
   - disable island feature flag and hotfix first

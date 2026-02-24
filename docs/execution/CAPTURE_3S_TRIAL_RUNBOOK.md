# CAPTURE_3S_TRIAL_RUNBOOK

Updated: 2026-02-24  
Metric: `Capture-3s Success Rate`  
Purpose: Validate PR-1 quick capture impact with repeatable manual trials

## 1) Trial Setup

Environment (pick one and keep fixed for all 10 trials):

1. Android app (preferred for real usage), or
2. Web (`npm run web -- --port 19007`)

Preconditions:

1. Today screen opens normally.
2. No modal overlays.
3. Keyboard available.

## 2) Trial Rule

Start timer at:

1. First tap on capture input.

Stop timer at:

1. Inline success feedback `저장됨` appears.

Success condition per trial:

1. Elapsed time <= 3.0 seconds.

## 3) 10-Trial Log Sheet

| Trial | Input text | Elapsed sec | <=3.0s (Y/N) | Notes |
|---|---|---:|---|---|
| 1 |  |  |  |  |
| 2 |  |  |  |  |
| 3 |  |  |  |  |
| 4 |  |  |  |  |
| 5 |  |  |  |  |
| 6 |  |  |  |  |
| 7 |  |  |  |  |
| 8 |  |  |  |  |
| 9 |  |  |  |  |
| 10 |  |  |  |  |

## 4) Calculation

`Capture-3s Success Rate = (Y count / 10) * 100`

Pass threshold for this week:

`>= 80%`

## 5) Companion Checks

During trials, also note:

1. Whether repeated capture requires extra setup.
2. Whether feedback copy is immediately understandable.
3. Whether keyboard behavior feels natural for repeated input.

## 6) Validation Commands

```bash
npm run lint
npm run typecheck
npm test -- --watchAll=false
```

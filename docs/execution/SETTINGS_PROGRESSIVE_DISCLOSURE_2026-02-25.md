# SETTINGS_PROGRESSIVE_DISCLOSURE_2026-02-25

Updated: 2026-02-25
Owner: hynoo (solo) + Codex
Scope: Settings 탐색 부담 감소

## A) 1-Page Diagnosis

### Problem

설정 화면에서 핵심 설정(알림/테마/목표)과 운영성 기능(백업/실험)이 한 번에 보여 초기 스캔 비용이 높다.

### Root Cause

1. 섹션 수가 많아 스크롤 길이가 길다.
2. 사용 빈도가 낮은 기능이 기본 동선에 노출된다.

### Priority

1. P0: 기본 설정 동선을 위로 유지한다.
2. P1: 고급 섹션은 접기/펼치기로 분리한다.

### Risks

1. 고급 기능이 숨겨져 찾기 어려워질 수 있다.
2. 기존 사용자가 위치 변경을 낯설게 느낄 수 있다.

### Controls

1. 고급 섹션 토글에 포함 기능을 명시한다.
2. 1탭으로 즉시 펼치기/접기가 되도록 구현한다.

## B) This Week One Metric

- 이름: `Settings 첫 화면 핵심 도달 시간`
- 정의: 설정 진입 후 핵심 항목(알림/학습 목표) 도달까지 시간
- 목표: 수동 10회 기준 평균 `20%` 단축

## C) UX Flow + Copy + States

### Flow

1. 설정 진입
2. 기본 설정(테마/학습/중요한 날짜/건강/알림/피드백) 바로 접근
3. 필요 시 `고급 설정 펼치기` 탭
4. 백업/루틴섬/미니게임 확인

### Microcopy

- 토글 타이틀: `고급 설정`
- 토글 설명: `백업, 루틴 섬, 미니게임`
- 토글 액션: `펼치기` / `접기`

### States

- Collapsed(default): 고급 섹션 숨김
- Expanded: 고급 섹션 표시
- Error: 없음(표시 상태 전환만 수행)

## D) Issue/PR Plan + DoD + Rollback

### PR Scope

1. `app/(tabs)/settings.tsx`
2. `docs/UX_SPEC_TODAY.md`

### DoD

1. 설정 진입 시 고급 섹션은 기본적으로 접혀 있다.
2. `고급 설정` 행 탭으로 즉시 펼치고 접을 수 있다.
3. 고급 섹션 내 기존 기능(백업/루틴섬/미니게임)은 동작 그대로 유지된다.
4. `npm run lint`, `npm run typecheck`, `npm test` 통과.

### Rollback

1. 고급 토글 섹션만 revert 시 기존 전체 노출 구조로 복귀.
2. 데이터 스키마 변경 없음.

## Reproduce / Validate

### Reproduce

1. 설정 진입.
2. 화면 하단의 백업/미니게임까지 스크롤 필요 여부 확인.

### Validate

1. 설정 첫 화면에서 핵심 항목이 먼저 보인다.
2. `고급 설정 펼치기` 누르면 백업/루틴섬/미니게임이 나타난다.
3. `접기` 누르면 다시 숨겨진다.

### Commands

```bash
npm run lint
npm run typecheck
npm test
```

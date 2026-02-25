# WEIGHT_TRACKER_PHASE2_2026-02-25

Date: 2026-02-25
Branch: `feature/today-convenience-check-flow`
Status: Done

## 1) Diagnosis

### Problem

MVP 체중 입력은 가능하지만, 추세(7일)와 일자별 확인, Today 리마인더가 부족했다.

### Root Cause

1. 화면별 계산 로직이 분산되어 재사용 불가
2. Today에서 체중 미기록 상태를 알려주지 않음
3. Day 상세에 체중 맥락이 없음

## 2) One Metric

- Name: 체중 주간 유지율
- Definition: 최근 7일 중 기록일 수
- Target: 4일 이상

## 3) UX Scope

1. Settings:
   - 7일 변화량
   - 최근 7회 기록 목록
   - 오늘 기록 삭제
2. Today:
   - 체중 미기록 리마인더 카드
3. Day:
   - 날짜별 체중 기록/전일 대비 표시

## 4) Implementation

1. `utils/weight.ts`
   - 파싱/검증/정렬/변화량 공통 함수
2. `app/(tabs)/settings.tsx`
   - 공통 유틸 기반 요약/최근 기록/삭제
3. `components/home/WeightReminderCard.tsx`
   - Today 리마인더
4. `app/day/[date].tsx`
   - Day 체중 카드 추가
5. `__tests__/utils/weight.test.ts`
   - 유틸 테스트 추가

## 5) DoD

1. 7일 변화량이 계산/표시된다.
2. Today 미기록 상태에서 리마인더 카드가 보인다.
3. Day 상세에서 해당 날짜 체중을 확인할 수 있다.
4. lint/typecheck/test 통과.

## 6) Rollback

1. UI:
   - `WeightReminderCard` 렌더 제거
   - Settings/Day 체중 섹션 제거
2. Data:
   - 스토리지 스키마는 유지 (유실 없이 구버전 무시 가능)

## 7) Reproduce and Validate

1. Settings에서 3일치 체중 입력
2. 7일 변화/최근 기록 리스트 확인
3. Today에서 당일 기록 삭제 후 리마인더 카드 표시 확인
4. Day 상세에서 해당 날짜 체중 확인

Commands:

```bash
npm run lint
npm run typecheck
npm test
```

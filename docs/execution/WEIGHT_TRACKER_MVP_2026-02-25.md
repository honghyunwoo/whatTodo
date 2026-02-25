# WEIGHT_TRACKER_MVP_2026-02-25

Date: 2026-02-25
Branch: `feature/today-convenience-check-flow`
Status: Planned -> In Progress

## A) One-Page Diagnosis

### Problem

체중 기록 니즈가 높지만, 현재 앱에는 입력/추세 확인 루프가 없다.

### Root Cause

1. 체중 데이터 저장 필드가 없음.
2. 설정 화면에 건강 추적 섹션이 없음.
3. 백업/복원에서 체중 데이터 유실 검증 시나리오가 없음.

### Priority

1. P0: 오늘 체중 1회 입력 루프 구현
2. P0: 시작/현재/변화량 표시
3. P1: 목표 체중 입력

### Risks

1. 사용자 스토리지 스키마 변경으로 복원 호환성 리스크
2. 숫자 입력 검증 부재 시 이상값 저장
3. 기능 확장으로 설정 화면 과밀

### Risk Controls

1. `userStore` versioned migration 추가
2. 입력 값 범위 검증 (20~300kg, 소수점 1자리)
3. MVP는 설정 화면 섹션 하나만 추가

## B) One Metric

- Name: 체중 기록 지속률
- Definition: 최근 7일 중 체중 기록이 있는 일수
- Target: 주 4일 이상

## C) UX Flow

1. 설정 > 건강 추적
2. 오늘 체중 입력 (숫자) > 저장
3. 바로 아래 요약에서 시작/현재/총 변화량 확인
4. (선택) 목표 체중 입력

Microcopy:

1. Empty: `아직 체중 기록이 없어요. 오늘 수치를 입력해보세요`
2. Save success: `오늘 체중이 저장됐어요`
3. Invalid: `20~300kg 범위로 입력해주세요`

States:

1. Empty: 요약/최근 기록 없음
2. Active: 기록 1건 이상
3. Error: 입력값 검증 실패

## D) Schema Change Plan

Target store: `store/userStore.ts`

Add fields:

1. `weightGoalKg: number | null`
2. `weightLogs: Array<{ date: string; weightKg: number; createdAt: string; updatedAt: string }>`

Add actions:

1. `setWeightGoalKg(goalKg: number | null)`
2. `upsertWeightLog(date: string, weightKg: number)`
3. `removeWeightLog(date: string)`

Migration:

1. `persist.version`를 `2`로 올림
2. `migrate`에서 기존 state에 새 필드 기본값 주입

Rollback:

1. 코드 revert 시 구버전 앱은 새 필드를 무시하고 동작
2. 백업 JSON에는 동일 key 내 확장 필드로 저장되어 기존 데이터 손실 없음

Data-loss prevention tests:

1. `__tests__/store/userStore.test.ts` 추가 (upsert/update/remove)
2. `__tests__/utils/backup.test.ts`에 체중 필드 round-trip 검증 추가

## E) Issue and PR Plan

### PR-1 Data Layer

- Files: `store/userStore.ts`, `__tests__/store/userStore.test.ts`
- DoD:
1. 체중 로그 CRUD 액션 동작
2. migration 후 기본값 보장
3. 테스트 통과

### PR-2 UI Layer

- Files: `app/(tabs)/settings.tsx`
- DoD:
1. 오늘 체중 입력/저장 가능
2. 시작/현재/변화량 표시
3. 목표 체중 입력 가능

### PR-3 Safety Docs

- Files: `docs/BACKUP_RESTORE.md`, `docs/RELEASE_CHECKLIST.md`
- DoD:
1. 체중 데이터 포함 복구 리허설 항목 명시
2. No-Go 기준에 체중 데이터 유실 포함

## F) Reproduce and Validate

Reproduce:

1. 기존 앱에서 설정 진입
2. 체중 관련 입력/추세 UI 부재 확인

Validate:

1. 오늘 체중 입력 후 저장
2. 앱 재시작 후 값 유지
3. 백업 후 복원 시 기록 유지
4. 비정상 값 입력 차단

Commands:

```bash
npm run lint
npm run typecheck
npm test
```

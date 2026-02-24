# TODO_DIARY_PHOTO_IMPLEMENTATION_2026-02-24

Updated: 2026-02-24  
Owner: hynoo (solo)  
Status: Ready

## A) 1-Page Diagnosis

### Problem

- Today 캡처/실행 루프는 돌아가지만, 사진 기반 기록이 불가능해 실사용 편의가 떨어진다.
- 다이어리 데이터가 백업 키에 누락되어 있어 데이터 안전성이 낮다.

### Root Cause

1. DiaryEntry에 사진 필드가 없다.
2. 일기 화면에 사진 선택/삭제 UX가 없다.
3. backup export/import 대상에서 diary key가 빠져 있다.

### Priority

1. P0: 사진 첨부 기능 추가 (무의존성).
2. P0: diary 백업/복원 포함.
3. P1: 타임라인/기록 화면 가시성 보강.

### Risk

1. URI만 저장 시 일부 경로가 기기 재부팅 후 무효화될 수 있음.
2. 큰 이미지 다량 첨부 시 UI 렌더 지연 가능.
3. 기존 백업 포맷과 충돌 위험.

### Risk Control

1. `photos`는 optional 필드로 추가 (기존 엔트리 호환).
2. 이미지 첨부 수 제한(초기 5장).
3. backup schemaVersion 유지, legacy/new 복원 테스트 추가.

## B) This Week One Metric

- Metric: `Capture-3s Success Rate`
- Definition: Today 입력 -> 저장 피드백 3초 내 완료 비율
- Target: `>=80%`

Guardrail:

1. Photo attach 저장 성공률 100%
2. Crash 0

## C) UX Flow + Copy + States

### Flow

1. 다이어리 화면에서 `사진 추가` 탭
2. 갤러리 이미지 1장 선택
3. 썸네일 확인/삭제 가능
4. `저장` 시 사진 메타데이터와 함께 저장

### Copy

1. 버튼: `사진 추가`
2. 빈 상태: `첨부된 사진이 없습니다`
3. 오류: `이미지 선택에 실패했어요. 다시 시도해주세요`

### State

1. Loading: picker open
2. Empty: no photos
3. Ready: preview list shown
4. Error: alert

## D) Issue/PR Plan + DoD + Rollback

### PR-1: Diary Photo Attach + Local Schema (<=300 LOC)

- Scope: DiaryEntry optional `photos`, diary screen attach/remove/save
- DoD:
1. 사진 첨부/삭제 동작
2. 저장 후 재진입 시 유지
3. 기존 entry 깨짐 없음
- Rollback:
1. `git revert`
2. `photos` optional이라 기존 데이터 무영향

### PR-2: Backup Restore Hardening for Diary (<=220 LOC)

- Scope: backup keys에 diary 포함, 테스트 추가
- DoD:
1. legacy backup 복원 성공
2. new backup 복원 성공
3. 테스트 통과
- Rollback:
1. `git revert`

## E) Migration / Data-loss Tests

### Migration Plan

1. `DiaryEntry.photos?: DiaryPhoto[]` optional 추가
2. 저장 키는 동일(`@whatTodo:diary`), 필드만 확장
3. runtime에서 missing photos는 빈 배열로 처리

### Rollback Plan

1. feature commit revert
2. 기존 엔트리 필드만 사용하도록 복귀

### Data-loss Prevention Tests

1. photos 포함 entry backup->restore roundtrip
2. photos 없는 legacy entry restore
3. app restart 후 entry photo 유지 확인

## F) Reproduce / Validate / Commands

### Reproduce

1. 일기 화면 진입
2. 사진 첨부 시도 (기존에는 기능 없음)

### Validate

1. 사진 첨부 후 저장
2. 같은 날짜 재진입 후 썸네일 유지 확인
3. backup export/import 후 유지 확인

### Commands

```bash
npm run lint
npm run typecheck
npm test -- --runInBand
```

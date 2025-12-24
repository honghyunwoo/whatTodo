# Phase 1: 안정성 확보 - 진행 상황

**시작 일자**: 2025-12-24
**예상 완료**: 2026-01-07 (1-2주)
**브랜치**: `phase/1-stability`

---

## ✅ Task 1.1: 테스트 환경 구축 (4시간)

### 패키지 설치
- [ ] jest 설치
- [ ] @testing-library/react-native 설치
- [ ] @testing-library/jest-native 설치
- [ ] @types/jest 설치

### 설정 파일
- [ ] jest.config.js 작성
- [ ] __tests__/setup.ts 작성
- [ ] package.json에 test 스크립트 추가

### 검증
- [ ] npm test 실행 확인

---

## ⏳ Task 1.2: Critical Path 테스트 작성 (1주)

### SRS 알고리즘 테스트
- [ ] __tests__/utils/srs.test.ts 작성
- [ ] calculateSrsData 테스트 (10개 이상)
- [ ] getSrsStatus 테스트
- [ ] Edge case 테스트

### 백업/복원 테스트
- [ ] __tests__/utils/backup.test.ts 작성
- [ ] exportBackup 테스트
- [ ] importBackup 테스트
- [ ] 버전 호환성 테스트

### 할일 로직 테스트
- [ ] __tests__/store/taskStore.test.ts 작성
- [ ] 할일 추가 테스트
- [ ] 할일 완료 테스트
- [ ] 별 보상 테스트

### 검증
- [ ] 최소 30개 테스트 통과

---

## ⏳ Task 1.3: 에러 처리 개선 (3일)

### ErrorHandler 작성
- [ ] utils/errorHandler.ts 작성
- [ ] AppError 클래스
- [ ] showUserFriendlyError 함수
- [ ] BackupError, LearningError 클래스

### 기존 코드 수정
- [ ] app/settings.tsx (백업 복원)
- [ ] app/level-test.tsx
- [ ] app/review.tsx
- [ ] components/learn/*.tsx (5-8개 파일)

### ErrorBoundary
- [ ] components/common/ErrorBoundary.tsx 작성
- [ ] app/_layout.tsx에 적용
- [ ] 테스트 (에러 throw해서 확인)

---

## ⏳ Task 1.4: Sentry 설정 (30분)

- [ ] .env 파일 생성
- [ ] Sentry DSN 설정
- [ ] .gitignore에 .env 추가
- [ ] utils/sentry.ts 확인 및 개선
- [ ] 테스트 에러 전송
- [ ] Sentry 대시보드에서 확인

---

## 🎯 완료 기준

- [ ] npm test 실행 시 30개 이상 테스트 통과
- [ ] TypeScript 오류 0개 (npm run typecheck)
- [ ] 모든 Alert.alert에 사용자 친화적 메시지
- [ ] Sentry에서 테스트 에러 확인됨
- [ ] ErrorBoundary 작동 확인

---

**마지막 업데이트**: 2025-12-24
**다음 체크포인트**: Task 1.1 완료 후

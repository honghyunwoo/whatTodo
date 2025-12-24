# whatTodo 현재 상태

**최종 업데이트**: 2025-12-24 04:00 UTC
**업데이트한 사람**: Claude (Release Manager)
**브랜치**: `claude/fix-mobile-touch-input-9Am35`

---

## ⚠️ 다음 세션 시작 시 반드시 읽기!

이 파일은 항상 최신 상태를 반영합니다. 오래된 문서(`archive/`)는 읽지 마세요!

---

## ✅ 확정된 사실 (절대 변하지 않음)

### 앱 정체성
- **이름**: whatTodo
- **컨셉**: Todo 관리 + 영어 학습 결합형 앱
- **핵심 메커니즘**: 할 일 완료 → 별 획득 → 영어 학습 잠금 해제
- **타겟**: 영어 학습이 필요한 한국인 (직장인, 학생)
- **완전 오프라인**: AsyncStorage 기반, API 의존성 없음

### 학습 콘텐츠 (검증 완료)
- **레벨**: 6개 (A1, A2, B1, B2, C1, C2) ← CEFR 기준
- **활동 개수**: 288개 (6레벨 × 8주 × 6영역)
- **학습 영역**: vocabulary, grammar, listening, reading, speaking, writing
- **특징**: EnhancedWord 형식 (한국인 발음 팁, 흔한 실수, 기억법 포함)

**디렉토리 구조**:
```
data/activities/
├── a1/ (48개 활동)
├── a2/ (48개 활동)
├── b1/ (48개 활동)
├── b2/ (48개 활동)
├── c1/ (48개 활동)  ← 이전 README에 누락되어 있었음!
└── c2/ (48개 활동)  ← 이전 README에 누락되어 있었음!
```

### 기술 스택
```json
{
  "react-native": "0.74.5",
  "expo": "~51.0.0",
  "expo-router": "~3.5.24",
  "zustand": "^5.0.9",
  "typescript": "~5.9.2",
  "react-native-paper": "^5.14.5",
  "react-native-reanimated": "~3.10.1",
  "react-native-gesture-handler": "~2.16.1",
  "expo-speech": "~12.0.2",
  "@sentry/react-native": "^7.8.0"
}
```

### 아키텍처
- **상태 관리**: Zustand (10개 store)
  - taskStore, learnStore, srsStore, rewardStore, streakStore
  - gameStore, userStore, journalStore, diaryStore (중복!)
- **라우팅**: Expo Router (file-based)
- **컴포넌트**: 62개 (.tsx/.ts 파일)
- **데이터 저장**: AsyncStorage (영구 저장)

---

## 🚧 현재 작업 중

### 다음 세션 시작점
- **현재 Phase**: Phase 1 완료 ✅ → Phase 2 준비 중
- **다음 Phase**: Phase 2 - 코드 품질 개선 (TypeScript 오류 0개, ESLint, Refactoring)
- **브랜치**: `claude/fix-mobile-touch-input-9Am35`
- **마지막 커밋**: `1d885ac - docs(phase-1): add Phase 1 completion report`

### 최근 완료한 작업 (Phase 1)
- ✅ 테스트 환경 구축 (Jest + ts-jest)
- ✅ Critical Path 테스트 작성 (35개 - 목표 30개 초과)
- ✅ 사용자 친화적 에러 처리 시스템 (showUserFriendlyError)
- ✅ ErrorBoundary 추가 및 적용
- ✅ Sentry 설정 준비 완료

---

## 📝 알려진 문제

### ✅ Phase 1에서 해결된 CRITICAL 이슈

#### 1. ~~테스트 코드 전무~~ → **35개 테스트 추가됨**
```bash
npm test
# Test Suites: 2 passed, 2 total
# Tests:       35 passed, 35 total
```
- ✅ SRS 알고리즘 검증 (21개 테스트)
- ✅ 백업/복원 검증 (14개 테스트)

#### 2. ~~에러 처리 미흡~~ → **사용자 친화적 에러 처리 추가**
```typescript
// utils/errorHandler.ts 생성
import { showUserFriendlyError } from '@/utils/errorHandler';

} catch (error) {
  showUserFriendlyError(error, '백업 복원');  // ✅ 한국어 메시지
}
```
- ✅ ErrorBoundary 추가 (app/_layout.tsx)
- ✅ 핵심 부분에 에러 처리 적용 (app/settings.tsx 등)

#### 3. ~~Sentry 미설정~~ → **설정 준비 완료**
- ✅ .env.example 템플릿 제공
- ✅ SENTRY_SETUP.md 가이드 작성
- ✅ utils/sentry.ts 검증 완료
- ⏳ 실제 DSN 설정은 사용자가 직접 수행 필요

### 🟡 HIGH

#### 4. 백업 UX 원시적
- JSON 수동 복사/붙여넣기 방식
- 파일 저장/불러오기 없음
- 자동 백업 없음

### 🟢 MEDIUM/LOW (Phase 2에서 해결 예정)

#### 5. TypeScript 오류 (19개 - Phase 1에서 추가된 오류 없음)
```bash
npm run typecheck
# - @types/node 미설치 (NodeJS namespace 에러 8개)
# - SIZES.borderRadius.xxl 미정의 (2개)
# - Dynamic import 설정 (4개)
# - crypto, process 타입 (5개)
```
**참고**: 모두 기존 코드베이스 오류, Phase 2에서 해결 예정

#### 6. ESLint 경고 (68개)
- console.log 사용 (다수)
- unused imports (journalStore, learnStore 등)
- static-server.js: __dirname undefined (1 error)

#### 7. 중복 코드
- `store/journalStore.ts` vs `store/diaryStore.ts` (동일 기능)

#### 8. 큰 파일
- `components/learn/WritingFeedback.tsx`: 1,107줄

---

## 📚 문서 읽기 순서

다음 세션 시작 시 이 순서대로 읽으세요:

1. **🔥 이 파일 먼저!** (`docs/CURRENT_STATE.md`)
2. `docs/execution/whatTodo_심층_분석_보고서.md` (상세 분석)
3. `docs/implementation/MASTER_PLAN.md` (Phase별 실행 계획)
4. 필요시 `docs/reference/` (아키텍처, 개발 가이드)

**❌ 절대 읽지 마세요:**
- `docs/archive/` 폴더 (오래된 정보!)
- 프로젝트 루트 `README.md` (아직 업데이트 안 됨)

---

## 🎯 다음 단계

### Phase 1: 안정성 확보 ✅ 완료
1. ✅ 테스트 환경 구축 (Jest + ts-jest)
2. ✅ Critical Path 테스트 작성 (35개 - 목표 초과달성)
3. ✅ 에러 처리 개선 (showUserFriendlyError)
4. ✅ ErrorBoundary 추가 (app/_layout.tsx)
5. ✅ Sentry 설정 준비 완료 (.env.example, SENTRY_SETUP.md)

**완료 보고서**: `docs/implementation/phase-1-stability/COMPLETE.md`

### Phase 2: 코드 품질 개선 (예상 1주)
1. TypeScript 오류 0개 달성 (현재 19개)
   - @types/node 설치
   - borderRadius.xxl 추가
   - tsconfig.json module 설정
2. ESLint 설정 및 경고 수정
3. 코드 리팩토링 (중복 제거, 명명 개선)
4. 주석 및 타입 정의 개선

**계획서**: `docs/implementation/phase-2-quality/PLAN.md`

---

## 🔧 빠른 참조

### 개발 서버
```bash
npm install
npx expo start
```

### 코드 품질 체크
```bash
npm run typecheck  # TypeScript
npm run lint       # ESLint
```

### Git 브랜치 전략
- `main`: 안정 버전
- `claude/fix-mobile-touch-input-9Am35`: 현재 작업 브랜치
- `phase/1-stability`: Phase 1 작업 완료 (merged)

---

**마지막 확인**: 2025-12-24 04:00 UTC
**다음 업데이트**: Phase 2 시작 시

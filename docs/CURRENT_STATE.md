# whatTodo 현재 상태

**최종 업데이트**: 2025-12-24 01:40 UTC
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
- **현재 Phase**: 문서 정리 및 실행 계획 수립
- **다음 Phase**: Phase 1 - 안정성 확보 (테스트, 에러 처리, Sentry)
- **브랜치**: `claude/fix-mobile-touch-input-9Am35`
- **마지막 커밋**: `45e5c30 - fix: correct TypeScript error analysis`

### 최근 완료한 작업
- ✅ 심층 분석 보고서 작성 (execution/whatTodo_심층_분석_보고서.md)
- ✅ C1, C2 레벨 확인 및 보고서 수정
- ✅ TypeScript 오류 분석 정정
- ✅ 문서 구조 재정리 (archive/ 분리)

---

## 📝 알려진 문제

### 🔴 CRITICAL

#### 1. 테스트 코드 전무
```bash
find . -name "*.test.*"  # 결과: 0개
```
- SRS 알고리즘 (utils/srs.ts) 미검증
- 백업/복원 (utils/backup.ts) 데이터 손실 위험
- 회귀 버그 가능성 높음

#### 2. 에러 처리 미흡
```typescript
// app/settings.tsx:46
} catch (error) {
  Alert.alert('복원 실패', (error as Error).message);  // ❌ Raw error
}
```
- 사용자에게 "SyntaxError: Unexpected token" 같은 메시지 노출
- Error Boundary 없음 (컴포넌트 크래시 시 앱 전체 크래시)

#### 3. Sentry 미설정
```typescript
// utils/sentry.ts:3
const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN || '';  // 빈 문자열
```
- 프로덕션 크래시 추적 불가

### 🟡 HIGH

#### 4. 백업 UX 원시적
- JSON 수동 복사/붙여넣기 방식
- 파일 저장/불러오기 없음
- 자동 백업 없음

### 🟢 MEDIUM/LOW

#### 5. TypeScript 오류 (2개)
```bash
npm run typecheck
# error TS2688: Cannot find type definition file for 'jest'
# - tsconfig.json에 'jest' 타입 포함, but @types/jest 미설치
# - SIZES.borderRadius.xxl 미정의 (constants/sizes.ts)
```

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

## 🎯 다음 단계 (Phase 1 시작 전)

### 준비 작업
- [x] 문서 구조 재정리
- [x] CURRENT_STATE.md 작성
- [ ] MASTER_PLAN.md 작성
- [ ] README.md 업데이트 (C1, C2 추가, 288개 활동)
- [ ] 커밋 & 푸시

### Phase 1: 안정성 확보 (예상 1-2주)
1. 테스트 환경 구축 (Jest)
2. Critical Path 테스트 작성 (SRS, 백업, 할일)
3. 에러 처리 개선 (사용자 친화적 메시지)
4. ErrorBoundary 추가
5. Sentry 설정

완료 기준: 최소 30개 테스트 통과, TypeScript 오류 0개

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
- `phase/1-stability`: Phase 1 작업용 (생성 예정)

---

**마지막 확인**: 2025-12-24 01:40 UTC
**다음 업데이트**: Phase 1 시작 시

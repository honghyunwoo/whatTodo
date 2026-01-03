# Changelog

모든 주요 변경사항을 기록합니다.

---

## [Unreleased]

### 2026-01-03 - 테스트 확장

#### Added
- **spineLoader 단위 테스트** (32개)
  - 모든 CEFR 레벨(A1-C2) 로딩 검증
  - Functions, Grammar, Lexis 데이터 구조 검증
  - 헬퍼 메서드 테스트 (getFunction, getGrammarPoint 등)
  - Pronunciation 로더 테스트
- 총 테스트: 51개 → **83개**

---

### 2026-01-02 - 콘텐츠 확장 및 문서 최적화

#### Added
- **Spine 콘텐츠 A2-C2 확장** (15개 파일)
  - `data/spine/functions/` - A2~C2 기능 언어 (50개)
  - `data/spine/grammar/` - A2~C2 문법 (50개)
  - `data/spine/lexis/` - A2~C2 어휘 덩어리 (40개 + 연어 20개)
- **Slash Commands 자동화** (3개)
  - `/changelog` - CHANGELOG.md 업데이트
  - `/validate` - typecheck + lint 실행
  - `/sync-state` - state.json 동기화

#### Fixed
- Metro 빌드 오류 수정 (`wrong.ogg` → `error-sound.ogg`)

#### Changed
- **CLAUDE.md 최적화** - 콘텐츠 아키텍처 3계층 섹션 추가
- **state.json 간소화** - 141줄 → 23줄 (how vs where 원칙)
- **CURRENT_STATE.md 삭제** - 중복 제거 (state.json + CLAUDE.md로 역할 분리)

---


### 2026-01-01 - 코드 품질 개선 및 최적화

#### Fixed (Cleanup)
- 97개 ESLint 경고 → 0개 완전 제거
  - 미사용 imports/변수 제거 (40+ 파일)
  - console.log 정리 및 __DEV__ 조건부 처리
  - React Hook 의존성 경고 수정

#### Improved (Quality)
- `store/srsStore.ts` - 빈 배열 division by zero 방지
- `store/userStore.ts` - 알림 관련 async 에러 처리 추가
- `store/learnStore.ts` - Store 호출 시 try-catch 래핑
- `store/testStore.ts` - ActivityType import 수정
- `components/learn/SrsReviewSession.tsx` - null safety 강화
- `app/(tabs)/learn.tsx` - async 로딩 에러 처리 (try-catch-finally)

#### Optimized (Performance)
- `app/(tabs)/learn.tsx` - completedToday 계산 useMemo 적용
- `app/(tabs)/learn.tsx` - 그라디언트 상수 추출로 리렌더 최적화

---

### 2025-12-26 - 학습 시스템 재설계 Step 1-4 완료

#### Added (Step 4: UI 컴포넌트)
- `components/learn/UnitSelector.tsx` - 유닛 선택 컴포넌트
  - 가로 스크롤 유닛 카드 목록
  - 진행률, 잠금 상태, 완료 상태 표시
  - 선택 시 시각적 하이라이트
- `components/learn/LessonSelector.tsx` - 레슨 선택 컴포넌트
  - 세로 레슨 카드 목록
  - 완료/진행중/잠금 상태 표시
  - 점수, 진행률, 예상 시간 표시

#### Changed (Step 4: UI 수정)
- `components/learn/index.ts` - UnitSelector, LessonSelector export 추가
- `app/(tabs)/learn.tsx` - 레슨 기반 UI 통합
  - ViewMode 토글 (레슨/주차 전환)
  - UnitSelector 연동
  - LessonSelector 연동
  - useMemo로 레슨 데이터 최적화

#### Added (Step 1: 타입 시스템)
- `types/lesson.ts` - 레슨 기반 학습 구조 타입
  - `LessonMeta` - 레슨 메타데이터 (id, title, estimatedMinutes 등)
  - `UnitMeta` - 유닛 메타데이터 (4유닛/레벨)
  - `LevelMeta` - 레벨 메타데이터 (A1-C2)
  - 상수: `UNITS_PER_LEVEL=4`, `LESSONS_PER_UNIT=3`
- `types/progress.ts` - 레슨 진행률 타입
  - `LessonProgress` - 레슨별 진행 상태
  - `UnitProgress` - 유닛별 진행 상태
  - `LevelProgress` - 레벨별 진행 상태
  - `LearningStats` - 학습 통계
- `types/test.ts` - 테스트 시스템 타입
  - `TestType` - placement, diagnostic, lesson, promotion
  - `TestQuestion`, `TestAnswer` - 문제/답변
  - `TestSession` - 진행 중 테스트 세션
  - `TestResult` - 테스트 결과

#### Added (Step 2: Store 구현)
- `store/lessonStore.ts` - 레슨 기반 학습 Store
  - `startLesson()`, `completeActivity()`, `completeLesson()`
  - `getLessonProgress()`, `getLessonStatus()`
  - `isLessonUnlocked()`, `getNextLessonId()`
  - ID 파싱: `parseLessonId("a1-u1-l1")`
- `store/testStore.ts` - 테스트 시스템 Store
  - `startTest()`, `answerQuestion()`, `submitTest()`
  - `isLessonTestPassed()`, `isPromotionTestPassed()`
  - `canTakeTest()` - 쿨다운 체크
  - `savePlacementResult()` - 배치 테스트 결과

#### Added (Step 3: 데이터 마이그레이션 레이어)
- `data/lessons/a1/meta.json` - A1 레벨 메타데이터
  - 4개 유닛: 첫 만남, 일상 필수, 의사소통, 문제 해결
  - 8개 레슨 (기존 week-1~8 매핑)
  - weekMapping으로 기존 활동 파일 연결
- `utils/lessonLoader.ts` - 레슨 기반 로더
  - `loadLevelMeta()` - 레벨 메타 로드
  - `getLessonMeta()` - 레슨 메타 조회
  - `loadLessonActivities()` - 레슨 활동 로드
  - `getLessonCardData()` - UI용 데이터 변환
  - `isLessonUnlocked()` - 잠금 해제 체크

#### Design Decisions
- 레슨당 10-15분 학습 시간 권장
- 핵심 표현 3-5개/레슨
- 테스트 통과 기준 70%
- 실패 시 복습 권장 (강제 아님)
- 기존 288개 활동 파일 유지 + 매핑 레이어 추가 (리스크 최소화)

---

### 2025-12-26 - 구조 개편 완료

#### Added
- `.claude/` 디렉토리 - 바이브코딩 환경 설정
- `.claude/CLAUDE.md` - 프로젝트 컨텍스트 문서
- `.claude/state.json` - 세션 상태 관리
- `docs/CHANGELOG.md` - 변경 이력 추적
- `docs/DECISIONS.md` - 기술 결정 기록
- `app/(tabs)/calendar.tsx` - 캘린더 탭 (월별 뷰 + 날짜별 활동 마커)
- `app/(tabs)/records.tsx` - 기록 탭 (검색 + 필터 + 날짜별 그룹)
- `app/game.tsx` - 게임 화면 (탭에서 독립, Stack으로 이동)

#### Changed
- 탭 구조 4탭 → 5탭 변경 완료
  - 기존: Todo | Learn | Game | Settings
  - 변경: 오늘 | 캘린더 | 학습 | 기록 | 설정
- `app/(tabs)/_layout.tsx` - 5탭 구조로 업데이트
- `app/(tabs)/settings.tsx` - 미니게임 섹션 추가 (2048 접근)

#### Removed
- `app/(tabs)/game.tsx` - Game 탭 제거 (설정에서 접근 가능)

---

## [1.0.0] - 2025-12-25

### Phase 3: Home Screen Enhancement 완료

#### Added
- `components/home/TodaySummary.tsx` - 오늘의 요약 카드
- `components/home/QuickNoteInput.tsx` - 빠른 메모 입력

#### Changed
- `app/(tabs)/index.tsx` - TodaySummary + QuickNote 통합

---

### Phase 2: Day Page 구현 완료

#### Added
- `components/day/DayTimeline.tsx` - Todo 타임라인
- `components/day/DaySummaryCard.tsx` - 자동 요약 카드
- `components/day/DayNoteSection.tsx` - 한 줄 기록 입력
- `app/day/[date].tsx` - Day Page 라우트

---

### Phase 1: Day 유틸리티 레이어 완료

#### Added
- `types/day.ts` - DayData, DaySummary 타입
- `utils/day.ts` - 날짜별 데이터 통합 유틸리티
  - `getDayData()` - 특정 날짜 전체 데이터
  - `getTodayData()` - 오늘 데이터
  - `getRecentDays()` - 최근 N일 데이터
  - `getWeeklyActivity()` - 주간 활동 데이터
  - `getMonthSummaries()` - 월간 요약
  - `getCurrentStreak()` - 연속 기록일

---

### 기타 완료 기능

#### Added
- 백업/복원 시스템 (자동 백업 포함)
- 학습 통계 대시보드
- 온보딩 플로우 (5개 슬라이드)
- 51개 테스트

#### Fixed
- TypeScript 오류 19개 → 0개
- ESLint 오류 1개 → 0개

---

## 작성 규칙

### 변경 유형
- **Added**: 새로운 기능
- **Changed**: 기존 기능 변경
- **Deprecated**: 곧 제거될 기능
- **Removed**: 제거된 기능
- **Fixed**: 버그 수정
- **Security**: 보안 관련

### 형식
```markdown
## [버전] - YYYY-MM-DD

### Added
- 내용

### Changed
- 내용
```

# WhatTodo - 개발 태스크 목록

> 최종 업데이트: 2025-12-15

---

## 현재 상태 요약

| 항목 | 상태 |
|------|------|
| TypeScript 에러 | 0개 ✅ |
| EAS Build (Android) | 성공 |
| 앱 설치/실행 | 성공 |

---

## Phase 0.5: 심리학 기반 참여 시스템 ✅ 완료

### 0.5.1 감각 피드백 시스템 ✅
- [x] feedbackService 생성 (햅틱 + 사운드 통합)
- [x] soundService graceful degradation (사운드 파일 없어도 작동)
- [x] SessionCompleteModal ("한 레슨 더?" Action Prompt)

### 0.5.2 동기부여 UI ✅
- [x] DailyGoalProgress (Goal Gradient Effect)
- [x] StreakWarning (Loss Aversion)
- [x] XPPopup (Variable Reward 시각화)
- [x] ComboIndicator (연속 정답 표시)

### 0.5.3 심리학 시스템 ✅
- [x] Combo System (연속 정답 추적)
- [x] Variable Reward (selectPraise, calculateXP)
- [x] QuizView/VocabularyView/GrammarView 통합

---

## Phase 1: 코드 안정화 (TypeScript 에러 수정) ✅ 완료

### 1.1 hapticService 확장 ✅
- [x] `learnHaptics`에 `selection` 메서드 추가
- [x] `learnHaptics`에 `impact` 메서드 추가

### 1.2 constants/colors.ts 수정 ✅
- [x] `COLORS`에 `error` 속성 추가 (`danger`와 동일 값)

### 1.3 constants/sizes.ts 수정 ✅
- [x] `SIZES.radius`에 `round` 속성 추가
- [x] `SIZES.borderRadius`에 `round` 속성 추가

### 1.4 types/writing.ts 수정 ✅
- [x] `WritingEvaluation`에 `ruleBasedScore` 속성 추가
- [x] `RuleBasedScore` 인터페이스 추가

### 1.5 CEFRLevel 타입 확장 ✅
- [x] `types/activity.ts`에 C1/C2 레벨 추가
- [x] `utils/activityLoader.ts`에서 CEFRLevel import 및 re-export
- [x] `utils/levelTest.ts`에 C1/C2 처리 추가
- [x] `data/levelTestQuestions.ts`에 C1/C2 빈 배열 추가
- [x] `services/writingService.ts`에 C1/C2 처리 추가

### 1.6 loadActivity 함수 호출 수정 ✅
- [x] `app/(tabs)/learn.tsx` - loadWeekActivities에 currentLevel 인자 추가
- [x] `app/learn/[type].tsx` - loadActivity에 currentLevel 인자 추가

### 1.7 LevelTestView/WritingFeedback 타입 수정 ✅
- [x] `components/learn/LevelTestView.tsx` - ViewStyle/TextStyle 타입 명시, 아이콘 타입 수정
- [x] `components/learn/WritingFeedback.tsx` - 아이콘 타입 수정

---

## Phase 2: 기능 완성

### 2.1 soundService 구현 (부분 완료)
- [x] soundService.ts graceful degradation 구현
- [ ] 사운드 파일 추가 (`assets/sounds/`) - 선택사항
  - [ ] correct.mp3
  - [ ] wrong.mp3
  - [ ] card-flip.mp3
  - [ ] level-up.mp3
  - [ ] achievement.mp3
  - [ ] task-complete.mp3
  - [ ] tap.mp3
- 참고: 사운드 파일 없이도 앱 정상 작동 (햅틱 피드백만 제공)

### 2.2 오프라인 지원 강화 ✅ N/A
- 참고: 앱이 이미 완전 오프라인-first 아키텍처
  - 모든 데이터 AsyncStorage 로컬 저장
  - API 호출 없음
  - TTS도 디바이스 내장 엔진 사용 (expo-speech)
- 네트워크 상태 표시는 불필요 (앱이 항상 오프라인 작동)

---

## Phase 3: 개발 환경 개선

### 3.1 패치 자동화
- [ ] patch-package 설치
- [ ] `_ctx.web.js` 패치 파일 생성
- [ ] postinstall 스크립트 추가

### 3.2 ESLint 설정 수정 ✅
- [x] ESLint 9.x 호환 설정으로 업데이트 (flat config)
- [x] pre-commit hook 정상화

---

## Phase 4: 기능 추가 (향후)

### 4.1 푸시 알림 ✅ 완료
- [x] expo-notifications 설치
- [x] 알림 권한 요청
- [x] 학습 리마인더 구현 (일일 알림, 사용자 설정 시간)
- [x] 스트릭 유지 알림 (저녁 8시 경고)
- [x] 스트릭 마일스톤 축하 알림 (7, 14, 30, 50, 100일)

### 4.2 위젯 지원
- [ ] Android 위젯 구현
- [ ] iOS 위젯 구현 (WidgetKit)

### 4.3 C1/C2 레벨 콘텐츠
- [ ] C1 레벨 학습 데이터 추가 (8주 × 6영역)
- [ ] C2 레벨 학습 데이터 추가 (8주 × 6영역)

---

## Phase 5: 출시 준비

### 5.1 앱 스토어 준비
- [ ] 앱 아이콘 최종화
- [ ] 스플래시 스크린 최종화
- [ ] 스크린샷 준비
- [ ] 앱 설명 작성

### 5.2 성능 최적화
- [ ] 번들 사이즈 최적화
- [ ] 메모리 사용량 점검
- [ ] 애니메이션 성능 점검

### 5.3 테스트
- [ ] 전체 기능 테스트
- [ ] 다양한 기기 테스트
- [ ] 엣지 케이스 테스트

---

## 완료된 작업

### 2025-12-15
- [x] Phase 4.1 푸시 알림 시스템 구현 완료
  - expo-notifications, expo-device 설치
  - notificationService 생성 (학습 리마인더, 스트릭 경고, 마일스톤 축하)
  - 앱 라이프사이클 통합 (시작 시 초기화, 학습 완료 시 경고 취소)
  - userStore에 알림 설정 추가
- [x] Phase 0.5 심리학 기반 참여 시스템 구현 완료
  - SessionCompleteModal ("한 레슨 더?" 유도)
  - DailyGoalProgress (일일 목표 시각화)
  - ComboIndicator (연속 정답 콤보 표시)
  - XPPopup (획득 XP 팝업)
  - StreakWarning (스트릭 유지 경고)
  - feedbackService 통합 (햅틱 + 사운드)
  - Variable Reward 시스템 (selectPraise, calculateXP)
  - QuizView/VocabularyView/GrammarView 콤보 시스템 통합
- [x] Phase 1 전체 완료 (TypeScript 에러 58개 → 0개)
  - hapticService 확장 (selection, impact 메서드)
  - COLORS.error 추가
  - SIZES.radius.round / SIZES.borderRadius.round 추가
  - WritingEvaluation에 ruleBasedScore 추가
  - CEFRLevel C1/C2 확장
  - loadActivity/loadWeekActivities 호출 수정
  - LevelTestView/WritingFeedback 타입 수정
- [x] Phase 3.2 ESLint 9.x flat config 마이그레이션 완료
  - eslint.config.js 생성 (flat config 형식)
  - Node.js globals 지원 추가
  - react/no-unescaped-entities 에러 수정
- [x] EAS Build 동적 import 에러 수정 (activityLoader.ts 정적 import로 변경)
- [x] .npmrc 추가 (peer dependency 충돌 해결)

### 이전
- [x] 웹 빌드 시 import.meta 에러 → SDK 51 + Webpack으로 해결
- [x] expo-router Webpack 경로 에러 → _ctx.web.js 패치로 해결

---

## 작업 규칙

1. **한 번에 하나씩**: Phase 순서대로, 태스크 하나씩 완료
2. **테스트 필수**: 수정 후 `npx tsc --noEmit` 통과 확인
3. **커밋 단위**: 각 태스크 완료 시 커밋
4. **문서 업데이트**: 완료 시 이 파일 업데이트

---

**다음 작업**: Phase 4.2 - 위젯 지원 또는 Phase 4.3 - C1/C2 레벨 콘텐츠

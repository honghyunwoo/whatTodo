# WhatTodo - 개발 태스크 목록

> 최종 업데이트: 2025-12-15

---

## 현재 상태 요약

| 항목 | 상태 |
|------|------|
| TypeScript 에러 | 58개 |
| EAS Build (Android) | 성공 |
| 앱 설치/실행 | 성공 |

---

## Phase 1: 코드 안정화 (TypeScript 에러 수정)

### 1.1 hapticService 확장 (우선순위: 높음)
- [ ] `learnHaptics`에 `selection` 메서드 추가
- [ ] `learnHaptics`에 `impact` 메서드 추가

**영향받는 파일:**
- `components/learn/PronunciationFeedback.tsx` (6개 에러)
- `components/learn/SpeechRecorder.tsx` (7개 에러)
- `components/learn/WritingEditor.tsx` (3개 에러)
- `components/learn/WritingFeedback.tsx` (4개 에러)
- `components/learn/exercises/Dictation.tsx` (2개 에러)
- `components/learn/exercises/ShortAnswer.tsx` (1개 에러)

### 1.2 constants/colors.ts 수정 (우선순위: 높음)
- [ ] `COLORS`에 `error` 속성 추가 (`danger`와 동일 값)

**영향받는 파일:**
- `app/(tabs)/learn.tsx` (1개 에러)

### 1.3 constants/sizes.ts 수정 (우선순위: 중간)
- [ ] `SIZES.radius`에 `round` 속성 추가

**영향받는 파일:**
- `components/reward/BadgeGrid.tsx` (1개 에러)

### 1.4 types/writing.ts 수정 (우선순위: 높음)
- [ ] `WritingEvaluation`에 `ruleBasedScore` 속성 추가

**영향받는 파일:**
- `components/learn/WritingFeedback.tsx` (16개 에러)

### 1.5 utils/cefr.ts 수정 (우선순위: 중간)
- [ ] C1/C2 레벨 처리 로직 수정 (CEFRLevel 타입에 없음)

**영향받는 파일:**
- `utils/cefr.ts` (4개 에러)

### 1.6 loadActivity 함수 호출 수정 (우선순위: 높음)
- [ ] `app/(tabs)/learn.tsx` - 함수 인자 수정
- [ ] `app/learn/[type].tsx` - 함수 인자 수정

### 1.7 LevelTestView 스타일 타입 수정 (우선순위: 낮음)
- [ ] 동적 스타일 타입 명시

**영향받는 파일:**
- `components/learn/LevelTestView.tsx` (6개 에러)

---

## Phase 2: 기능 완성

### 2.1 soundService 구현
- [ ] 사운드 파일 추가 (`assets/sounds/`)
  - [ ] correct.mp3
  - [ ] wrong.mp3
  - [ ] card-flip.mp3
  - [ ] level-up.mp3
  - [ ] achievement.mp3
  - [ ] task-complete.mp3
  - [ ] tap.mp3
- [ ] soundService.ts 주석 해제 및 활성화

### 2.2 오프라인 지원 강화
- [ ] AsyncStorage 데이터 동기화
- [ ] 오프라인 상태 감지 및 UI 표시

---

## Phase 3: 개발 환경 개선

### 3.1 패치 자동화
- [ ] patch-package 설치
- [ ] `_ctx.web.js` 패치 파일 생성
- [ ] postinstall 스크립트 추가

### 3.2 ESLint 설정 수정
- [ ] ESLint 9.x 호환 설정으로 업데이트
- [ ] pre-commit hook 정상화

---

## Phase 4: 기능 추가 (향후)

### 4.1 푸시 알림
- [ ] expo-notifications 설치
- [ ] 알림 권한 요청
- [ ] 학습 리마인더 구현
- [ ] 스트릭 유지 알림

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
- [x] EAS Build 동적 import 에러 수정 (activityLoader.ts 정적 import로 변경)
- [x] .npmrc 추가 (peer dependency 충돌 해결)

### 이전
- [x] 웹 빌드 시 import.meta 에러 → SDK 51 + Webpack으로 해결
- [x] expo-router Webpack 경로 에러 → _ctx.web.js 패치로 해결

---

## 에러 상세 (Phase 1 참고용)

### TypeScript 에러 분포 (총 58개)

| 파일 | 에러 수 | 주요 원인 |
|------|---------|----------|
| WritingFeedback.tsx | 20개 | ruleBasedScore, haptics |
| SpeechRecorder.tsx | 7개 | haptics.selection/impact |
| PronunciationFeedback.tsx | 6개 | haptics.selection/impact |
| LevelTestView.tsx | 6개 | 스타일 타입 |
| cefr.ts | 4개 | C1/C2 레벨 |
| WritingEditor.tsx | 3개 | haptics.selection |
| Dictation.tsx | 2개 | haptics.selection |
| learn.tsx | 2개 | loadActivity, COLORS.error |
| 기타 | 8개 | 다양 |

---

## 작업 규칙

1. **한 번에 하나씩**: Phase 순서대로, 태스크 하나씩 완료
2. **테스트 필수**: 수정 후 `npx tsc --noEmit` 통과 확인
3. **커밋 단위**: 각 태스크 완료 시 커밋
4. **문서 업데이트**: 완료 시 이 파일 업데이트

---

**다음 작업**: Phase 1.1 - hapticService 확장

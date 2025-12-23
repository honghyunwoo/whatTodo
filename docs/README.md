# whatTodo 프로젝트 문서

통합 생산성 & 학습 앱

---

## 📚 문서 가이드

### 🚀 시작하기
처음 프로젝트를 접한다면 이 순서대로 읽으세요:

1. **[ARCHITECTURE_ANALYSIS.md](./ARCHITECTURE_ANALYSIS.md)** - 프로젝트 전체 구조 이해
   - 기술 스택
   - 폴더 구조
   - 상태 관리
   - 데이터 흐름

2. **[TOUCH_GESTURE_GUIDE.md](./TOUCH_GESTURE_GUIDE.md)** - 터치/제스처 처리 기초
   - React Native vs gesture-handler
   - 언제 어떤 것을 사용하나?
   - 올바른 패턴
   - 흔한 실수

3. **[DEVELOPMENT_GUIDELINES.md](./DEVELOPMENT_GUIDELINES.md)** - 개발 가이드라인
   - 코딩 규칙
   - 컴포넌트 패턴
   - 체크리스트
   - 디버깅 가이드

### 🔍 참고 문서

- **[CODEBASE_HEALTH_REPORT.md](./CODEBASE_HEALTH_REPORT.md)** - 코드베이스 건강 진단
  - 전체 파일 분석
  - 위험도 평가
  - 개선 제안

- **[PROJECT_KNOWLEDGE.md](./PROJECT_KNOWLEDGE.md)** - 프로젝트 지식 베이스
  - 도메인 지식
  - 비즈니스 로직
  - 특정 구현 설명

---

## 🎯 핵심 인사이트

### 프로젝트 구조

```
whatTodo/
├── app/              # 라우팅 (expo-router)
├── components/       # UI 컴포넌트
├── store/           # 상태 관리 (Zustand)
├── services/        # 비즈니스 로직
├── types/           # TypeScript 타입
├── constants/       # 상수
├── utils/           # 유틸리티
└── contexts/        # Context API
```

### 기술 스택

- **플랫폼**: React Native 0.74.5 + Expo 51
- **언어**: TypeScript (strict mode)
- **상태 관리**: Zustand + AsyncStorage
- **라우팅**: expo-router (파일 기반)
- **UI**: React Native Paper + Custom
- **애니메이션**: reanimated + moti
- **제스처**: gesture-handler

### 주요 기능

1. **Todo Manager**
   - 스마트 리스트 (오늘, 예정, 언제든지)
   - 서브태스크 시스템
   - 자연어 입력
   - 스와이프 제스처

2. **English Learning**
   - 어휘, 문법, 읽기, 듣기, 말하기, 쓰기
   - SRS (간격 반복 학습)
   - 레벨 테스트 (CEFR)
   - 일일 목표 추적

3. **2048 Game**
   - 다양한 보드 크기 (4x4, 5x5, 6x6)
   - 테마 선택
   - Undo 기능
   - 통계 추적

4. **Reward System** (공통)
   - 별 포인트
   - 배지 시스템
   - 연속 학습 기록

---

## 🔧 개발 워크플로우

### 새로운 기능 추가하기

1. **계획**
   ```
   □ 어떤 인터랙션이 필요한가?
   □ 부모 컴포넌트 확인
   □ 참고할 기존 코드 찾기
   ```

2. **구현**
   ```
   □ 올바른 라이브러리 사용
   □ 타입 정의
   □ 성능 최적화 (memo, useCallback)
   ```

3. **테스트**
   ```
   □ 모바일 테스트
   □ 터치/제스처 확인
   □ 엣지 케이스 테스트
   ```

4. **문서화**
   ```
   □ 컴포넌트 설명
   □ 복잡한 로직 주석
   □ README 업데이트
   ```

### 문제 발생 시

1. **문서 확인**
   - TOUCH_GESTURE_GUIDE.md
   - DEVELOPMENT_GUIDELINES.md

2. **기존 코드 참고**
   - GameBoard.tsx (복잡한 제스처)
   - SwipeableRow.tsx (스와이프)
   - TaskItem.tsx (스와이프 + 버튼)

3. **디버깅**
   - 터치 이벤트: GestureHandlerRootView 확인
   - 제스처 충돌: 라이브러리 혼용 확인
   - 성능: React DevTools Profiler 사용

---

## 📊 프로젝트 상태

### 전체 건강도: **6.5/10** (양호)

| 항목 | 점수 | 상태 |
|------|------|------|
| 기술 스택 | 9/10 | ✅ 최신, 적절 |
| 코드 구조 | 7/10 | ✅ 잘 분리됨 |
| 상태 관리 | 6/10 | 🟡 결합도 높음 |
| 타입 안전성 | 8/10 | ✅ TS 활용 |
| 문서화 | 8/10 | ✅ 개선됨 |
| 테스트 | 0/10 | 🔴 없음 |
| 성능 | 7/10 | 🟡 최적화 여지 |
| 유지보수성 | 6/10 | 🟡 개선 필요 |

### 주요 발견사항

✅ **강점**:
- 현대적 기술 스택
- 명확한 도메인 분리
- 타입 안전성
- 부드러운 UX

🔴 **개선 필요**:
- Store 간 강한 결합
- 테스트 부재
- 일부 성능 최적화 미흡

---

## 🚀 로드맵

### Phase 1: 기초 다지기 (완료 ✅)
- [x] 문서화 완료
- [x] 터치 이벤트 문제 해결
- [x] TypeScript 설정 개선

### Phase 2: 구조 개선 (2-4주)
- [ ] Store 의존성 해결
- [ ] 비즈니스 로직 분리
- [ ] 컴포넌트 문서화

### Phase 3: 품질 향상 (1-2개월)
- [ ] 유닛 테스트 추가
- [ ] 성능 최적화
- [ ] 에러 처리 체계화

### Phase 4: 프로덕션 준비 (3-6개월)
- [ ] E2E 테스트
- [ ] CI/CD 구축
- [ ] 모니터링 강화

---

## 📖 추가 리소스

### 공식 문서
- [React Native](https://reactnative.dev/)
- [Expo](https://docs.expo.dev/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/)
- [reanimated](https://docs.swmansion.com/react-native-reanimated/)

### 학습 자료
- [React Native Express](https://www.reactnative.express/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JavaScript Info](https://javascript.info/)

---

## 🤝 기여하기

### 코드 리뷰 체크리스트

```
□ 올바른 import (react-native vs gesture-handler)
□ 타입 정의
□ 성능 최적화 (memo, useCallback)
□ 모바일 테스트 완료
□ 문서 업데이트
```

### 커밋 메시지 규칙

```
feat: 새로운 기능 추가
fix: 버그 수정
docs: 문서 업데이트
refactor: 코드 리팩토링
perf: 성능 개선
test: 테스트 추가
chore: 기타 작업
```

---

## 📞 도움말

### 자주 묻는 질문

**Q: 터치가 작동하지 않아요**
A: TOUCH_GESTURE_GUIDE.md 참고. GestureDetector 안에서는 gesture-handler의 TouchableOpacity 사용.

**Q: 새로운 컴포넌트를 만들고 싶어요**
A: DEVELOPMENT_GUIDELINES.md의 체크리스트 참고. 기존 코드 패턴 따르기.

**Q: Store를 추가하고 싶어요**
A: ARCHITECTURE_ANALYSIS.md 참고. 다른 Store에 직접 의존하지 않도록 주의.

**Q: 성능이 느려요**
A: React DevTools Profiler로 분석 후 memo/useCallback 적용.

---

**마지막 업데이트**: 2025-12-23
**버전**: 1.0.0
**상태**: 활발히 개발 중

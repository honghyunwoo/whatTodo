# WhatTodo 프로젝트 컨텍스트

> 이 문서는 AI 어시스턴트가 프로젝트를 이해하기 위한 핵심 정보입니다.
> 매 세션 시작 시 이 문서를 읽어주세요.

**최종 업데이트**: 2026-01-01

---

## 프로젝트 개요

**앱 이름**: WhatTodo
**목적**: Todo 관리 + 영어 학습 + 일기 통합 앱
**핵심 메커니즘**: 할 일 완료 → 별 획득 → 영어 학습 잠금 해제
**타겟**: 영어 학습이 필요한 한국인 (직장인, 학생)
**특징**: 완전 오프라인 (AsyncStorage 기반)

---

## 기술 스택

```json
{
  "expo": "~51.0.0",
  "react-native": "0.74.5",
  "react": "18.2.0",
  "typescript": "~5.9.2",
  "zustand": "^5.0.9",
  "react-native-reanimated": "~3.10.1",
  "react-native-paper": "^5.14.5",
  "expo-router": "~3.5.24"
}
```

**주의**: SDK 54 업그레이드 예정 (moti → Reanimated 마이그레이션 필요)

---

## 현재 진행 상황

**현재 Phase**: 코드 품질 정리 완료 → 사용자 테스트 단계
**마지막 업데이트**: 2026-01-01

### 완료된 작업
- [x] Phase 1: Day 유틸리티 레이어 (types/day.ts, utils/day.ts)
- [x] Phase 2: Day Page 구현 (components/day/*)
- [x] Phase 3: Home Screen 개편 (components/home/*)
- [x] 백업/복원 시스템
- [x] 학습 통계 대시보드
- [x] 온보딩 플로우
- [x] 51개 테스트 (모두 통과)
- [x] 탭 구조 변경 (4탭 → 5탭: 오늘|캘린더|학습|기록|설정)
- [x] 레슨 기반 학습 구조 Step 1-4 완료
- [x] ESLint 경고 97 → 0 전면 정리
- [x] Store 에러 처리 강화
- [x] 성능 최적화 (useMemo, 상수 추출)

### 진행 중
- [ ] 사용자 테스트
- [ ] 배포 준비

### 다음 할 일
1. 실제 기기 테스트
2. 핵심 플로우 검증 (온보딩 → Todo → 학습 → 백업)
3. 버그 확인 및 수정
4. 배포 (스크린샷, 앱 설명, 빌드)

---

## 프로젝트 구조

```
whatTodo/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx    # 탭 레이아웃 (수정 중)
│   │   ├── index.tsx      # 오늘 탭
│   │   ├── calendar.tsx   # 캘린더 탭 (신규)
│   │   ├── learn.tsx      # 학습 탭
│   │   ├── records.tsx    # 기록 탭 (신규)
│   │   └── settings.tsx   # 설정 탭
│   ├── day/[date].tsx     # Day 상세
│   ├── diary/[date].tsx   # 일기
│   ├── learn/[type].tsx   # 학습 활동
│   └── ...
├── components/
│   ├── day/               # Day 관련 컴포넌트
│   ├── home/              # 홈 화면 컴포넌트
│   ├── learn/             # 학습 컴포넌트
│   ├── calendar/          # 캘린더 컴포넌트
│   └── ...
├── store/
│   ├── taskStore.ts       # Todo 관리
│   ├── learnStore.ts      # 학습 진행률
│   ├── srsStore.ts        # SRS 복습
│   ├── diaryStore.ts      # 일기
│   ├── rewardStore.ts     # 보상 시스템
│   └── ...
├── data/activities/       # 학습 콘텐츠 (288개)
├── types/                 # TypeScript 타입
├── utils/                 # 유틸리티 함수
├── constants/             # 상수 (colors, sizes)
└── docs/                  # 문서
```

---

## 핵심 Store (10개)

| Store | 목적 | 주요 기능 |
|-------|------|----------|
| taskStore | Todo 관리 | 추가/수정/삭제/완료 |
| learnStore | 학습 진행률 | 주차별 진행, 스트릭 |
| lessonStore | 레슨 진행 | 레슨 기반 진행률 (NEW) |
| testStore | 레벨 테스트 | 테스트 결과 저장 (NEW) |
| srsStore | SRS 복습 | SM-2 알고리즘, 복습 스케줄 |
| diaryStore | 일기 | 감정 기록, 텍스트 |
| rewardStore | 보상 | 별 획득, 배지 |
| journalStore | 학습 저널 | 학습 활동 로그 |
| userStore | 사용자 설정 | 레벨, 선호도 |
| streakStore | 연속 학습 | 스트릭 관리 |

---

## 학습 콘텐츠 구조

```
data/
├── activities/           # 레거시 Week 기반 (288개)
│   ├── a1/ ~ c2/        # 레벨별 (각 48개)
│   │   ├── vocabulary/week-1-vocabulary.json ~ week-8
│   │   ├── grammar/...
│   │   ├── listening/...
│   │   ├── reading/...
│   │   ├── speaking/...
│   │   └── writing/...
└── lessons/             # 레슨 기반 매핑 (NEW)
    └── a1/              # A1 레슨 (완료)
        ├── unit-1/
        │   ├── lesson-1.json
        │   ├── lesson-2.json
        │   └── lesson-3.json
        └── ...
```

**총 288개 활동** (6레벨 × 8주 × 6영역) - 레거시 유지
**레슨 매핑**: A1 완료 (4유닛 × 3레슨 = 12개)

---

## 주의사항

1. **moti 라이브러리**: SDK 54 업그레이드 시 제거 예정
   - 영향 파일: StarDisplay, StreakRing, EmptyState, Toast, LoadingSpinner

2. **runOnJS**: Reanimated 4에서 scheduleOnRN으로 변경
   - 영향 파일: SwipeableRow.tsx

3. **8주 구조**: 레슨 구조로 전환 시 마이그레이션 필요

---

## 명령어

```bash
# 개발 서버
npm start

# 타입 체크
npm run typecheck

# 린트
npm run lint

# 테스트
npm test

# 빌드
eas build --profile development --platform android
```

---

## 관련 문서

- `docs/CURRENT_STATE.md` - 상세 현황
- `docs/CHANGELOG.md` - 변경 이력
- `docs/DECISIONS.md` - 기술 결정
- `docs/PRE_LAUNCH_CHECKLIST.md` - 체크리스트
- `.claude/state.json` - 세션 상태

---

## 작업 규칙

1. **한 번에 하나의 작업만** 진행
2. **각 작업 후 typecheck/lint 실행**
3. **변경사항은 CHANGELOG.md에 기록**
4. **중요 결정은 DECISIONS.md에 기록**
5. **state.json 항상 최신 유지**

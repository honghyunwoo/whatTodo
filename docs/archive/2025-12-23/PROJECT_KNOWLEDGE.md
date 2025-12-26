# WhatTodo 프로젝트 지식 베이스

> 프로젝트 관련 모든 중요 정보를 기록하는 문서입니다.
> 나중에 프로젝트를 다시 볼 때 빠르게 상황을 파악할 수 있습니다.

**최종 업데이트**: 2025-12-19

---

## 1. 프로젝트 개요

### 기술 스택
| 분야 | 기술 |
|------|------|
| 프레임워크 | React Native + Expo 51 (웹 지원을 위해 다운그레이드) |
| 상태관리 | Zustand 5 |
| 네비게이션 | expo-router 3 |
| 애니메이션 | react-native-reanimated, Moti, Lottie |
| 스타일링 | StyleSheet (기본) |
| 웹 번들러 | Webpack (@expo/webpack-config) |
| 언어 | TypeScript |

### 폴더 구조
```
whatTodo/
├── app/                    # expo-router 페이지
│   ├── (tabs)/             # 탭 네비게이션
│   │   ├── index.tsx       # Todo 탭
│   │   ├── game.tsx        # 2048 게임 탭
│   │   └── learn.tsx       # 영어 학습 탭
│   ├── settings.tsx        # 설정 화면 (백업/복원)
│   └── _layout.tsx         # 루트 레이아웃
├── components/             # UI 컴포넌트
│   ├── common/             # 공용 컴포넌트 (BlurModal, EmptyState 등)
│   ├── todo/               # Todo 관련 컴포넌트
│   ├── game/               # 2048 게임 컴포넌트
│   └── learn/              # 학습 컴포넌트 (FlashCard, QuizView)
├── contexts/               # React Context
│   └── ThemeContext.tsx    # 다크모드 지원
├── constants/              # 상수 정의
│   ├── colors.ts           # 색상 팔레트
│   ├── sizes.ts            # 크기, 간격, 그림자
│   └── typography.ts       # 타이포그래피
├── services/               # 서비스 레이어
│   ├── hapticService.ts    # 햅틱 피드백
│   ├── soundService.ts     # 사운드
│   ├── notificationService.ts  # 학습 리마인더 알림
│   ├── feedbackService.ts  # 피드백 서비스
│   └── speechService.ts    # 음성 인식/TTS
├── store/                  # Zustand 스토어
│   ├── taskStore.ts        # Todo 상태 관리
│   ├── gameStore.ts        # 2048 게임 상태
│   ├── learnStore.ts       # 학습 진행 상태
│   ├── streakStore.ts      # 스트릭 관리
│   └── userStore.ts        # 사용자 설정
├── utils/                  # 유틸리티
│   ├── backup.ts           # 백업/복원 기능
│   ├── activityLoader.ts   # 학습 콘텐츠 로더
│   └── sentry.ts           # 에러 모니터링
├── hooks/                  # 커스텀 훅
├── assets/                 # 에셋
│   └── animations/         # Lottie JSON 파일
├── patches/                # node_modules 패치 파일
│   └── _ctx.web.js         # expo-router 웹 컨텍스트 패치
├── docs/                   # 문서
│   ├── PROJECT_KNOWLEDGE.md    # 프로젝트 지식 베이스
│   └── backup_instructions.md  # 백업/복원 가이드
└── data/                   # 학습 데이터
    └── activities/         # A1~C2 학습 활동 (288개 파일)
```

### 주요 의존성 (SDK 51)
```json
{
  "expo": "~51.0.0",
  "expo-router": "~3.5.24",
  "zustand": "^5.0.9",
  "react-native-reanimated": "~3.10.1",
  "moti": "^0.30.0",
  "lottie-react-native": "6.7.0",
  "expo-blur": "~13.0.3",
  "expo-haptics": "~13.0.1",
  "expo-speech": "~12.0.2",
  "expo-notifications": "~0.28.0",
  "expo-device": "latest",
  "@react-native-community/datetimepicker": "latest",
  "@sentry/react-native": "^5.22.0",
  "@expo/webpack-config": "latest",
  "@lottiefiles/react-lottie-player": "latest"
}
```

---

## 2. 해결한 문제들 (Troubleshooting)

### 2.1 import.meta 웹 빌드 에러 (해결됨)

**증상**
- 웹에서 빈 화면 표시
- 콘솔: `Cannot use 'import.meta' outside a module`

**원인**
- Expo SDK 54는 웹 빌드에 Metro 번들러 사용
- Metro의 웹 지원이 불안정하고 ESM 호환성 문제 발생
- node_modules의 @eslint/eslintrc 등이 import.meta 사용

**최종 해결책: SDK 51로 다운그레이드**

Expo SDK 51은 웹에서 Webpack 사용을 지원하여 안정적인 웹 빌드 가능!

1. `package.json`에서 expo 버전을 `~51.0.0`으로 변경
2. `npm install --legacy-peer-deps`로 의존성 설치
3. `@expo/webpack-config` 설치
4. `app.json`에서 `bundler: "webpack"` 설정
5. `webpack.config.js` 생성
6. expo-router `_ctx.web.js` 패치

**관련 파일**
- `package.json` - SDK 51 버전
- `app.json` - bundler: webpack 설정
- `webpack.config.js` - crypto fallback 등 설정
- `node_modules/expo-router/_ctx.web.js` - 경로 패치 필요

**핵심 교훈**
> 최신 버전이 항상 좋은 것은 아니다. 웹+앱 크로스플랫폼 지원이 필요하면
> SDK 51처럼 Webpack을 지원하는 안정적인 버전을 사용하자.

---

### 2.2 expo-router Webpack 경로 에러 (해결됨)

**증상**
```
Module not found: Can't resolve '..\..\..\..\..\app'
```

**원인**
- expo-router의 `_ctx.web.js`가 `process.env.EXPO_ROUTER_APP_ROOT` 사용
- Webpack의 `require.context()`는 컴파일 타임에 경로 결정
- 상대 경로가 node_modules 기준으로 해석됨

**해결책: 직접 파일 패치**

`node_modules/expo-router/_ctx.web.js`를 직접 수정:
```javascript
export const ctx = require.context(
  '../../app',  // 절대 경로로 변경
  true,
  /^(?:\.\/)(?!(?:(?:(?:.*\+api)|(?:\+(html|native-intent))))\.[tj]sx?$).*(?:\.android|\.ios|\.native)?\.[tj]sx?$/,
  'sync'
);
```

**주의사항**
- `npm install` 후에 패치 다시 적용 필요
- `.expo` 및 `node_modules/.cache` 삭제 후 재시작
- 향후 `patch-package` 사용 고려

---

### 2.3 TypeScript 에러들

**SIZES.radius not existing**
```typescript
// 해결: sizes.ts에 radius 객체 추가
export const SIZES = {
  radius: { sm: 4, md: 8, lg: 12, xl: 16, xxl: 24, full: 9999 },
}
```

**SHADOWS not exported**
```typescript
// 해결: sizes.ts에 SHADOWS 추가
export const SHADOWS = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, ... },
  md: { ... },
  lg: { ... },
}
```

**withAlpha not exported**
```typescript
// 해결: colors.ts에 함수 추가
export function withAlpha(color: string, alpha: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
```

---

### 2.3 패키지 호환성 문제

**Expo 버전 불일치 경고**
```bash
# 해결 명령어
npx expo install --fix
```

**Lottie 웹 의존성 누락**
```bash
# lottie-react-native 웹 사용 시 필요
npm install @lottiefiles/dotlottie-react
```

---

## 3. 아키텍처 결정 사항

### 3.1 상태 관리: Zustand 선택 이유
- Redux 대비 보일러플레이트 적음
- React 19와 호환성 좋음
- 간단한 API, 학습 곡선 낮음
- 미들웨어 지원 (persist, devtools)

### 3.2 컴포넌트 패턴

**BlurModal**
- expo-blur 기반 모달
- iOS 스타일의 블러 배경
- `onClose` 또는 `onDismiss` prop 지원

**EmptyState**
- 빈 상태 표시 컴포넌트
- Lottie 애니메이션 지원
- `type` prop으로 애니메이션 선택

**SwipeableRow**
- react-native-gesture-handler 기반
- 스와이프하여 삭제/편집 액션

### 3.3 ThemeContext 구조
```typescript
interface ThemeContextValue {
  isDark: boolean;
  themeMode: 'light' | 'dark' | 'system';
  colors: typeof lightColors | typeof darkColors;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}
```

---

## 4. 유용한 패턴과 팁

### 4.1 Reanimated 애니메이션

**슬라이드 애니메이션**
```typescript
const translateX = useSharedValue(0);

useEffect(() => {
  translateX.value = withSpring(targetX, {
    damping: 15,
    stiffness: 150,
  });
}, [targetX]);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: translateX.value }],
}));
```

**3D 플립 애니메이션**
```typescript
const flipProgress = useSharedValue(0);

const frontStyle = useAnimatedStyle(() => {
  const rotateY = interpolate(flipProgress.value, [0, 1], [0, 180]);
  return {
    transform: [{ perspective: 1000 }, { rotateY: `${rotateY}deg` }],
    backfaceVisibility: 'hidden',
  };
});
```

### 4.2 햅틱 피드백 구현

```typescript
// services/hapticService.ts
import * as Haptics from 'expo-haptics';

export const todoHaptics = {
  complete: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  delete: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  add: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
};

export const gameHaptics = {
  tileMove: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  tileMerge: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  gameOver: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
```

### 4.3 Lottie 애니메이션 사용

```typescript
import LottieView from 'lottie-react-native';

<LottieView
  source={require('@/assets/animations/confetti.json')}
  autoPlay
  loop={false}
  style={{ width: 200, height: 200 }}
/>
```

### 4.4 TTS (Text-to-Speech)

```typescript
import * as Speech from 'expo-speech';

const speak = (text: string) => {
  Speech.speak(text, {
    language: 'en-US',
    rate: 0.8,
    pitch: 1.0,
  });
};
```

---

## 5. 개발 환경 설정

### 5.1 필수 설정 파일

**babel.config.js**
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
  };
};
```

**metro.config.js**
```javascript
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// ESLint 등 개발 전용 파일 제외
config.resolver.blockList = [
  /eslint\.config\.mjs$/,
  /\.eslintrc\./,
  /prettier\.config\./,
];

module.exports = config;
```

**.eslintrc.js** (CommonJS 형식 - ESM 대신)
```javascript
module.exports = {
  extends: ['expo', 'prettier'],
  rules: {
    'no-console': 'warn',
    'prefer-const': 'error',
  },
  ignorePatterns: ['node_modules/', '.expo/', 'dist/', 'build/'],
};
```

### 5.2 Webpack 설정 (웹 빌드용)

**webpack.config.js**
```javascript
const createExpoWebpackConfigAsync = require('@expo/webpack-config');
const webpack = require('webpack');
const path = require('path');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(env, argv);

  // Node.js 모듈 폴리필 설정
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: false,
  };

  // app 디렉토리 alias 추가
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': path.resolve(__dirname),
  };

  return config;
};
```

### 5.3 app.json 웹 번들러 설정

```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "webpack"
    }
  }
}
```

### 5.4 ESLint 설정 주의사항
- `eslint.config.mjs` (ESM) 대신 `.eslintrc.js` (CommonJS) 사용
- ESM의 `import.meta.url`이 Metro 웹 번들링에서 문제 발생
- Flat Config 사용 시 웹 빌드 호환성 확인 필요

---

## 6. 자주 사용하는 명령어

```bash
# 개발 서버 시작
npx expo start

# 웹으로 시작 (캐시 클리어)
npx expo start --web --clear

# TypeScript 체크
npx tsc --noEmit

# 패키지 버전 자동 수정
npx expo install --fix

# 웹 빌드 (정적 파일)
npx expo export --platform web

# 안드로이드 빌드
npx expo run:android

# iOS 빌드 (macOS만)
npx expo run:ios
```

---

## 7. 알려진 이슈 & TODO

### 해결된 이슈
- [x] 웹 빌드 시 import.meta 에러 → SDK 51 + Webpack으로 해결
- [x] expo-router Webpack 경로 에러 → _ctx.web.js 패치로 해결
- [x] 분산된 브랜치 통합 → 2025-12-19 완료
- [x] 심리학 시스템 부담 → 제거 완료
- [x] 백업/복원 기능 → 구현 완료
- [x] 상용화 설정 → EAS Build + Sentry 완료

### 알려진 이슈
- [ ] npm install 후 _ctx.web.js 패치 재적용 필요
- [ ] Settings 화면 네비게이션 미연결 (수동 URL 접근만 가능)

### 향후 개선 사항
- [ ] patch-package로 패치 자동화
- [ ] Settings 탭/버튼 추가
- [ ] 서버 푸시 알림 (현재는 로컬 알림만)
- [ ] 위젯 지원
- [ ] C1/C2 음성 녹음 콘텐츠 추가

---

## 8. 브랜치 통합 히스토리

### 8.1 2025-12-19: 전체 브랜치 통합 (Production Ready)

**목표**: 분산된 4개 브랜치를 선택적으로 통합하여 main 브랜치로 병합

**통합 전략**
- 기준 브랜치: `origin/claude/load-recent-commit-V73iw` (가장 안정적, 콘텐츠 풍부)
- 작업 브랜치: `integrate-all-features` (통합 작업용)
- 백업 브랜치: `backup-before-merge` (안전장치)

**통합된 기능**

| 브랜치 | 주요 기능 | 파일 수 | 상태 |
|--------|----------|---------|------|
| V73iw | A1~C2 완전한 학습 콘텐츠, UI 개선 | 220개 | ✅ 통합 |
| codex | 백업/복원 시스템 | 4개 | ✅ 통합 |
| 7vKOB | 학습 리마인더 알림 | 1개 | ✅ 부분 통합 |
| cPmvt | EAS Build + Sentry 설정 | 3개 | ✅ 통합 |

**제거된 기능 (사용자 부담 완화)**
- ❌ 심리학 시스템 (XP, Combo, 진행률 압박)
  - DailyGoalProgress 컴포넌트
  - StreakWarning 컴포넌트
  - XPPopup 컴포넌트
  - ComboIndicator 컴포넌트
  - SessionCompleteModal 컴포넌트
- ❌ 스트릭 경고 알림 (부담스러운 푸시)
- ❌ 축하 알림 (스트릭과 강하게 결합)

**통합 단계**

**Phase 0: 사전 준비**
```bash
git branch backup-before-merge
git checkout -b integrate-all-features
```

**Phase 1: V73iw 기준 병합**
- 220개 파일 병합
- A1~C2 완전한 학습 콘텐츠 포함 (C1/C2는 이미 V73iw에 포함)
- TypeScript 에러 0개 확인

**Phase 2: 백업 시스템 통합**
- `utils/backup.ts` - AsyncStorage 백업/복원
- `app/settings.tsx` - 설정 화면
- `constants/storage.ts` - 스토리지 키 정의 (8개 키)
- `docs/backup_instructions.md` - 사용자 가이드
- 의존성 추가: expo-notifications, expo-device, @react-native-community/datetimepicker, @sentry/react-native

**Phase 3: C1/C2 데이터**
- V73iw에 이미 포함되어 자동 완료
- 96개 활동 파일 (grammar, listening, reading, speaking, writing, vocabulary × 8주)

**Phase 4: 심리학 시스템 제거**
- 5개 컴포넌트 삭제 (1,994줄 삭제)
- `notificationService.ts`에서 스트릭 경고 로직 제거
- VocabularyView, QuizView, AnswerFeedback 단순화
- 학습 리마인더 기능만 유지

**Phase 5: 상용화 설정 통합**
- `app.json` 수정:
  - iOS: NSSpeechRecognitionUsageDescription 추가
  - Android: SCHEDULE_EXACT_ALARM 권한 추가
  - Sentry 플러그인 추가
  - expo-notifications 플러그인 설정
  - EAS project ID 설정
- `eas.json`, `utils/sentry.ts` 확인

**Phase 6: 통합 검증**
- TypeScript 에러: 0개
- ESLint 경고: 일부 있으나 모두 허용 가능 수준
- 빌드 준비 완료

**최종 결과**
```
232 files changed
89,505 insertions(+)
2,236 deletions(-)
```

**병합 커밋**
```bash
git checkout main
git merge integrate-all-features --no-ff
git push origin main
```

**주요 파일 변경**
- `app.json` - 상용화 설정 추가
- `constants/storage.ts` - 8개 스토리지 키 정의
- `services/notificationService.ts` - 학습 리마인더만 유지
- `components/learn/*` - 심리학 요소 제거
- `data/activities/c1/**` - 48개 C1 활동 파일
- `data/activities/c2/**` - 48개 C2 활동 파일

**프로젝트 철학 유지**
- ✅ 품질 우선 (Quality over speed)
- ✅ 부담 없는 앱 (No pressure)
- ✅ 코드 품질 최우선 (Code quality first)
- ✅ TypeScript strict mode
- ✅ 테스트 통과

**앱 배포 준비 완료**
- ✅ EAS Build 설정 완료
- ✅ Sentry 에러 모니터링 준비
- ✅ 앱 스토어 제출을 위한 권한 설정 완료
- ✅ 중간점검 배포 준비 완료

---

## 9. 참고 자료

- [Expo 문서](https://docs.expo.dev/)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [Moti](https://moti.fyi/)
- [Lottie](https://airbnb.io/lottie/)

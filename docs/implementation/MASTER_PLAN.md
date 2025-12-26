# whatTodo 개선 마스터 플랜

**작성 일자**: 2025-12-24
**작성자**: Claude (Release Manager)
**총 예상 기간**: 6-8주
**목표**: 안정적이고 사용자 친화적인 프로덕션 앱

---

## 📋 전체 구조

이 플랜은 4개의 Phase로 구성됩니다:

- **Phase 1**: 안정성 확보 (1-2주) - 테스트, 에러 처리, 모니터링
- **Phase 2**: 코드 품질 (1주) - TypeScript, ESLint, 리팩토링
- **Phase 3**: UX 개선 (2-3주) - 백업, 통계, 온보딩
- **Phase 4**: 고급 기능 (2주) - 이미지 캐싱, 다크모드

각 Phase는 독립적으로 완료 가능하며, 다음 Phase로 넘어가기 전 반드시 완료 기준을 충족해야 합니다.

---

## 🎯 Phase 1: 안정성 확보 (1-2주)

### 목표
프로덕션 배포를 위한 최소 안정성 확보

### 완료 기준
- [ ] 최소 30개 테스트 통과
- [ ] 모든 에러 메시지 사용자 친화적
- [ ] Sentry에서 크래시 추적 확인
- [ ] TypeScript 오류 0개

### 상세 계획

폴더: `docs/implementation/phase-1-stability/`

#### Task 1.1: 테스트 환경 구축 (예상 4시간)

**파일 생성**:
```
__tests__/
├── setup.ts
├── utils/
│   ├── srs.test.ts
│   └── backup.test.ts
├── store/
│   └── taskStore.test.ts
└── components/
    └── todo/TaskItem.test.tsx

jest.config.js
```

**설치 패키지**:
```bash
npm install --save-dev \
  jest \
  @testing-library/react-native \
  @testing-library/jest-native \
  @types/jest
```

**jest.config.js 내용**:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)'
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/.expo/**',
  ],
};
```

**package.json 스크립트 추가**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

**변경 추적**: `phase-1-stability/CHANGES.md`에 기록

---

#### Task 1.2: Critical Path 테스트 작성 (예상 1주)

**우선순위 1: SRS 알고리즘** (utils/srs.test.ts)

가장 중요! 잘못되면 사용자 학습 데이터 망가짐.

```typescript
// __tests__/utils/srs.test.ts
import { calculateSrsData, getSrsStatus } from '@/utils/srs';

describe('SRS Algorithm (SM-2)', () => {
  describe('calculateSrsData', () => {
    it('첫 복습에서 quality 5 -> interval 1일', () => {
      const result = calculateSrsData(
        {
          repetitions: 0,
          easeFactor: 2.5,
          interval: 0,
          nextReviewDate: new Date(),
        },
        5
      );

      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
      expect(result.easeFactor).toBe(2.6); // 2.5 + 0.1
    });

    it('두 번째 복습에서 quality 4 -> interval 6일', () => {
      const result = calculateSrsData(
        {
          repetitions: 1,
          easeFactor: 2.5,
          interval: 1,
          nextReviewDate: new Date(),
        },
        4
      );

      expect(result.interval).toBe(6);
      expect(result.repetitions).toBe(2);
    });

    it('quality 3 미만이면 repetitions 리셋', () => {
      const result = calculateSrsData(
        {
          repetitions: 5,
          easeFactor: 2.5,
          interval: 30,
          nextReviewDate: new Date(),
        },
        2
      );

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('easeFactor는 1.3 아래로 내려가지 않음', () => {
      let srsData = {
        repetitions: 0,
        easeFactor: 1.4,
        interval: 0,
        nextReviewDate: new Date(),
      };

      // quality 0으로 여러 번 실패
      for (let i = 0; i < 10; i++) {
        srsData = calculateSrsData(srsData, 0);
      }

      expect(srsData.easeFactor).toBeGreaterThanOrEqual(1.3);
    });
  });

  describe('getSrsStatus', () => {
    it('복습 기한 지나면 "due" 반환', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const status = getSrsStatus(yesterday.toISOString());
      expect(status).toBe('due');
    });

    it('오늘 복습이면 "today" 반환', () => {
      const today = new Date().toISOString();
      const status = getSrsStatus(today);
      expect(status).toBe('today');
    });

    it('미래면 "future" 반환', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const status = getSrsStatus(tomorrow.toISOString());
      expect(status).toBe('future');
    });
  });
});
```

**예상 테스트 수**: 10-15개

---

**우선순위 2: 백업/복원** (utils/backup.test.ts)

데이터 손실 방지!

```typescript
// __tests__/utils/backup.test.ts
import { exportBackup, importBackup } from '@/utils/backup';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn(),
}));

describe('백업 시스템', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('exportBackup', () => {
    it('모든 8개 store를 export해야 함', async () => {
      const backup = await exportBackup();

      expect(backup).toHaveProperty('taskStore');
      expect(backup).toHaveProperty('learnStore');
      expect(backup).toHaveProperty('srsStore');
      expect(backup).toHaveProperty('rewardStore');
      expect(backup).toHaveProperty('streakStore');
      expect(backup).toHaveProperty('gameStore');
      expect(backup).toHaveProperty('userStore');
      expect(backup).toHaveProperty('journalStore');
    });

    it('백업 데이터에 버전 정보 포함', async () => {
      const backup = await exportBackup();

      expect(backup).toHaveProperty('version');
      expect(backup).toHaveProperty('timestamp');
    });
  });

  describe('importBackup', () => {
    it('유효한 백업 데이터면 성공', async () => {
      const validBackup = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        taskStore: { tasks: [] },
        learnStore: { currentWeek: 'week-1' },
        srsStore: { words: [] },
        rewardStore: { stars: 100 },
        streakStore: { currentStreak: 5 },
        gameStore: { bestScore: 2048 },
        userStore: { name: 'test' },
        journalStore: { entries: [] },
      };

      await expect(importBackup(validBackup)).resolves.not.toThrow();
    });

    it('잘못된 백업 데이터면 에러', async () => {
      const invalidBackup = { invalid: 'data' };

      await expect(importBackup(invalidBackup as any)).rejects.toThrow();
    });

    it('버전 호환성 체크', async () => {
      const oldVersionBackup = {
        version: '0.1',  // 너무 오래된 버전
        taskStore: {},
      };

      await expect(importBackup(oldVersionBackup as any)).rejects.toThrow(
        /version/i
      );
    });
  });
});
```

**예상 테스트 수**: 8-10개

---

**우선순위 3: 할일 로직** (store/taskStore.test.ts)

```typescript
// __tests__/store/taskStore.test.ts
import { useTaskStore } from '@/store/taskStore';
import { renderHook, act } from '@testing-library/react-hooks';

describe('taskStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useTaskStore());
    act(() => {
      result.current.tasks = [];
    });
  });

  it('할일 추가', () => {
    const { result } = renderHook(() => useTaskStore());

    act(() => {
      result.current.addTask({
        title: '테스트 작성',
        priority: 'high',
        dueDate: new Date().toISOString(),
      });
    });

    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('테스트 작성');
    expect(result.current.tasks[0].completed).toBe(false);
  });

  it('할일 완료 시 별 획득', () => {
    const { result } = renderHook(() => useTaskStore());
    const { result: rewardResult } = renderHook(() => useRewardStore());

    const initialStars = rewardResult.current.stars;

    act(() => {
      const taskId = result.current.addTask({
        title: '긴급 작업',
        priority: 'urgent',
      });

      result.current.toggleTask(taskId);
    });

    expect(result.current.tasks[0].completed).toBe(true);
    expect(rewardResult.current.stars).toBeGreaterThan(initialStars);
  });

  it('우선순위별 별 차등 지급', () => {
    const { result: rewardResult } = renderHook(() => useRewardStore());

    const initialStars = rewardResult.current.stars;

    // urgent: 50 stars
    act(() => {
      rewardResult.current.earnStars(50, 'urgent');
    });

    expect(rewardResult.current.stars).toBe(initialStars + 50);
  });
});
```

**예상 테스트 수**: 5-8개

---

#### Task 1.3: 에러 처리 개선 (예상 3일)

**Step 1: ErrorHandler 유틸 작성**

**파일 생성**: `utils/errorHandler.ts`

```typescript
/**
 * 에러 처리 유틸리티
 *
 * 사용자 친화적인 에러 메시지 생성 및 Sentry 연동
 *
 * @example
 * try {
 *   await importBackup(data);
 * } catch (error) {
 *   showUserFriendlyError(error, '백업 복원');
 * }
 */

import { Alert } from 'react-native';
import { captureError } from './sentry';

export class AppError extends Error {
  constructor(
    public userMessage: string,
    public developerMessage: string,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(developerMessage);
    this.name = 'AppError';
  }
}

/**
 * 사용자 친화적 에러 메시지 표시
 */
export const showUserFriendlyError = (
  error: unknown,
  operation: string = '작업'
) => {
  let title = `${operation} 실패`;
  let message = '다시 시도해주세요.';
  let devMessage = String(error);

  // AppError - 개발자가 정의한 에러
  if (error instanceof AppError) {
    title = error.userMessage.split(':')[0] || title;
    message = error.userMessage;
    devMessage = error.developerMessage;
  }
  // SyntaxError - JSON 파싱 실패 (백업 복원에서 자주 발생)
  else if (error instanceof SyntaxError) {
    title = '잘못된 형식';
    message = '백업 파일 형식이 올바르지 않습니다.\n처음부터 다시 내보내기를 해주세요.';
  }
  // Network Error
  else if (error instanceof TypeError && error.message.includes('fetch')) {
    title = '네트워크 오류';
    message = '인터넷 연결을 확인해주세요.';
  }
  // Storage Error
  else if (String(error).includes('AsyncStorage')) {
    title = '저장 공간 오류';
    message = '기기 저장 공간을 확인해주세요.';
  }

  // 사용자에게 표시
  Alert.alert(title, message, [{ text: '확인' }]);

  // Sentry에 상세 정보 전송 (프로덕션에서만)
  if (!__DEV__) {
    captureError(error as Error, {
      operation,
      userMessage: title,
      timestamp: new Date().toISOString(),
    });
  } else {
    // 개발 환경에서는 콘솔에 출력
    console.error(`[${operation}]`, devMessage, error);
  }
};

/**
 * 백업 관련 에러
 */
export class BackupError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      `백업 오류: ${message}`,
      message,
      'BACKUP_ERROR',
      context
    );
  }
}

/**
 * 학습 관련 에러
 */
export class LearningError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(
      `학습 오류: ${message}`,
      message,
      'LEARNING_ERROR',
      context
    );
  }
}
```

**변경 추적**: `CHANGES.md`에 "utils/errorHandler.ts 신규 생성" 기록

---

**Step 2: 기존 코드 수정**

**수정 파일**: `app/settings.tsx`

```typescript
// Before (Line 41-47)
const handleImport = async () => {
  try {
    const parsed = JSON.parse(backupText);
    await importBackup(parsed);
    Alert.alert('성공', '백업을 복원했습니다.');
  } catch (error) {
    Alert.alert('복원 실패', (error as Error).message);  // ❌
  }
};

// After
import { showUserFriendlyError } from '@/utils/errorHandler';

const handleImport = async () => {
  try {
    const parsed = JSON.parse(backupText);
    await importBackup(parsed);
    Alert.alert('✅ 성공', '백업을 복원했습니다.');
  } catch (error) {
    showUserFriendlyError(error, '백업 복원');  // ✅
  }
};
```

**파일 상단에 주석 추가**:
```typescript
/**
 * Settings Screen
 *
 * @changed 2025-12-24 - Phase 1.3: 에러 처리 개선
 *   - showUserFriendlyError 적용
 *   - 사용자 친화적 메시지로 변경
 */
```

**수정할 파일 목록** (grep으로 찾기):
```bash
grep -r "Alert.alert.*error" --include="*.tsx" app/
```

예상:
- app/settings.tsx
- app/level-test.tsx
- app/review.tsx
- components/learn/*.tsx (5-8개 파일)

**변경 추적**: `CHANGES.md`에 각 파일 기록

---

**Step 3: ErrorBoundary 추가**

**파일 생성**: `components/common/ErrorBoundary.tsx`

```typescript
/**
 * Error Boundary Component
 *
 * 컴포넌트 에러 시 앱 전체 크래시 방지
 *
 * @usage
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 */

import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { captureError } from '@/utils/sentry';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Sentry에 보고
    captureError(error, {
      componentStack: errorInfo.componentStack,
      errorBoundary: true,
    });

    // 개발 환경에서는 콘솔 출력
    if (__DEV__) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 있으면 사용
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // 기본 에러 화면
      return (
        <View style={styles.container}>
          <Text style={styles.title}>앗! 문제가 발생했습니다</Text>
          <Text style={styles.message}>
            일시적인 오류입니다.{'\n'}
            앱을 다시 시작해주세요.
          </Text>

          {__DEV__ && this.state.error && (
            <Text style={styles.devError}>
              {this.state.error.toString()}
            </Text>
          )}

          <Button
            title="다시 시도"
            onPress={this.handleReset}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    lineHeight: 24,
  },
  devError: {
    fontSize: 12,
    color: 'red',
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#ffe0e0',
    fontFamily: 'monospace',
  },
});
```

**적용**: `app/_layout.tsx`에 추가

```typescript
import { ErrorBoundary } from '@/components/common/ErrorBoundary';

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <Stack>
        {/* ... */}
      </Stack>
    </ErrorBoundary>
  );
}
```

---

#### Task 1.4: Sentry 설정 (예상 30분)

**Step 1: .env 파일 생성**

```bash
# .env
EXPO_PUBLIC_SENTRY_DSN=https://your-key@o123456.ingest.sentry.io/7890123
```

**.gitignore에 추가** (이미 있을 수 있음):
```
.env
.env.local
```

**Step 2: utils/sentry.ts 확인 및 수정**

현재 파일 읽고 개선사항 확인

**Step 3: Sentry 대시보드 설정**
1. sentry.io 접속
2. 프로젝트 생성 (whatTodo-mobile)
3. DSN 복사
4. .env에 붙여넣기

**Step 4: 테스트**

```typescript
// 개발 환경에서 테스트
import { captureError } from '@/utils/sentry';

try {
  throw new Error('Test Sentry');
} catch (error) {
  captureError(error as Error, { test: true });
}
```

Sentry 대시보드에서 확인

---

### Phase 1 완료 체크리스트

**진행 상황**: `phase-1-stability/PROGRESS.md`

```markdown
# Phase 1 진행 상황

## Task 1.1: 테스트 환경 구축
- [ ] jest, testing-library 설치
- [ ] jest.config.js 작성
- [ ] package.json 스크립트 추가
- [ ] __tests__/setup.ts 작성

## Task 1.2: 테스트 작성
- [ ] utils/srs.test.ts (10개 이상)
- [ ] utils/backup.test.ts (8개 이상)
- [ ] store/taskStore.test.ts (5개 이상)
- [ ] 모든 테스트 통과 확인

## Task 1.3: 에러 처리
- [ ] utils/errorHandler.ts 작성
- [ ] app/settings.tsx 수정
- [ ] 다른 파일들 수정 (5-8개)
- [ ] ErrorBoundary 작성 및 적용

## Task 1.4: Sentry
- [ ] .env 파일 생성
- [ ] DSN 설정
- [ ] 테스트 에러 전송 확인

## 완료 기준 체크
- [ ] npm test 실행 시 30개 이상 테스트 통과
- [ ] TypeScript 오류 0개
- [ ] 모든 Alert.alert에 사용자 친화적 메시지
- [ ] Sentry에서 테스트 에러 확인됨
```

### Phase 1 변경 파일 목록

**문서**: `phase-1-stability/CHANGES.md`

```markdown
# Phase 1 변경 파일 목록

## 신규 파일
- __tests__/setup.ts
- __tests__/utils/srs.test.ts
- __tests__/utils/backup.test.ts
- __tests__/store/taskStore.test.ts
- jest.config.js
- utils/errorHandler.ts
- components/common/ErrorBoundary.tsx
- .env (git에 커밋 안 함)

## 수정 파일
- package.json (scripts, devDependencies)
- app/_layout.tsx (ErrorBoundary 추가)
- app/settings.tsx (에러 처리 개선)
- app/level-test.tsx (에러 처리 개선)
- app/review.tsx (에러 처리 개선)
- utils/sentry.ts (개선)
- .gitignore (.env 추가)

## 각 파일 변경 이유
| 파일 | 변경 내용 | 이유 |
|------|-----------|------|
| jest.config.js | 신규 생성 | 테스트 환경 구축 |
| utils/errorHandler.ts | 신규 생성 | 사용자 친화적 에러 메시지 |
| app/settings.tsx | showUserFriendlyError 적용 | 백업 복원 시 에러 UX 개선 |
| ... | ... | ... |
```

---

## 🎯 Phase 2: 코드 품질 (1주)

### 목표
코드 품질 개선 및 기술 부채 해결

### 완료 기준
- [ ] TypeScript 오류 0개 유지
- [ ] ESLint 경고 10개 이하
- [ ] 중복 코드 제거
- [ ] 큰 파일 리팩토링

### 상세 계획

폴더: `docs/implementation/phase-2-quality/`

#### Task 2.1: TypeScript 오류 수정 (30분)

**파일 1**: `constants/sizes.ts`

```typescript
// Line 18-24
borderRadius: {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,  // 👈 추가
  full: 9999,
},
```

**파일 2**: `tsconfig.json`

Option A: jest 제거 (테스트는 Phase 1에서 설치했으므로)
```json
{
  "compilerOptions": {
    "types": ["react-native"]  // "jest" 제거
  }
}
```

Option B: jest 타입 설치
```bash
npm install --save-dev @types/jest
```

**검증**:
```bash
npm run typecheck  # 오류 0개 확인
```

---

#### Task 2.2: ESLint 경고 정리 (1일)

**Step 1: console.log 제거/조건부 처리**

```bash
# 모든 console.log 찾기
grep -rn "console.log" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

**수정 방법**:
```typescript
// Before
console.log('User data:', userData);

// After - 개발 환경에서만
if (__DEV__) {
  console.log('[Debug] User data:', userData);
}

// Or - 중요한 로그는 Sentry breadcrumb로
import * as Sentry from '@sentry/react-native';

Sentry.addBreadcrumb({
  category: 'user',
  message: 'User data loaded',
  level: 'info',
  data: { userId: userData.id },
});
```

**Step 2: Unused imports 제거**

ESLint가 찾아준 파일들:
- store/journalStore.ts:14 - DifficultyRating
- store/journalStore.ts:18 - Mood
- store/learnStore.ts:7 - Activity

각 파일 열어서 실제로 사용 안 하면 삭제

**Step 3: static-server.js 수정**

```javascript
// Before
const path = require('path');
const rootDir = __dirname;  // ❌ __dirname not defined

// After
const path = require('path');
const rootDir = process.cwd();  // ✅ 또는 적절한 경로
```

**목표**: ESLint 경고 68개 → 10개 이하

---

#### Task 2.3: journal/diary Store 통합 (2-3시간)

**조사**:
1. journalStore.ts 읽기
2. diaryStore.ts 읽기
3. 차이점 파악
4. 사용처 찾기

```bash
grep -r "journalStore" --include="*.tsx" app/
grep -r "diaryStore" --include="*.tsx" app/
```

**통합 계획**:
- journalStore를 메인으로 유지 (더 완성도 높아 보이면)
- diaryStore 삭제
- 모든 사용처를 journalStore로 변경

**변경 파일**:
- store/diaryStore.ts (삭제)
- store/index.ts (diaryStore export 제거)
- 사용하는 컴포넌트들 (import 변경)

---

#### Task 2.4: WritingFeedback 리팩토링 (1-2일)

**현재**: 1,107줄 (너무 큼!)

**목표**: 300줄 이하로 분리

**분리 계획**:
```
components/learn/
├── WritingFeedback.tsx (메인, 300줄)
├── feedback/
│   ├── FeedbackSection.tsx
│   ├── GrammarSuggestion.tsx
│   ├── VocabularySuggestion.tsx
│   ├── StructureFeedback.tsx
│   └── ScoreDisplay.tsx
```

**Step 1**: 파일 읽고 구조 파악
**Step 2**: 독립적인 섹션 식별
**Step 3**: 새 컴포넌트로 분리
**Step 4**: 테스트 (기능 동일한지 확인)

---

### Phase 2 완료 체크리스트

`phase-2-quality/PROGRESS.md`

```markdown
# Phase 2 진행 상황

## Task 2.1: TypeScript
- [ ] constants/sizes.ts (xxl 추가)
- [ ] tsconfig.json (jest 처리)
- [ ] npm run typecheck 통과

## Task 2.2: ESLint
- [ ] console.log 정리 (40개+)
- [ ] unused imports 제거
- [ ] static-server.js 수정
- [ ] ESLint 경고 10개 이하 달성

## Task 2.3: Store 통합
- [ ] journalStore vs diaryStore 조사
- [ ] 통합 계획 수립
- [ ] 파일 수정
- [ ] diaryStore 삭제

## Task 2.4: 리팩토링
- [ ] WritingFeedback 분석
- [ ] 컴포넌트 분리
- [ ] 테스트 (기능 동일)

## 완료 기준
- [ ] TypeScript 오류 0개
- [ ] ESLint 경고 10개 이하
- [ ] 중복 store 제거
- [ ] WritingFeedback 300줄 이하
```

---

## 🎯 Phase 3: UX 개선 (2-3주)

### 목표
사용자 경험 대폭 개선

### 완료 기준
- [ ] 백업 파일로 저장/불러오기
- [ ] 자동 백업 작동
- [ ] 학습 통계 대시보드 추가
- [ ] 온보딩 플로우 완성

### 상세 계획

폴더: `docs/implementation/phase-3-ux/`

#### Task 3.1: 백업 UX 개선 (1주)

**Step 1: 패키지 설치**
```bash
npx expo install expo-document-picker expo-file-system expo-sharing
```

**Step 2: utils/backup.ts 확장**

```typescript
/**
 * 백업 파일 저장
 *
 * @returns 저장된 파일 경로
 */
export const saveBackupToFile = async (): Promise<string> => {
  const backup = await exportBackup();
  const json = JSON.stringify(backup, null, 2);

  const date = new Date().toISOString().split('T')[0];
  const filename = `whatTodo-백업-${date}.json`;
  const uri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(uri, json);
  await shareAsync(uri, {
    mimeType: 'application/json',
    dialogTitle: '백업 파일 저장',
  });

  return uri;
};

/**
 * 백업 파일 불러오기
 */
export const loadBackupFromFile = async (): Promise<BackupSnapshot | null> => {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true,
  });

  if (result.type === 'cancel') {
    return null;
  }

  const content = await FileSystem.readAsStringAsync(result.uri);
  const backup = JSON.parse(content);

  // 검증
  if (!backup.version || !backup.timestamp) {
    throw new BackupError('유효하지 않은 백업 파일입니다.');
  }

  return backup;
};
```

**Step 3: UI 수정** (app/settings.tsx)

```tsx
const handleExportFile = async () => {
  try {
    setLoading(true);
    const filePath = await saveBackupToFile();
    Alert.alert('✅ 성공', `백업 파일이 저장되었습니다.\n${filePath}`);
  } catch (error) {
    showUserFriendlyError(error, '백업 저장');
  } finally {
    setLoading(false);
  }
};

const handleImportFile = async () => {
  try {
    setLoading(true);
    const backup = await loadBackupFromFile();

    if (!backup) {
      return; // 사용자가 취소
    }

    await importBackup(backup);
    Alert.alert('✅ 성공', '백업을 복원했습니다.');
  } catch (error) {
    showUserFriendlyError(error, '백업 복원');
  } finally {
    setLoading(false);
  }
};

// UI
<Button onPress={handleExportFile}>파일로 저장</Button>
<Button onPress={handleImportFile}>파일에서 불러오기</Button>
```

**Step 4: 자동 백업**

**파일 생성**: `services/autoBackup.ts`

```typescript
/**
 * 자동 백업 서비스
 *
 * 매일 자동으로 백업, 최근 3개 유지
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportBackup } from '@/utils/backup';

const AUTO_BACKUP_KEY = 'auto-backup-last';
const AUTO_BACKUP_PREFIX = 'auto-backup-';
const AUTO_BACKUP_INTERVAL = 24 * 60 * 60 * 1000; // 24시간
const MAX_AUTO_BACKUPS = 3;

/**
 * 자동 백업 실행
 */
export const runAutoBackup = async () => {
  const now = Date.now();
  const lastBackup = await AsyncStorage.getItem(AUTO_BACKUP_KEY);

  // 24시간 이내면 스킵
  if (lastBackup && now - parseInt(lastBackup) < AUTO_BACKUP_INTERVAL) {
    return;
  }

  // 백업 실행
  const backup = await exportBackup();
  const key = `${AUTO_BACKUP_PREFIX}${now}`;

  await AsyncStorage.setItem(key, JSON.stringify(backup));
  await AsyncStorage.setItem(AUTO_BACKUP_KEY, now.toString());

  // 오래된 백업 삭제 (최근 3개만 유지)
  await cleanOldBackups();
};

/**
 * 오래된 자동 백업 삭제
 */
const cleanOldBackups = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(AUTO_BACKUP_PREFIX))
    .sort()
    .reverse(); // 최신순

  // 3개 넘으면 삭제
  if (backupKeys.length > MAX_AUTO_BACKUPS) {
    const keysToDelete = backupKeys.slice(MAX_AUTO_BACKUPS);
    await AsyncStorage.multiRemove(keysToDelete);
  }
};

/**
 * 자동 백업 목록 가져오기
 */
export const getAutoBackups = async () => {
  const allKeys = await AsyncStorage.getAllKeys();
  const backupKeys = allKeys
    .filter((key) => key.startsWith(AUTO_BACKUP_PREFIX))
    .sort()
    .reverse();

  const backups = await Promise.all(
    backupKeys.map(async (key) => {
      const data = await AsyncStorage.getItem(key);
      const timestamp = parseInt(key.replace(AUTO_BACKUP_PREFIX, ''));
      return {
        key,
        timestamp,
        date: new Date(timestamp).toLocaleDateString('ko-KR'),
        data: data ? JSON.parse(data) : null,
      };
    })
  );

  return backups;
};
```

**적용**: `app/_layout.tsx`에서 앱 시작 시 호출

```typescript
import { runAutoBackup } from '@/services/autoBackup';

useEffect(() => {
  // 앱 시작 시 자동 백업 체크
  runAutoBackup().catch(console.error);
}, []);
```

---

#### Task 3.2: 학습 통계 대시보드 (1주)

**화면 생성**: `app/(tabs)/stats.tsx`

```tsx
/**
 * 학습 통계 화면
 *
 * - 주간/월간 학습 시간
 * - 레벨별 진행률
 * - SRS 복습 성공률
 * - 취약 영역 분석
 */

import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useRewardStore } from '@/store/rewardStore';

export default function StatsScreen() {
  const { weekProgress, currentLevel } = useLearnStore();
  const { reviewStats, words } = useSrsStore();
  const { streak, totalStarsEarned } = useRewardStore();

  // 레벨별 진행률 계산
  const levelProgress = {
    A1: calculateProgress('A1', weekProgress),
    A2: calculateProgress('A2', weekProgress),
    B1: calculateProgress('B1', weekProgress),
    B2: calculateProgress('B2', weekProgress),
    C1: calculateProgress('C1', weekProgress),
    C2: calculateProgress('C2', weekProgress),
  };

  // SRS 성공률
  const srsSuccessRate =
    reviewStats.totalReviews > 0
      ? (reviewStats.correctReviews / reviewStats.totalReviews) * 100
      : 0;

  // 취약 영역 분석
  const weakAreas = analyzeWeakAreas(weekProgress);

  return (
    <ScrollView style={styles.container}>
      {/* 전체 진행률 */}
      <Card>
        <Title>전체 진행률</Title>
        <ProgressCircle
          progress={calculateOverallProgress(levelProgress)}
          size={120}
        />
      </Card>

      {/* 레벨별 진행률 */}
      <Card>
        <Title>레벨별 진행률</Title>
        {Object.entries(levelProgress).map(([level, progress]) => (
          <ProgressBar
            key={level}
            label={level}
            progress={progress}
            color={getLevelColor(level)}
          />
        ))}
      </Card>

      {/* SRS 통계 */}
      <Card>
        <Title>복습 통계</Title>
        <StatRow
          label="총 복습 횟수"
          value={reviewStats.totalReviews}
        />
        <StatRow
          label="성공률"
          value={`${srsSuccessRate.toFixed(1)}%`}
        />
        <StatRow
          label="마스터한 단어"
          value={words.filter((w) => w.srsData.repetitions >= 5).length}
        />
      </Card>

      {/* 취약 영역 */}
      {weakAreas.length > 0 && (
        <Card>
          <Title>개선이 필요한 영역</Title>
          {weakAreas.map((area) => (
            <WeakAreaItem key={area.type} area={area} />
          ))}
        </Card>
      )}

      {/* 스트릭 & 별 */}
      <Card>
        <Title>성취</Title>
        <StatRow label="연속 학습" value={`${streak}일 🔥`} />
        <StatRow label="총 획득 별" value={`${totalStarsEarned} ⭐`} />
      </Card>
    </ScrollView>
  );
}
```

**컴포넌트 생성**:
- `components/stats/ProgressCircle.tsx`
- `components/stats/ProgressBar.tsx`
- `components/stats/StatRow.tsx`
- `components/stats/WeakAreaItem.tsx`

---

#### Task 3.3: 온보딩 플로우 (3일)

**화면 생성**: `app/onboarding.tsx`

```tsx
/**
 * 온보딩 화면
 *
 * 첫 실행 시 표시
 */

import { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/userStore';

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const { setOnboardingCompleted } = useUserStore();

  const steps = [
    {
      title: 'whatTodo에 오신 걸 환영합니다! 🎉',
      description: 'Todo 완료로 영어를 마스터하세요',
      image: require('@/assets/onboarding-1.png'),
    },
    {
      title: '할 일을 완료하면',
      description: '별을 획득하고 영어 학습을 잠금 해제',
      image: require('@/assets/onboarding-2.png'),
    },
    {
      title: '과학적 학습법',
      description: 'SM-2 알고리즘으로 효율적인 복습',
      image: require('@/assets/onboarding-3.png'),
    },
    {
      title: '레벨 테스트를 진행할까요?',
      description: '자신에게 맞는 레벨을 찾으세요',
      action: true,
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    setOnboardingCompleted(true);
    router.replace('/(tabs)');
  };

  const handleStartTest = () => {
    setOnboardingCompleted(true);
    router.replace('/level-test');
  };

  const currentStep = steps[step];

  return (
    <View style={styles.container}>
      {currentStep.image && (
        <Image source={currentStep.image} style={styles.image} />
      )}

      <Text style={styles.title}>{currentStep.title}</Text>
      <Text style={styles.description}>{currentStep.description}</Text>

      <View style={styles.buttons}>
        {currentStep.action ? (
          <>
            <Button title="레벨 테스트 시작" onPress={handleStartTest} />
            <Button title="건너뛰기" onPress={handleSkip} />
          </>
        ) : (
          <>
            <Button title="다음" onPress={handleNext} />
            <Button title="건너뛰기" onPress={handleSkip} />
          </>
        )}
      </View>

      {/* 페이지 인디케이터 */}
      <View style={styles.indicator}>
        {steps.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === step && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}
```

**userStore에 추가**:
```typescript
interface UserState {
  // ... 기존 필드
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
}
```

**app/_layout.tsx에서 체크**:
```typescript
const { onboardingCompleted } = useUserStore();

useEffect(() => {
  if (!onboardingCompleted) {
    router.replace('/onboarding');
  }
}, [onboardingCompleted]);
```

---

### Phase 3 완료 체크리스트

`phase-3-ux/PROGRESS.md`

```markdown
# Phase 3 진행 상황

## Task 3.1: 백업 UX
- [ ] expo-document-picker 등 설치
- [ ] saveBackupToFile 구현
- [ ] loadBackupFromFile 구현
- [ ] UI 수정 (settings.tsx)
- [ ] autoBackup 서비스 작성
- [ ] _layout.tsx에 자동 백업 적용
- [ ] 테스트 (파일 저장/불러오기)

## Task 3.2: 학습 통계
- [ ] app/(tabs)/stats.tsx 작성
- [ ] ProgressCircle 컴포넌트
- [ ] ProgressBar 컴포넌트
- [ ] 레벨별 진행률 계산 로직
- [ ] 취약 영역 분석 로직

## Task 3.3: 온보딩
- [ ] app/onboarding.tsx 작성
- [ ] userStore에 onboardingCompleted 추가
- [ ] _layout.tsx에서 온보딩 체크
- [ ] 온보딩 이미지 준비

## 완료 기준
- [ ] 백업 파일로 저장/불러오기 작동
- [ ] 자동 백업 매일 실행 확인
- [ ] 통계 화면 표시
- [ ] 온보딩 플로우 완성
```

---

## 🎯 Phase 4: 고급 기능 (2주)

### 목표
사용자 경험 완성도 높이기

### 완료 기준
- [ ] 이미지 오프라인 캐싱
- [ ] 다크 모드 지원
- [ ] Analytics 연동

### 상세 계획

폴더: `docs/implementation/phase-4-advanced/`

#### Task 4.1: 이미지 캐싱 (1주)

**파일 생성**: `services/imageCache.ts`

```typescript
/**
 * 이미지 캐싱 서비스
 *
 * Unsplash URL을 로컬에 캐싱
 */

import * as FileSystem from 'expo-file-system';
import { createHash } from 'crypto';

const CACHE_DIR = FileSystem.cacheDirectory + 'images/';

// 캐시 디렉토리 생성
const ensureCacheDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
};

/**
 * 이미지 URL의 캐시된 로컬 경로 가져오기
 */
export const getCachedImageUri = async (url: string): Promise<string> => {
  await ensureCacheDir();

  // URL을 해시하여 파일명 생성
  const hash = createHash('md5').update(url).digest('hex');
  const extension = url.split('.').pop()?.split('?')[0] || 'jpg';
  const filename = `${hash}.${extension}`;
  const localUri = CACHE_DIR + filename;

  // 이미 캐시되어 있으면 반환
  const fileInfo = await FileSystem.getInfoAsync(localUri);
  if (fileInfo.exists) {
    return localUri;
  }

  // 다운로드
  try {
    const downloadResult = await FileSystem.downloadAsync(url, localUri);
    return downloadResult.uri;
  } catch (error) {
    console.error('이미지 다운로드 실패:', error);
    // 실패 시 원본 URL 반환 (온라인에서 로드)
    return url;
  }
};

/**
 * 캐시 크기 가져오기
 */
export const getCacheSize = async (): Promise<number> => {
  await ensureCacheDir();

  const files = await FileSystem.readDirectoryAsync(CACHE_DIR);
  let totalSize = 0;

  for (const file of files) {
    const fileInfo = await FileSystem.getInfoAsync(CACHE_DIR + file);
    if (fileInfo.exists && !fileInfo.isDirectory) {
      totalSize += fileInfo.size || 0;
    }
  }

  return totalSize;
};

/**
 * 캐시 삭제
 */
export const clearCache = async () => {
  await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
  await ensureCacheDir();
};
```

**사용**:
```tsx
// components/learn/VocabularyView.tsx
import { getCachedImageUri } from '@/services/imageCache';

const [imageUri, setImageUri] = useState<string>('');

useEffect(() => {
  if (word.imageUrl) {
    getCachedImageUri(word.imageUrl).then(setImageUri);
  }
}, [word.imageUrl]);

return <Image source={{ uri: imageUri }} />;
```

---

#### Task 4.2: 다크 모드 (4일)

**Step 1: 테마 시스템**

**파일 생성**: `constants/theme.ts`

```typescript
/**
 * 테마 시스템
 */

import { useColorScheme } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'auto';

export const lightTheme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#6200EE',
  text: '#000000',
  textSecondary: '#666666',
  border: '#E0E0E0',
  error: '#B00020',
  success: '#4CAF50',
};

export const darkTheme = {
  background: '#121212',
  surface: '#1E1E1E',
  primary: '#BB86FC',
  text: '#FFFFFF',
  textSecondary: '#AAAAAA',
  border: '#2C2C2C',
  error: '#CF6679',
  success: '#81C784',
};

export const useTheme = (mode: ThemeMode = 'auto') => {
  const systemScheme = useColorScheme();

  if (mode === 'auto') {
    return systemScheme === 'dark' ? darkTheme : lightTheme;
  }

  return mode === 'dark' ? darkTheme : lightTheme;
};
```

**Step 2: userStore에 테마 설정 추가**

```typescript
interface UserState {
  // ... 기존
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}
```

**Step 3: 모든 컴포넌트에 테마 적용**

대규모 작업! 우선순위:
1. 주요 화면 (tabs)
2. 학습 컴포넌트
3. Todo 컴포넌트
4. 기타

---

#### Task 4.3: Analytics (2일)

**설치**:
```bash
npx expo install expo-firebase-analytics
```

**파일 생성**: `services/analytics.ts`

```typescript
/**
 * Analytics 서비스
 */

import * as Analytics from 'expo-firebase-analytics';

export const logEvent = (
  name: string,
  params?: Record<string, any>
) => {
  if (__DEV__) {
    console.log('[Analytics]', name, params);
    return;
  }

  Analytics.logEvent(name, params);
};

// 사용 예시
export const logVocabularyCompleted = (
  level: string,
  week: number,
  score: number
) => {
  logEvent('vocabulary_completed', { level, week, score });
};

export const logTaskCompleted = (
  priority: string,
  hasSubtasks: boolean
) => {
  logEvent('task_completed', { priority, hasSubtasks });
};
```

**적용**:
```typescript
// store/learnStore.ts
import { logVocabularyCompleted } from '@/services/analytics';

completeActivity: (activityId, score) => {
  // ... 기존 로직
  logVocabularyCompleted(level, week, score);
};
```

---

### Phase 4 완료 체크리스트

`phase-4-advanced/PROGRESS.md`

```markdown
# Phase 4 진행 상황

## Task 4.1: 이미지 캐싱
- [ ] services/imageCache.ts 작성
- [ ] VocabularyView에 적용
- [ ] 다른 이미지 사용처 적용
- [ ] 캐시 크기 확인 기능
- [ ] 캐시 삭제 기능

## Task 4.2: 다크 모드
- [ ] constants/theme.ts 작성
- [ ] userStore에 themeMode 추가
- [ ] 주요 화면 테마 적용
- [ ] 학습 컴포넌트 테마 적용
- [ ] 설정에서 테마 전환 UI

## Task 4.3: Analytics
- [ ] expo-firebase-analytics 설치
- [ ] services/analytics.ts 작성
- [ ] 주요 이벤트 로깅 추가
- [ ] Firebase Console에서 확인

## 완료 기준
- [ ] 이미지 오프라인 캐싱 작동
- [ ] 다크 모드 전환 가능
- [ ] Analytics 이벤트 기록 확인
```

---

## 📝 문서 관리 규칙

### 매 세션 시작 시
1. `docs/CURRENT_STATE.md` 먼저 읽기
2. 현재 Phase의 `PROGRESS.md` 확인
3. 이전 세션 마지막 커밋 확인

### 작업 중
1. 파일 수정 시 `CHANGES.md`에 기록
2. 완료한 작업 `PROGRESS.md`에 체크
3. 중요한 결정사항 `PLAN.md`에 추가

### Phase 완료 시
1. `COMPLETE.md` 작성
2. `CURRENT_STATE.md` 업데이트
3. 다음 Phase 브랜치 생성

### 커밋 메시지 규칙
```
<type>(<phase>): <description>

[optional body]

Phase: X
Task: X.X
Files: file1.ts, file2.tsx
```

**type**:
- feat: 새 기능
- fix: 버그 수정
- test: 테스트 추가
- refactor: 리팩토링
- docs: 문서
- chore: 기타

**예시**:
```
test(phase-1): add SRS algorithm tests

- SM-2 알고리즘 검증
- Edge case 처리
- easeFactor 하한선 테스트

Phase: 1
Task: 1.2
Files: __tests__/utils/srs.test.ts
```

---

## 🚀 실행 가이드

### Phase 시작하기

1. **브랜치 생성**
```bash
git checkout -b phase/1-stability
```

2. **PLAN.md 읽기**
```bash
cat docs/implementation/phase-1-stability/PLAN.md
```

3. **작업 시작**
- Task 순서대로 진행
- 각 Task마다 커밋
- PROGRESS.md 업데이트

### Phase 완료하기

1. **체크리스트 확인**
```bash
cat docs/implementation/phase-1-stability/PROGRESS.md
```

2. **COMPLETE.md 작성**

3. **PR 생성**
```bash
git push -u origin phase/1-stability
gh pr create --title "Phase 1: 안정성 확보" --body "$(cat docs/implementation/phase-1-stability/COMPLETE.md)"
```

4. **다음 Phase 준비**

---

## 🎯 예상 타임라인

| Phase | 기간 | 시작 | 완료 (예상) |
|-------|------|------|-------------|
| Phase 1 | 1-2주 | 2025-12-24 | 2026-01-07 |
| Phase 2 | 1주 | 2026-01-08 | 2026-01-14 |
| Phase 3 | 2-3주 | 2026-01-15 | 2026-02-04 |
| Phase 4 | 2주 | 2026-02-05 | 2026-02-18 |

**총 예상 기간**: 6-8주

---

## ✅ 최종 목표

Phase 4 완료 후:
- ✅ 안정적인 테스트 커버리지 (30개+ 테스트)
- ✅ 사용자 친화적 에러 메시지
- ✅ 프로덕션 모니터링 (Sentry)
- ✅ 깨끗한 코드 (TypeScript 0 오류, ESLint 10개 이하)
- ✅ 훌륭한 백업 UX (파일 저장/자동 백업)
- ✅ 학습 통계 대시보드
- ✅ 온보딩 플로우
- ✅ 완전 오프라인 (이미지 캐싱)
- ✅ 다크 모드
- ✅ Analytics 연동

**→ 베타 출시 준비 완료! 🎉**

---

**마지막 업데이트**: 2025-12-24
**다음 액션**: Phase 1 시작 (테스트 환경 구축)

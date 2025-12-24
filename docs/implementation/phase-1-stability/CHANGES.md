# Phase 1 변경 파일 목록

**업데이트 일자**: 2025-12-24

---

## 신규 파일

### 테스트 환경
- `jest.config.js` - Jest 설정
- `__tests__/setup.ts` - 테스트 setup
- `__tests__/utils/srs.test.ts` - SRS 알고리즘 테스트
- `__tests__/utils/backup.test.ts` - 백업/복원 테스트
- `__tests__/store/taskStore.test.ts` - 할일 로직 테스트

### 에러 처리
- `utils/errorHandler.ts` - 에러 처리 유틸리티
- `components/common/ErrorBoundary.tsx` - Error Boundary 컴포넌트

### 설정
- `.env` - 환경 변수 (Sentry DSN 등) **git에 커밋 안 함**

---

## 수정 파일

### 설정 파일
| 파일 | 변경 내용 | 이유 |
|------|-----------|------|
| `package.json` | devDependencies 추가, scripts 추가 | 테스트 환경 구축 |
| `.gitignore` | .env 추가 | 환경 변수 보호 |
| `tsconfig.json` | jest 타입 처리 | TypeScript 오류 해결 |

### 앱 코드
| 파일 | 변경 내용 | 이유 |
|------|-----------|------|
| `app/_layout.tsx` | ErrorBoundary 추가 | 앱 크래시 방지 |
| `app/settings.tsx` | showUserFriendlyError 적용 | 사용자 친화적 에러 메시지 |
| `app/level-test.tsx` | showUserFriendlyError 적용 | 사용자 친화적 에러 메시지 |
| `app/review.tsx` | showUserFriendlyError 적용 | 사용자 친화적 에러 메시지 |
| `utils/sentry.ts` | 개선 (필요 시) | Sentry 연동 강화 |

### 학습 컴포넌트 (예상 5-8개)
- `components/learn/VocabularyView.tsx`
- `components/learn/GrammarView.tsx`
- `components/learn/ListeningView.tsx`
- `components/learn/ReadingView.tsx`
- `components/learn/SpeakingView.tsx`
- `components/learn/WritingView.tsx`
- 기타 에러 처리가 필요한 컴포넌트

---

## 파일별 변경 이유 상세

### jest.config.js
**변경 내용**: 신규 생성
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  // ... 설정
};
```
**이유**: 테스트 환경 구축

---

### package.json
**변경 내용**:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "devDependencies": {
    "jest": "^29.x.x",
    "@testing-library/react-native": "^12.x.x",
    "@testing-library/jest-native": "^5.x.x",
    "@types/jest": "^29.x.x"
  }
}
```
**이유**: 테스트 실행 및 의존성 관리

---

### utils/errorHandler.ts
**변경 내용**: 신규 생성 (약 150줄)
**주요 함수**:
- `showUserFriendlyError()` - 사용자 친화적 에러 표시
- `AppError` - 커스텀 에러 클래스
- `BackupError`, `LearningError` - 도메인별 에러

**이유**:
- SyntaxError → "백업 파일 형식이 올바르지 않습니다"
- TypeError (fetch) → "인터넷 연결을 확인해주세요"
- 사용자가 이해할 수 있는 메시지로 변환

---

### app/settings.tsx
**변경 전**:
```typescript
} catch (error) {
  Alert.alert('복원 실패', (error as Error).message);  // ❌
}
```

**변경 후**:
```typescript
import { showUserFriendlyError } from '@/utils/errorHandler';

} catch (error) {
  showUserFriendlyError(error, '백업 복원');  // ✅
}
```

**이유**: "SyntaxError: Unexpected token" 대신 "백업 파일 형식이 올바르지 않습니다" 표시

---

### components/common/ErrorBoundary.tsx
**변경 내용**: 신규 생성 (약 100줄)
**기능**:
- 컴포넌트 에러 catch
- Sentry에 보고
- 사용자에게 친화적인 에러 화면 표시
- "다시 시도" 버튼

**이유**: 컴포넌트 크래시 시 앱 전체 크래시 방지

---

### app/_layout.tsx
**변경 내용**:
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

**이유**: 모든 화면에 ErrorBoundary 적용

---

## 변경 추적 규칙

### 파일 상단 주석
수정한 파일 상단에 변경 이력 추가:
```typescript
/**
 * [파일명]
 *
 * @changed 2025-12-24 - Phase 1.3: 에러 처리 개선
 *   - showUserFriendlyError 적용
 *   - 사용자 친화적 메시지로 변경
 */
```

### 커밋 메시지
```
<type>(phase-1): <description>

Phase: 1
Task: 1.X
Files: file1.ts, file2.tsx
```

---

**마지막 업데이트**: 2025-12-24
**다음 업데이트**: Task 완료 시마다

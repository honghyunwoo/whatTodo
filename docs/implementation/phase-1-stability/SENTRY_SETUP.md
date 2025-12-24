# Sentry 설정 가이드

**작성일**: 2025-12-24
**Phase**: 1.4 - Sentry 설정

---

## 📋 목차

1. [Sentry란?](#sentry란)
2. [설정 방법](#설정-방법)
3. [테스트 방법](#테스트-방법)
4. [에러 확인](#에러-확인)

---

## Sentry란?

**Sentry**는 실시간 에러 추적 및 모니터링 서비스입니다.

### 주요 기능
- ✅ 프로덕션 환경에서 발생한 에러 자동 수집
- ✅ 에러 발생 빈도, 영향받은 사용자 수 추적
- ✅ 에러 발생 시 스택 트레이스, 브레드크럼 제공
- ✅ 이메일/슬랙 알림

### 왜 필요한가?
- 사용자가 겪는 에러를 개발자가 실시간으로 파악 가능
- 프로덕션 환경에서만 발생하는 에러 추적
- 에러 우선순위 파악 (빈도, 영향도)

---

## 설정 방법

### 1. Sentry 계정 생성

1. https://sentry.io 방문
2. Sign up (무료 플랜 사용 가능)
3. Create Organization

### 2. React Native 프로젝트 생성

1. Sentry 대시보드에서 **Create Project** 클릭
2. Platform 선택: **React Native**
3. 프로젝트 이름: `whatTodo` (또는 원하는 이름)
4. **Create Project** 클릭

### 3. DSN 복사

프로젝트 생성 후 DSN이 표시됩니다:

```
https://abc123def456@o123456.ingest.sentry.io/7654321
```

또는 **Settings > Projects > [프로젝트명] > Client Keys (DSN)**에서 확인 가능

### 4. .env 파일 생성

프로젝트 루트에 `.env` 파일 생성:

```bash
cp .env.example .env
```

`.env` 파일에 DSN 입력:

```bash
EXPO_PUBLIC_SENTRY_DSN=https://abc123def456@o123456.ingest.sentry.io/7654321
```

### 5. 앱 재시작

```bash
# 캐시 클리어 후 재시작
npm start -- --clear
```

---

## 테스트 방법

### 개발 환경에서는 전송되지 않음

**중요**: Sentry는 프로덕션 빌드에서만 작동합니다 (`!__DEV__`).

개발 환경에서는 콘솔에 다음과 같은 메시지 표시:
```
[Sentry] DSN not configured, skipping initialization
```

### 프로덕션 빌드 테스트

#### 방법 1: Expo Preview 빌드

```bash
eas build --profile preview --platform android
```

빌드 완료 후 APK 설치하여 에러 발생시켜보기

#### 방법 2: 로컬 프로덕션 빌드

```typescript
// 임시로 __DEV__ 체크 우회 (테스트 후 반드시 원복)
// utils/sentry.ts
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    enabled: true, // 임시로 true (테스트용)
    // ...
  });
}
```

### 테스트 에러 발생시키기

#### 방법 1: ErrorBoundary 테스트

임시 컴포넌트 추가:

```tsx
// app/test-error.tsx (임시 파일)
export default function TestError() {
  throw new Error('Sentry 테스트 에러');
  return null;
}
```

#### 방법 2: 수동으로 에러 전송

Settings 화면에 버튼 추가:

```tsx
import { captureError, captureMessage } from '@/utils/sentry';

// 버튼 추가
<Button onPress={() => {
  captureError(new Error('Test Error from Settings'), {
    testContext: true,
    timestamp: new Date().toISOString(),
  });
  Alert.alert('테스트 에러 전송됨');
}}>
  Sentry 테스트
</Button>
```

---

## 에러 확인

### Sentry 대시보드

1. https://sentry.io 로그인
2. **Issues** 탭 클릭
3. 전송된 에러 목록 확인

### 에러 상세 정보

각 에러를 클릭하면 다음 정보 확인 가능:

- **Stack Trace**: 에러가 발생한 코드 위치
- **Breadcrumbs**: 에러 발생 전 사용자 행동
- **Device Info**: 기기 정보 (OS, 모델, 버전)
- **Tags**: 커스텀 태그 (사용자 ID, 레벨 등)
- **Context**: 추가 컨텍스트 정보

---

## 에러 처리 통합

### ErrorBoundary

```tsx
// components/common/ErrorBoundary.tsx
componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  if (!__DEV__) {
    captureError(error, {
      errorInfo: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### showUserFriendlyError

```tsx
// utils/errorHandler.ts
export const showUserFriendlyError = (error: unknown, operation: string): void => {
  // 사용자에게 표시
  Alert.alert(title, message);
  
  // Sentry에 전송 (프로덕션에서만)
  if (!__DEV__) {
    captureError(error as Error, { operation, userMessage: title });
  }
};
```

---

## 베스트 프랙티스

### 1. 민감 정보 제외

```typescript
beforeSend(event) {
  // 비밀번호 등 민감 정보 제거
  if (event.request?.data?.password) {
    delete event.request.data.password;
  }
  return event;
}
```

### 2. 사용자 ID 설정

```typescript
// 로그인 시
setSentryUser(userId, email);

// 로그아웃 시
setSentryUser(null);
```

### 3. 커스텀 태그

```typescript
// 현재 레벨 태그
setSentryTag('cefr_level', currentLevel);

// 환경
setSentryTag('build_env', __DEV__ ? 'dev' : 'prod');
```

### 4. Breadcrumbs 활용

```typescript
// 사용자 행동 추적
addBreadcrumb('User started level test', 'user_action', {
  level: 'A2',
  timestamp: Date.now(),
});
```

---

## 문제 해결

### DSN이 없다는 메시지

```
[Sentry] DSN not configured, skipping initialization
```

**해결**: `.env` 파일 생성 및 `EXPO_PUBLIC_SENTRY_DSN` 설정

### 에러가 Sentry에 전송되지 않음

**체크리스트**:
- [ ] `.env` 파일에 올바른 DSN 설정됨
- [ ] 프로덕션 빌드인가? (개발 환경에서는 전송 안 됨)
- [ ] `enabled: !__DEV__` 설정 확인
- [ ] Sentry 프로젝트가 활성화되어 있는가?

### Process.env 오류

```
Cannot find name 'process'
```

**해결**: 이미 해결됨. Expo는 자동으로 `EXPO_PUBLIC_*` 환경 변수를 처리.

---

## 참고 자료

- [Sentry React Native 문서](https://docs.sentry.io/platforms/react-native/)
- [Expo + Sentry 설정](https://docs.expo.dev/guides/using-sentry/)
- [Sentry Error Filtering](https://docs.sentry.io/platforms/react-native/configuration/filtering/)

---

**마지막 업데이트**: 2025-12-24
**다음 업데이트**: Sentry 실제 설정 후

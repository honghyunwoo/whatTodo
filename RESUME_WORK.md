# WhatTodo 상용화 작업 재개 가이드

## 현재 상태 (2024년 12월 15일)

### 브랜치
```
claude/commercialize-project-cPmvt
```

### 완료된 작업

| 작업 | 커밋 | 상태 |
|------|------|------|
| console.log 정리 (3개 파일) | `6f70321` | ✅ 완료 |
| setTimeout cleanup (7개 파일) | `6f70321` | ✅ 완료 |
| constants/animations.ts 생성 | `6f70321` | ✅ 완료 |
| level 파라미터 버그 수정 | `416ba80` | ✅ 완료 |
| JSON 동적 임포트 A1 | `a0d2d25` | ✅ 완료 |
| JSON 동적 임포트 A2, B1, B2 | `7a58880` | ✅ 완료 |
| Sentry 에러 모니터링 통합 | `bf9e8ac` | ✅ 완료 |
| TypeScript 에러 수정 + ESLint v9 | `2b8021d` | ✅ 완료 |

### Phase 1 완료 요약
- **번들 사이즈 최적화**: 192개 JSON 파일 동적 임포트 (737줄 → 367줄, 50% 감소)
- **에러 모니터링**: Sentry 통합 완료 (`@sentry/react-native`)
- **코드 품질**: console.log, setTimeout 정리, 애니메이션 상수화
- **TypeScript**: 모든 타입 에러 수정, ESLint v9 flat config 마이그레이션

---

## 다음 작업: EAS Build 테스트

### 1. EAS 로그인 (터미널에서 직접 실행)
```bash
cd /home/user/whatTodo
eas login
```
- 이메일/비밀번호 입력

### 2. Android APK 빌드
```bash
eas build --platform android --profile preview
```
- "Generate a new Android Keystore?" → Y
- 빌드 시간: 약 15-20분

### 3. 빌드 확인
- 웹: https://expo.dev/accounts/hhohhos-organization/projects/whattodo/builds
- 터미널: `eas build:list --limit 5`

### 4. APK 다운로드 및 테스트
```bash
eas build:download --platform android
```
또는 웹 대시보드에서 Download 클릭

---

## EAS 프로젝트 정보

| 항목 | 값 |
|------|-----|
| Project ID | `e04e02b0-13a5-46fb-9c50-774f9b27070a` |
| Organization | `hhohhos-organization` |
| 빌드 프로필 | `preview` (APK), `production` (AAB) |

---

## Sentry 설정 (빌드 성공 후)

**참고**: Sentry 플러그인은 빌드 테스트를 위해 임시 제거됨.

빌드 성공 후 Sentry 활성화:
1. https://sentry.io 에서 프로젝트 생성
2. DSN 발급받기
3. `.env.local` 파일 생성:
```
EXPO_PUBLIC_SENTRY_DSN=https://your-dsn@sentry.io/0
```
4. `app.json`에 Sentry 플러그인 다시 추가:
```json
[
  "@sentry/react-native/expo",
  {
    "organization": "YOUR_ACTUAL_ORG",
    "project": "whattodo"
  }
]
```

---

## 남은 Phase 2+ 작업

- [ ] Sentry 계정 설정 및 활성화
- [ ] 큰 컴포넌트 분리
- [ ] Error Boundary 추가
- [ ] Firebase Analytics 통합
- [ ] 스토어 배포 (Play Store / App Store)

---

## 빠른 재개 명령어

```bash
# 1. 프로젝트 디렉토리 이동
cd /home/user/whatTodo

# 2. 브랜치 확인
git branch

# 3. 최신 코드 가져오기
git pull origin claude/commercialize-project-cPmvt

# 4. EAS 로그인
eas login

# 5. 빌드 시작
eas build --platform android --profile preview
```

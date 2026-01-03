# Play Store 내부 테스트 등록 가이드

## 사전 준비 사항

### 1. Google Play Console 앱 생성
1. [Google Play Console](https://play.google.com/console) 접속
2. **앱 만들기** 클릭
3. 앱 정보 입력:
   - 앱 이름: `WhatTodo - 할 일 & 영어 학습`
   - 기본 언어: 한국어
   - 앱 또는 게임: 앱
   - 무료 또는 유료: 무료

### 2. 앱 스토어 등록 정보 작성
`docs/store/app-store-metadata.md` 파일의 내용을 사용하여:
- 짧은 설명 (80자)
- 긴 설명 (4000자)
- 스크린샷 (최소 2장, 권장 4-8장)
- 기능 그래픽 (1024x500)
- 아이콘 (512x512)

### 3. 개인정보처리방침 URL
`docs/store/privacy-policy.md` 파일을 GitHub Pages 또는 웹사이트에 호스팅하여 URL 확보

---

## 빌드 및 제출

### 방법 1: EAS Build + 수동 업로드 (권장)

```bash
# 1. 프로덕션 빌드 생성
eas build --profile production --platform android

# 2. 빌드 완료 후 .aab 파일 다운로드
# EAS 대시보드에서 다운로드 가능

# 3. Google Play Console에서 수동 업로드
# 테스트 > 내부 테스트 > 새 버전 만들기
```

### 방법 2: EAS Submit (자동화)

```bash
# 1. Google Cloud Console에서 서비스 계정 생성
# 2. JSON 키 파일 다운로드하여 google-services.json으로 저장
# 3. 빌드 및 제출
eas build --profile production --platform android
eas submit --platform android --profile production
```

---

## 내부 테스트 설정

### 테스터 추가
1. Play Console > 테스트 > 내부 테스트
2. **테스터** 탭 > 이메일 목록 만들기
3. 테스터 이메일 추가

### 앱 공유
1. 내부 테스트 트랙에 빌드 업로드
2. **출시 검토 시작** 클릭
3. 테스터에게 참여 링크 공유

---

## 체크리스트

### 앱 설정
- [ ] 앱 아이콘 (512x512)
- [ ] 기능 그래픽 (1024x500)
- [ ] 스크린샷 (최소 2장)
- [ ] 짧은 설명 입력
- [ ] 긴 설명 입력
- [ ] 카테고리 선택: 생산성

### 콘텐츠 등급
- [ ] 설문지 작성 (콘텐츠 등급 받기)
- [ ] 모든 연령 대상 확인

### 개인정보
- [ ] 개인정보처리방침 URL 입력
- [ ] 데이터 보안 양식 작성

### 앱 액세스
- [ ] 로그인 불필요 선택 (오프라인 앱)

---

## 버전 관리

### 현재 버전
- **앱 버전**: 1.0.0
- **versionCode**: 1 (자동 증가 설정됨)

### 버전 업데이트
eas.json의 `autoIncrement: true` 설정으로 빌드마다 자동 증가

---

## 문제 해결

### 빌드 실패
```bash
# 캐시 정리 후 재빌드
eas build --profile production --platform android --clear-cache
```

### 제출 실패
- 서비스 계정 권한 확인
- JSON 키 파일 경로 확인
- Play Console에서 API 액세스 활성화 확인

---

**마지막 업데이트**: 2026-01-03

# WhatTodo - 할 일 관리 + 영어 학습

직장인과 학생을 위한 Todo + 영어 학습 앱

## 주요 기능

- **할 일 관리** - 일정 관리, 우선순위 설정, 반복 작업
- **8주 영어 마스터 코스** - A1~C2 레벨별 커리큘럼 (CEFR 기준)
- **간격 반복 학습 (SRS)** - SM-2 알고리즘 기반 단어 복습
- **레벨 테스트** - 적응형 문제로 영어 레벨 측정
- **2048 게임** - 휴식 시간 미니게임
- **게이미피케이션** - 배지, 스트릭, 별 보상 시스템

## 스크린샷

(추후 추가)

## 기술 스택

- **프레임워크**: React Native (Expo)
- **언어**: TypeScript
- **상태 관리**: Zustand
- **UI**: React Native Paper
- **애니메이션**: Moti, Reanimated
- **음성**: Expo Speech (TTS)

## 시작하기

```bash
# 의존성 설치
npm install

# 개발 서버 시작
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios

# Web
npx expo start --web
```

## 프로젝트 구조

```
whatTodo/
├── app/                    # 화면 (Expo Router)
│   ├── (tabs)/            # 탭 네비게이션
│   │   ├── index.tsx      # 홈 (Todo)
│   │   ├── learn.tsx      # 학습
│   │   ├── game.tsx       # 게임
│   │   └── journal.tsx    # 일기
│   ├── level-test.tsx     # 레벨 테스트
│   └── review.tsx         # SRS 복습
├── components/            # 재사용 컴포넌트
│   ├── learn/            # 학습 관련
│   ├── reward/           # 보상 관련
│   └── ...
├── store/                 # 상태 관리 (Zustand)
├── services/              # 비즈니스 로직
├── utils/                 # 유틸리티 함수
├── types/                 # TypeScript 타입
├── data/                  # 학습 콘텐츠 (JSON)
│   └── activities/       # 레벨별 활동
│       ├── a1/           # 입문
│       ├── a2/           # 초급
│       ├── b1/           # 중급
│       ├── b2/           # 중상급
│       ├── c1/           # 고급
│       └── c2/           # 최상급
└── constants/             # 상수 (색상, 설정)
```

## 학습 콘텐츠

- **6개 레벨**: A1 (입문), A2 (초급), B1 (중급), B2 (중상급), C1 (고급), C2 (최상급)
- **8주 코스**: 주당 6개 활동 (48개/레벨)
- **6가지 영역**: 어휘, 문법, 듣기, 읽기, 말하기, 쓰기
- **총 288개 활동**: 모든 레벨 합계 (6레벨 × 8주 × 6영역)

## 오프라인 지원

- 모든 학습 콘텐츠 로컬 저장
- API 의존성 없음
- TTS: Expo Speech (기기 내장)
- 채점: 규칙 기반 로컬 처리

## 기여하기

1. Fork
2. Feature branch (`git checkout -b feature/amazing`)
3. Commit (`git commit -m 'Add amazing feature'`)
4. Push (`git push origin feature/amazing`)
5. Pull Request

## 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 만든 사람

- 기획 & 개발: hynoo
- AI 어시스턴트: Claude

---

**문의**: Issues 탭에 남겨주세요!

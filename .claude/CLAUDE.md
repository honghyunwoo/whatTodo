# WhatTodo AI 협업 가이드

> Todo + 영어학습 + 일기 통합 앱 (Expo/React Native, TypeScript, Zustand)

---

## 핵심 원칙

1. **한 번에 하나** - 동시 작업 금지, 완료 후 다음
2. **계획 먼저** - TodoWrite로 분해 후 시작
3. **안전 우선** - 테스트 통과 → 커밋
4. **모르면 질문** - 추측 금지, 확인 요청
5. **최소 변경** - 요청한 것만, 과잉 리팩터링 금지

---

## 절대 금지

- `.env` 파일 수정
- 테스트 없이 커밋
- 다중 작업 동시 진행
- 사용자 확인 없이 삭제
- 요청 없는 구조 변경

---

## 작업 패턴

### 기능 추가
```
1. TodoWrite로 단계 분해
2. 한 단계씩 구현 + 완료 체크
3. typecheck 통과 확인
→ 결과: 변경 파일 + 다음 단계
```

### 버그 수정
```
1. 원인 가설 3개 제시
2. 가장 빠른 검증부터
3. 수정 후 테스트
→ 결과: 원인 + 수정 내용
```

### 콘텐츠 추가
```
1. JSON 스키마 확인
2. 파일 생성 + 인덱스 업데이트
3. 유효성 검증
→ 결과: 아이템 수 + stats
```

---

## 자동 검증 (매 작업 후)

```bash
npx tsc --noEmit   # 필수
npm run lint       # 필수
npm test           # 코드 변경 시
```

**실패 시**: 수정 후 재검증, 커밋 금지

---

## 출력 형식

작업 완료 시 항상:
- **변경**: `path/file.tsx` (+N, -M)
- **검증**: typecheck ✅ lint ✅
- **다음**: (있으면)

---

## 불확실할 때

→ **실행하지 말고 질문하라**
→ **가정하지 말고 확인하라**

---

## 명령어

| 명령 | 용도 |
|------|------|
| `npm start` | 개발 서버 |
| `npm run typecheck` | 타입 체크 |
| `npm run lint` | ESLint |
| `npm test` | 테스트 (51개) |
| `eas build --profile preview --platform android` | Android 빌드 |

---

## 프로젝트 구조 요약

```
app/           # 화면 (Expo Router)
components/    # UI 컴포넌트
store/         # Zustand 스토어 (10개)
services/      # 비즈니스 로직
data/          # 학습 콘텐츠 (288개+)
types/         # TypeScript 타입
utils/         # 유틸리티
```

---

## 참조

- `.claude/state.json` - 현재 상태
- `docs/DECISIONS.md` - 기술 결정
- `docs/CHANGELOG.md` - 변경 이력

---

**최종 업데이트**: 2026-01-02

# 🔮 향후 개선 사항 메모

> **생성일**: 2025년 12월 16일
> **목적**: 당장 급하지 않지만 나중에 보완하면 좋을 아이디어들 기록

---

## 📝 콘텐츠 품질 개선

### 1. EnhancedWord 필드 확장
| 필드 | 현재 | 목표 | 우선순위 |
|------|------|------|----------|
| `confusableWords` | 15/50 (30%) | 30/50+ (60%+) | ⭐⭐ |
| `additionalExamples` | 20/50 (40%) | 50/50 (100%) | ⭐⭐⭐ |

**이유**:
- `confusableWords`: 한국인이 자주 혼동하는 단어 쌍 더 추가 (e.g., desert/dessert, affect/effect)
- `additionalExamples`: 모든 단어에 formal/informal/neutral 맥락별 예문 제공

**작업 방법**: 모든 주차 기본 작업 완료 후 일괄 보완 스크립트로 처리

---

### 2. 연습문제 다양성 강화
- [ ] 같은 유형 내에서도 난이도별 템플릿 다양화
- [ ] 실생활 시나리오 기반 문제 추가 (카페, 병원, 공항 등)
- [ ] 한국인 특화 오류 패턴 기반 error_correction 문제 확대

---

### 3. 미디어 리소스 개선
- [ ] imageUrl: Unsplash → 자체 제작 일러스트 (저작권 안전)
- [ ] audioUrl: Forvo 링크 → 실제 오디오 파일 (.mp3) 통합
- [ ] 발음 비교용 오디오 클립 생성 (pronunciation_compare 유형)

---

## 💡 새로운 아이디어

### 추가 연습 유형 후보
1. **shadowing** - 원어민 음성 따라 읽기
2. **dictation_fill** - 부분 받아쓰기 (일부만 빈칸)
3. **situation_roleplay** - 상황별 역할극 시나리오
4. **word_chain** - 연상 단어 연결 게임
5. **minimal_pairs** - 최소 대립쌍 발음 구분 (ship/sheep)

### 한국인 특화 기능
1. **konglish_alert** - 콩글리시 경고 표시
2. **pronunciation_coach** - 한국어 음운 체계 기반 발음 코칭
3. **grammar_interference** - 한국어 문법 간섭 오류 패턴 학습

---

## 📅 작업 일정 (예상)

| 단계 | 작업 | 시기 |
|------|------|------|
| 1 | 모든 레벨 기본 콘텐츠 완성 | 현재 진행 중 |
| 2 | confusableWords/additionalExamples 보완 | 기본 완성 후 |
| 3 | 미디어 리소스 업그레이드 | Phase 3 |
| 4 | 추가 연습 유형 구현 | Phase 3-4 |

---

*이 파일은 아이디어 메모용입니다. 실제 작업은 CONTENT_QUALITY_ROADMAP.md를 참고하세요.*

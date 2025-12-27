# WhatTodo 기능 연결 작업 매뉴얼

**작성일**: 2025-12-27
**목적**: 구현되어 있지만 연결되지 않은 기능들을 연결하기

---

## 작업 개요

| Phase | 작업 | 파일 | 예상 시간 |
|-------|------|------|----------|
| 1 | SRS 연결 | VocabularyView.tsx | 10분 |
| 1 | Dictation 연결 | ListeningView.tsx | 15분 |
| 1 | Shadowing 연결 | SpeakingView.tsx | 15분 |
| 1 | MinimalPairs 연결 | VocabularyView.tsx | 15분 |
| 2 | 오늘의 학습 UI | learn.tsx | 1시간 |
| 2 | 효과음 추가 | 여러 파일 | 30분 |
| 3 | 중복 Store 통합 | diaryStore + journalStore | 1시간 |
| 3 | 미사용 컴포넌트 정리 | 여러 파일 | 30분 |

---

## Phase 1: 기존 기능 연결 (핵심!)

### 1.1 SRS (Spaced Repetition System) 연결

**현재 상태**:
- `store/srsStore.ts`: SM-2 알고리즘 완벽 구현 (293줄)
- `VocabularyView.tsx`: SRS 사용 안 함

**목표**: 단어 학습 시 "모르겠어요" 누르면 SRS 복습 목록에 자동 추가

**수정 파일**: `components/learn/VocabularyView.tsx`

**변경 내용**:

```typescript
// 1. import 추가 (라인 12 근처)
import { useSrsStore } from '@/store/srsStore';

// 2. 컴포넌트 내부에 store 연결 (라인 25 근처)
export function VocabularyView({ activity, onComplete }: VocabularyViewProps) {
  const saveFlashCardResults = useLearnStore((state) => state.saveFlashCardResults);
  const addWord = useSrsStore((state) => state.addWord);  // <-- 추가
  // ... 기존 코드

// 3. handleUnknown 함수 수정 (라인 61-79)
const handleUnknown = useCallback(async () => {
  if (!currentWord) return;
  await feedbackService.wrong();

  // SRS에 단어 추가 (복습 필요한 단어)
  addWord({
    wordId: currentWord.id,
    word: currentWord.word,
    meaning: currentWord.meaning,
    example: currentWord.example,
    pronunciation: currentWord.pronunciation,
  });

  const newResults = [...results, { wordId: currentWord.id, known: false, attempts: 1 }];
  setResults(newResults);
  // ... 나머지 코드
}, [currentWord, results, isLastWord, activity?.id, saveFlashCardResults, onComplete, addWord]);
```

**테스트 방법**:
1. 단어 학습 화면 진입
2. "모르겠어요" 버튼 클릭
3. AsyncStorage에서 `srs-storage` 키 확인 (단어가 추가되었는지)

---

### 1.2 Dictation (받아쓰기) 연결

**현재 상태**:
- `components/learn/exercises/Dictation.tsx`: 완벽 구현 (896줄)
- `ListeningView.tsx`: Dictation 사용 안 함

**목표**: 듣기 학습에 받아쓰기 모드 추가

**수정 파일**: `components/learn/ListeningView.tsx`

**변경 내용**:

```typescript
// 1. import 추가 (라인 1-10 근처)
import { Dictation, DictationQuestion } from './exercises/Dictation';

// 2. ViewMode 타입 확장 (라인 17)
type ViewMode = 'listen' | 'quiz' | 'dictation' | 'complete';

// 3. 받아쓰기 데이터 생성 함수 추가 (컴포넌트 외부)
function createDictationQuestions(audio: { text: string }): DictationQuestion[] {
  // 오디오 텍스트를 문장으로 분리
  const sentences = audio.text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return sentences.slice(0, 5).map((sentence, index) => ({
    id: `dictation-${index}`,
    audioText: sentence,
    difficulty: sentence.split(' ').length < 5 ? 'easy' :
                sentence.split(' ').length < 10 ? 'medium' : 'hard',
  }));
}

// 4. 받아쓰기 완료 핸들러 추가 (handleQuizComplete 근처)
const handleDictationComplete = useCallback((results: DictationResult[]) => {
  const correctCount = results.filter(r => r.correct).length;
  const calculatedScore = Math.round((correctCount / results.length) * 100);
  setScore(calculatedScore);
  setMode('complete');
  onComplete?.(calculatedScore);
}, [onComplete]);

// 5. 받아쓰기 모드 시작 핸들러 추가
const handleStartDictation = useCallback(() => {
  Speech.stop();
  setIsPlaying(false);
  setMode('dictation');
}, []);

// 6. mode === 'dictation' 렌더링 추가 (mode === 'quiz' 아래)
if (mode === 'dictation') {
  const dictationQuestions = createDictationQuestions(audio);
  if (dictationQuestions.length === 0) {
    return (
      <View style={styles.completedContainer}>
        <Text style={styles.completedIcon}>📝</Text>
        <Text style={styles.completedTitle}>받아쓰기 데이터 없음</Text>
      </View>
    );
  }
  return <Dictation questions={dictationQuestions} onComplete={handleDictationComplete} />;
}

// 7. 받아쓰기 버튼 추가 (퀴즈 시작 버튼 아래)
<Button
  mode="outlined"
  onPress={handleStartDictation}
  style={styles.dictationButton}
  icon="pencil"
>
  받아쓰기 연습
</Button>

// 8. 스타일 추가
dictationButton: {
  marginTop: SIZES.spacing.sm,
},
```

**테스트 방법**:
1. 듣기 학습 화면 진입
2. "받아쓰기 연습" 버튼 클릭
3. 문장 듣고 타이핑
4. 정확도 확인

---

### 1.3 Shadowing (따라읽기) 연결

**현재 상태**:
- `components/learn/exercises/Shadowing.tsx`: 완벽 구현 (818줄)
- `SpeakingView.tsx`: Shadowing 사용 안 함

**목표**: 말하기 학습에 쉐도잉 모드 추가

**수정 파일**: `components/learn/SpeakingView.tsx`

**변경 내용**:

```typescript
// 1. import 추가
import { Shadowing, ShadowingSentence, ShadowingResult } from './exercises/Shadowing';

// 2. ViewMode 타입 확장 (라인 18)
type ViewMode = 'practice' | 'shadowing' | 'checklist' | 'complete';

// 3. 쉐도잉 데이터 변환 함수 추가
function convertToShadowingSentences(sentences: SpeakingSentence[]): ShadowingSentence[] {
  return sentences.map((s, index) => ({
    id: s.id,
    text: s.text,
    translation: s.translation,
    pronunciation: s.pronunciation,
    tips: s.tips,
    speed: 0.8,
    difficulty: index < 3 ? 'easy' : index < 6 ? 'medium' : 'hard',
  }));
}

// 4. 쉐도잉 완료 핸들러 추가
const handleShadowingComplete = useCallback((results: ShadowingResult[]) => {
  const completedCount = results.filter(r => r.completed).length;
  const score = Math.round((completedCount / results.length) * 100);
  setMode('complete');
  onComplete?.(score);
}, [onComplete]);

// 5. 쉐도잉 시작 핸들러 추가
const handleStartShadowing = useCallback(() => {
  Speech.stop();
  setIsPlaying(false);
  setMode('shadowing');
}, []);

// 6. mode === 'shadowing' 렌더링 추가 (mode === 'checklist' 위)
if (mode === 'shadowing') {
  const shadowingSentences = convertToShadowingSentences(sentences);
  return (
    <Shadowing
      sentences={shadowingSentences}
      onComplete={handleShadowingComplete}
    />
  );
}

// 7. 쉐도잉 버튼 추가 (practice 모드의 navigation 영역)
<View style={styles.modeButtons}>
  <Button
    mode="outlined"
    onPress={handleStartShadowing}
    style={styles.modeButton}
    icon="account-voice"
  >
    쉐도잉 모드
  </Button>
</View>

// 8. 스타일 추가
modeButtons: {
  paddingHorizontal: SIZES.spacing.md,
  marginBottom: SIZES.spacing.md,
},
modeButton: {
  marginBottom: SIZES.spacing.sm,
},
```

**테스트 방법**:
1. 말하기 학습 화면 진입
2. "쉐도잉 모드" 버튼 클릭
3. 문장 듣고 따라 읽기
4. 녹음 기능 테스트

---

### 1.4 MinimalPairs (최소대립쌍) 연결

**현재 상태**:
- `components/learn/exercises/MinimalPairs.tsx`: 완벽 구현 (771줄)
- 어디에도 연결되지 않음

**목표**: 어휘 학습 완료 후 발음 구분 연습 제공

**수정 파일**: `components/learn/VocabularyView.tsx`

**변경 내용**:

```typescript
// 1. import 추가
import { MinimalPairs, MinimalPairQuestion, MinimalPairsResult } from './exercises/MinimalPairs';

// 2. 상태 추가
const [showMinimalPairs, setShowMinimalPairs] = useState(false);

// 3. 샘플 MinimalPairs 데이터 (나중에 데이터 파일에서 로드)
const sampleMinimalPairs: MinimalPairQuestion[] = [
  {
    pair: {
      id: 'ship-sheep',
      word1: 'ship',
      word2: 'sheep',
      pronunciation1: '/ʃɪp/',
      pronunciation2: '/ʃiːp/',
      meaning1: '배',
      meaning2: '양',
      soundFocus: '/ɪ/ vs /iː/',
      koreanTip: '한국어에는 이 두 소리 구분이 없어요. ship은 짧게 "쉽", sheep은 길게 "쉬~프"',
      category: 'vowel',
      difficulty: 'medium',
    },
    targetWord: 1,
    showHint: false,
  },
  // ... 더 많은 쌍 추가
];

// 4. 완료 화면에 MinimalPairs 버튼 추가 (isCompleted 블록 내)
if (isCompleted) {
  if (showMinimalPairs) {
    return (
      <MinimalPairs
        questions={sampleMinimalPairs}
        onComplete={(results) => {
          setShowMinimalPairs(false);
          // 결과 처리
        }}
      />
    );
  }

  return (
    <View style={styles.completedContainer}>
      <Text style={styles.completedIcon}>🎉</Text>
      <Text style={styles.completedTitle}>학습 완료!</Text>
      <Text style={styles.scoreText}>{score}점</Text>
      <Text style={styles.statsText}>
        {results.filter((r) => r.known).length}개 암기 / {results.length}개 중
      </Text>

      {/* 발음 연습 버튼 추가 */}
      <Button
        mode="outlined"
        onPress={() => setShowMinimalPairs(true)}
        style={styles.minimalPairsButton}
        icon="ear-hearing"
      >
        발음 구분 연습
      </Button>

      <Button mode="contained" onPress={handleRestart} style={styles.restartButton}>
        다시 학습하기
      </Button>
    </View>
  );
}

// 5. 스타일 추가
minimalPairsButton: {
  marginTop: SIZES.spacing.lg,
},
```

**테스트 방법**:
1. 어휘 학습 완료
2. "발음 구분 연습" 버튼 클릭
3. 비슷한 발음 단어 구분 테스트

---

## Phase 2: UI/UX 개선

### 2.1 오늘의 학습 UI

**목표**: 메인 학습 화면에 "오늘 복습할 단어" 섹션 추가

**수정 파일**: `app/(tabs)/learn.tsx`

**변경 내용**:
```typescript
// 1. import 추가
import { useSrsStore } from '@/store/srsStore';

// 2. 복습 단어 가져오기
const dueWordCount = useSrsStore((state) => state.getDueWordCount());
const wordsForReview = useSrsStore((state) => state.getWordsForReview());

// 3. 오늘의 복습 카드 추가
{dueWordCount > 0 && (
  <Card style={styles.reviewCard}>
    <Card.Content>
      <View style={styles.reviewHeader}>
        <MaterialCommunityIcons name="repeat" size={24} color={COLORS.primary} />
        <Text style={styles.reviewTitle}>오늘의 복습</Text>
      </View>
      <Text style={styles.reviewCount}>{dueWordCount}개 단어</Text>
      <Button mode="contained" onPress={() => router.push('/learn/srs-review')}>
        복습 시작
      </Button>
    </Card.Content>
  </Card>
)}
```

### 2.2 효과음 추가

**현재 상태**:
- `services/feedbackService.ts`: 진동 피드백만 있음
- 효과음 없음

**목표**: 정답/오답 시 효과음 추가

**수정 파일**: `services/feedbackService.ts` 또는 새 파일 생성

**구현 방법**:
```typescript
import { Audio } from 'expo-av';

const soundCache: Record<string, Audio.Sound> = {};

async function playSound(name: 'correct' | 'wrong' | 'complete') {
  const sounds = {
    correct: require('@/assets/sounds/correct.mp3'),
    wrong: require('@/assets/sounds/wrong.mp3'),
    complete: require('@/assets/sounds/complete.mp3'),
  };

  if (!soundCache[name]) {
    const { sound } = await Audio.Sound.createAsync(sounds[name]);
    soundCache[name] = sound;
  }

  await soundCache[name].replayAsync();
}
```

**필요 작업**:
1. `assets/sounds/` 폴더 생성
2. 무료 효과음 다운로드 (freesound.org 등)
3. feedbackService에 통합

---

## Phase 3: 코드 정리

### 3.1 중복 Store 통합

**현재 상태**:
- `store/diaryStore.ts`: 일기 관리
- `store/journalStore.ts`: 저널 관리 (기능 겹침)

**목표**: 하나로 통합 (journalStore 유지, diaryStore 제거)

**작업 순서**:
1. 두 Store의 기능 비교
2. diaryStore 사용처 확인
3. journalStore로 마이그레이션
4. diaryStore 제거

### 3.2 미사용 컴포넌트 정리

**제거 대상**:
- `components/common/AnimatedButton.tsx` - 미사용
- `components/common/LoadingSpinner.tsx` - 미사용
- `components/common/Toast.tsx` - 미사용
- `components/learn/KonglishAlert.tsx` - 미사용

**작업 순서**:
1. 각 컴포넌트 import 검색 (`grep`으로 확인)
2. 사용처 없으면 삭제
3. 나중에 필요하면 git에서 복구 가능

---

## 작업 체크리스트

### Phase 1
- [ ] VocabularyView에 useSrsStore 연결
- [ ] handleUnknown에서 addWord 호출
- [ ] ListeningView에 Dictation 모드 추가
- [ ] SpeakingView에 Shadowing 모드 추가
- [ ] VocabularyView에 MinimalPairs 연결

### Phase 2
- [ ] learn.tsx에 오늘의 복습 카드 추가
- [ ] SRS 복습 화면 생성 (`app/learn/srs-review.tsx`)
- [ ] 효과음 파일 추가
- [ ] feedbackService에 효과음 통합

### Phase 3
- [ ] diaryStore/journalStore 비교 분석
- [ ] Store 통합 결정
- [ ] 미사용 컴포넌트 삭제

---

## 참고: 이미 구현된 핵심 기능들

| 기능 | 파일 | 상태 | 설명 |
|------|------|------|------|
| TTS | FlashCard.tsx | 작동 중 | 볼륨 버튼으로 발음 듣기 |
| SRS 알고리즘 | srsStore.ts | 구현됨 | SM-2 기반 복습 스케줄 |
| 받아쓰기 | Dictation.tsx | 구현됨 | 듣고 타이핑 |
| 쉐도잉 | Shadowing.tsx | 구현됨 | 따라 읽기 + 녹음 |
| 발음 구분 | MinimalPairs.tsx | 구현됨 | ship/sheep 구분 |
| 진동 피드백 | feedbackService.ts | 작동 중 | 정답/오답 진동 |

---

**작성자**: Claude
**다음 단계**: Phase 1 작업부터 순서대로 진행

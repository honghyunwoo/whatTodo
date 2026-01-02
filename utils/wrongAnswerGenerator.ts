/**
 * Wrong Answer Generator
 *
 * 오답 복습 시 유사 오답(distractor) 생성
 * 4지선다 보장: 정답(1) + 사용자오답(1) + 유사오답(2)
 *
 * 안전장치:
 * 1. sameTypeOnly - 같은 타입/패턴만 distractor로 사용
 * 2. levelCap - 레벨별 난이도 제한
 */

import { ActivityType, CEFRLevel } from '@/types/activity';
import { WrongAnswer } from '@/store/wrongAnswerStore';
import { packLoader } from '@/services/packLoader';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

/** Distractor 난이도 레벨 */
type DistractorDifficulty = 'simple' | 'moderate' | 'advanced';

/** Distractor 생성 설정 */
interface DistractorConfig {
  /** 안전장치 1: 정답과 동일한 타입/패턴만 */
  sameTypeOnly: boolean;
  /** 안전장치 2: 레벨별 난이도 캡 */
  levelCap: Record<CEFRLevel, DistractorDifficulty>;
}

/** 생성된 옵션 */
export interface GeneratedOptions {
  options: string[];
  correctIndex: number;
  userWrongIndex: number;
}

// ─────────────────────────────────────
// Configuration
// ─────────────────────────────────────

const DEFAULT_CONFIG: DistractorConfig = {
  sameTypeOnly: true,
  levelCap: {
    A1: 'simple', // 철자/형태 차이 정도 (너무 교묘 금지)
    A2: 'simple',
    B1: 'moderate', // 의미 유사성 허용
    B2: 'moderate',
    C1: 'advanced', // 뉘앙스/콜로케이션 차이 허용
    C2: 'advanced',
  },
};

// ─────────────────────────────────────
// Fallback Distractors
// ─────────────────────────────────────

/**
 * 활동 타입별 폴백 오답 풀
 * 팩/인덱스에 데이터가 없을 때 사용
 */
const FALLBACK_DISTRACTORS: Record<ActivityType, Record<DistractorDifficulty, string[]>> = {
  vocabulary: {
    simple: ['apple', 'book', 'car', 'dog', 'house', 'water', 'friend', 'school', 'family', 'work'],
    moderate: [
      'accomplish',
      'beneficial',
      'consider',
      'determine',
      'establish',
      'facilitate',
      'generate',
    ],
    advanced: ['ubiquitous', 'paradigm', 'quintessential', 'ephemeral', 'conundrum', 'serendipity'],
  },
  grammar: {
    simple: ['is', 'are', 'was', 'were', 'am', 'be', 'do', 'does', 'did', 'have', 'has', 'had'],
    moderate: ['would', 'could', 'should', 'might', 'must', 'shall', 'will', 'can', 'may'],
    advanced: [
      'would have been',
      'could have been',
      'should have been',
      'might have been',
      'must have been',
    ],
  },
  reading: {
    simple: ['Yes', 'No', 'True', 'False', 'Maybe'],
    moderate: [
      'It is mentioned in the passage',
      'It is not mentioned',
      'The author agrees',
      'The author disagrees',
    ],
    advanced: [
      'The author implies',
      'It can be inferred',
      'The passage suggests',
      'Based on the context',
    ],
  },
  listening: {
    simple: ['Yes', 'No', 'True', 'False', 'Maybe'],
    moderate: ['The speaker mentioned', 'The speaker did not mention', 'According to the speaker'],
    advanced: ['The speaker implies', 'It can be inferred', 'The speaker suggests'],
  },
  speaking: {
    simple: ['Hello', 'Goodbye', 'Thank you', 'Please', 'Sorry'],
    moderate: ['I would like to', 'Could you please', 'Would you mind', 'I appreciate'],
    advanced: ['I would be grateful if', 'It would be my pleasure to', 'I cannot help but notice'],
  },
  writing: {
    simple: ['I think', 'I believe', 'In my opinion', 'I feel'],
    moderate: [
      'Furthermore',
      'Moreover',
      'In addition',
      'On the other hand',
      'However',
      'Nevertheless',
    ],
    advanced: ['Notwithstanding', 'Consequently', 'Correspondingly', 'Paradoxically', 'Ostensibly'],
  },
};

// ─────────────────────────────────────
// Generator Functions
// ─────────────────────────────────────

/**
 * 유사 오답 생성
 *
 * @param wrongAnswer - 현재 복습 중인 오답
 * @param allWrongAnswers - 전체 오답 목록 (같은 타입 선택용)
 * @param level - 사용자 레벨
 * @param config - 생성 설정
 * @returns 4개 이상의 선택지 (셔플됨)
 */
export function generateDistractors(
  wrongAnswer: WrongAnswer,
  allWrongAnswers: WrongAnswer[],
  level: CEFRLevel,
  config: DistractorConfig = DEFAULT_CONFIG
): GeneratedOptions {
  const { correctAnswer, userAnswer, type } = wrongAnswer;
  const difficulty = config.levelCap[level];

  // 기본 옵션: 정답 + 사용자 오답
  const baseOptions: string[] = [correctAnswer];
  if (userAnswer !== correctAnswer) {
    baseOptions.push(userAnswer);
  }

  // 유사 오답 찾기
  const distractors = findSimilarDistractors(
    wrongAnswer,
    allWrongAnswers,
    type,
    difficulty,
    baseOptions,
    config.sameTypeOnly
  );

  // 최소 4개 옵션 보장
  const allOptions = [...baseOptions, ...distractors];
  ensureMinimumOptions(allOptions, type, difficulty, 4);

  // 셔플
  const shuffled = shuffleArray([...allOptions]);
  const correctIndex = shuffled.indexOf(correctAnswer);
  const userWrongIndex = userAnswer !== correctAnswer ? shuffled.indexOf(userAnswer) : -1;

  return {
    options: shuffled,
    correctIndex,
    userWrongIndex,
  };
}

/**
 * 같은 타입의 다른 오답에서 유사 distractor 찾기
 */
function findSimilarDistractors(
  currentAnswer: WrongAnswer,
  allWrongAnswers: WrongAnswer[],
  type: ActivityType,
  _difficulty: DistractorDifficulty,
  excludeOptions: string[],
  sameTypeOnly: boolean
): string[] {
  const distractors: string[] = [];

  // 1. 같은 타입의 다른 오답에서 정답들 수집
  const sameTypeAnswers = sameTypeOnly
    ? allWrongAnswers.filter((wa) => wa.type === type && wa.id !== currentAnswer.id && !wa.mastered)
    : allWrongAnswers.filter((wa) => wa.id !== currentAnswer.id && !wa.mastered);

  for (const wa of sameTypeAnswers) {
    // 다른 문제의 정답을 distractor로 사용
    if (!excludeOptions.includes(wa.correctAnswer) && !distractors.includes(wa.correctAnswer)) {
      distractors.push(wa.correctAnswer);
      if (distractors.length >= 2) break;
    }
  }

  // 2. 팩 인덱스에서 유사 아이템 검색 (충분하지 않으면)
  if (distractors.length < 2 && currentAnswer.exerciseId) {
    try {
      const similarItems = packLoader.getSimilarItems(currentAnswer.exerciseId, {
        sameLevel: true,
        maxCount: 5,
      });

      for (const itemId of similarItems) {
        const itemInfo = packLoader.getItemInfo(itemId);
        if (itemInfo && itemInfo.type === type) {
          // 팩에서 실제 아이템 로드
          const packId = packLoader.getPackIdFromItem(itemId);
          const pack = packLoader.loadPack(packId);
          if (pack) {
            const itemAnswer = extractAnswerFromPack(pack, itemId, type);
            if (
              itemAnswer &&
              !excludeOptions.includes(itemAnswer) &&
              !distractors.includes(itemAnswer)
            ) {
              distractors.push(itemAnswer);
              if (distractors.length >= 2) break;
            }
          }
        }
      }
    } catch {
      // 팩 로더 사용 불가 시 무시
    }
  }

  return distractors;
}

/**
 * 팩에서 특정 아이템의 정답 추출
 */
function extractAnswerFromPack(
  pack: ReturnType<typeof packLoader.loadPack>,
  itemId: string,
  type: ActivityType
): string | null {
  if (!pack) return null;

  const parts = itemId.split(':');
  if (parts.length < 2) return null;

  try {
    switch (type) {
      case 'grammar': {
        const exercise = pack.grammar?.exercises?.find((ex) => ex.id === itemId);
        return exercise?.correctAnswer || null;
      }
      case 'vocabulary': {
        const word = pack.vocabulary?.words?.find((w) => w.id === itemId);
        return word?.word || null;
      }
      case 'reading': {
        const question = pack.reading?.questions?.find((q) => q.id === itemId);
        return question?.correctAnswer || null;
      }
      case 'listening': {
        const exercise = pack.listening?.exercises?.find((ex) => ex.id === itemId);
        return exercise?.correctAnswer || null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/**
 * 최소 옵션 개수 보장 (폴백 사용)
 */
function ensureMinimumOptions(
  options: string[],
  type: ActivityType,
  difficulty: DistractorDifficulty,
  minCount: number
): void {
  if (options.length >= minCount) return;

  const fallbacks = FALLBACK_DISTRACTORS[type]?.[difficulty] || [];
  const shuffledFallbacks = shuffleArray([...fallbacks]);

  for (const fallback of shuffledFallbacks) {
    if (!options.includes(fallback)) {
      options.push(fallback);
      if (options.length >= minCount) break;
    }
  }

  // 여전히 부족하면 다른 난이도에서도 가져옴
  if (options.length < minCount) {
    const allDifficulties: DistractorDifficulty[] = ['simple', 'moderate', 'advanced'];
    for (const diff of allDifficulties) {
      if (diff === difficulty) continue;
      const moreFallbacks = FALLBACK_DISTRACTORS[type]?.[diff] || [];
      for (const fallback of moreFallbacks) {
        if (!options.includes(fallback)) {
          options.push(fallback);
          if (options.length >= minCount) return;
        }
      }
    }
  }
}

/**
 * 배열 셔플 (Fisher-Yates)
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ─────────────────────────────────────
// Utility Exports
// ─────────────────────────────────────

export const wrongAnswerGenerator = {
  generateDistractors,
  /**
   * 간단한 4지선다 생성 (기본 설정)
   */
  generate4Options(
    wrongAnswer: WrongAnswer,
    allWrongAnswers: WrongAnswer[],
    level: CEFRLevel = 'A1'
  ): GeneratedOptions {
    return generateDistractors(wrongAnswer, allWrongAnswers, level);
  },

  /**
   * 기본 설정 가져오기
   */
  getDefaultConfig(): DistractorConfig {
    return { ...DEFAULT_CONFIG };
  },
};

export default wrongAnswerGenerator;

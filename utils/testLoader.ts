/**
 * 테스트 로더
 *
 * 레슨 콘텐츠에서 테스트 문제를 생성합니다.
 * - 문법 연습문제 → 테스트 문제로 변환
 * - 어휘 → 의미 맞추기 문제 생성
 * - 승급 테스트는 유닛 전체 범위
 */

import type { CEFRLevel } from '@/types/activity';
import type { TestMeta, TestQuestion } from '@/types/test';
import { loadLevelMeta, getLessonMeta, loadLessonActivity } from './lessonLoader';

// ─────────────────────────────────────
// 타입
// ─────────────────────────────────────

/** 문법 연습문제 (데이터 파일 형식) */
interface GrammarExercise {
  id: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_ordering';
  question: string;
  options?: string[];
  answer: string | string[];
  explanation?: string;
}

/** 문법 활동 (데이터 파일 형식) */
interface GrammarActivity {
  id: string;
  weekId: string;
  type: 'grammar';
  level: string;
  title: string;
  exercises: GrammarExercise[];
}

/** 어휘 단어 (데이터 파일 형식) */
interface VocabularyWord {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  synonyms?: string[];
}

/** 어휘 활동 (데이터 파일 형식) */
interface VocabularyActivity {
  id: string;
  weekId: string;
  type: 'vocabulary';
  level: string;
  title: string;
  words: VocabularyWord[];
}

// ─────────────────────────────────────
// 상수
// ─────────────────────────────────────

/** 테스트 기본 설정 */
const TEST_CONFIG = {
  lesson: {
    questionCount: 10,
    timeLimit: 10, // 분
    passingScore: 70,
    retakeAllowed: true,
    retakeCooldown: 0,
  },
  promotion: {
    questionCount: 15,
    timeLimit: 15,
    passingScore: 70,
    retakeAllowed: true,
    retakeCooldown: 1, // 1시간
  },
};

// ─────────────────────────────────────
// 문제 생성 함수
// ─────────────────────────────────────

/**
 * 문법 연습문제를 테스트 문제로 변환
 */
function convertGrammarExercise(
  exercise: GrammarExercise,
  lessonId: string,
  difficulty: number = 1
): TestQuestion | null {
  // sentence_ordering은 복잡하므로 일단 스킵
  if (exercise.type === 'sentence_ordering') {
    return null;
  }

  // fill_blank를 multiple_choice로 변환
  if (exercise.type === 'fill_blank') {
    // 빈칸 채우기는 정답을 포함한 선택지 생성 필요
    // 일단은 스킵하고 multiple_choice만 사용
    return null;
  }

  if (!exercise.options || exercise.options.length < 2) {
    return null;
  }

  return {
    id: `${lessonId}-${exercise.id}`,
    type: 'multiple_choice',
    activityType: 'grammar',
    question: exercise.question,
    options: exercise.options,
    answer: Array.isArray(exercise.answer) ? exercise.answer[0] : exercise.answer,
    explanation: exercise.explanation,
    difficulty,
    points: 10,
    lessonId,
  };
}

/**
 * 어휘에서 의미 맞추기 문제 생성
 */
function generateVocabMeaningQuestion(
  word: VocabularyWord,
  allWords: VocabularyWord[],
  lessonId: string,
  difficulty: number = 1
): TestQuestion | null {
  if (!word.meaning) return null;

  // 오답 선택지 생성 (같은 레슨의 다른 단어들)
  const otherWords = allWords.filter((w) => w.id !== word.id && w.meaning);
  if (otherWords.length < 3) return null;

  // 랜덤하게 3개 선택
  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  const wrongAnswers = shuffled.slice(0, 3).map((w) => w.meaning);

  // 정답 포함해서 섞기
  const options = [...wrongAnswers, word.meaning].sort(() => Math.random() - 0.5);

  return {
    id: `${lessonId}-vocab-${word.id}`,
    type: 'multiple_choice',
    activityType: 'vocabulary',
    question: `"${word.word}"의 의미는?`,
    options,
    answer: word.meaning,
    explanation: word.example ? `예문: ${word.example}` : undefined,
    difficulty,
    points: 10,
    lessonId,
  };
}

/**
 * 어휘에서 단어 맞추기 문제 생성 (영어 → 한국어)
 */
function generateVocabWordQuestion(
  word: VocabularyWord,
  allWords: VocabularyWord[],
  lessonId: string,
  difficulty: number = 1
): TestQuestion | null {
  if (!word.meaning) return null;

  const otherWords = allWords.filter((w) => w.id !== word.id && w.word);
  if (otherWords.length < 3) return null;

  const shuffled = [...otherWords].sort(() => Math.random() - 0.5);
  const wrongAnswers = shuffled.slice(0, 3).map((w) => w.word);

  const options = [...wrongAnswers, word.word].sort(() => Math.random() - 0.5);

  return {
    id: `${lessonId}-vocab-rev-${word.id}`,
    type: 'multiple_choice',
    activityType: 'vocabulary',
    question: `"${word.meaning}"을(를) 영어로?`,
    options,
    answer: word.word,
    explanation: word.example ? `예문: ${word.example}` : undefined,
    difficulty,
    points: 10,
    lessonId,
  };
}

// ─────────────────────────────────────
// 메인 함수
// ─────────────────────────────────────

/**
 * 레슨 테스트 생성
 */
export async function generateLessonTest(lessonId: string): Promise<{
  meta: TestMeta;
  questions: TestQuestion[];
} | null> {
  try {
    // lessonId 파싱 (e.g., "a1-u1-l1")
    const parts = lessonId.split('-');
    if (parts.length !== 3) {
      console.warn(`Invalid lesson ID format: ${lessonId}`);
      return null;
    }

    const level = parts[0].toUpperCase() as CEFRLevel;

    // 레슨 메타 로드
    const lessonMeta = await getLessonMeta(lessonId);
    if (!lessonMeta) {
      console.warn(`Lesson not found: ${lessonId}`);
      return null;
    }

    const questions: TestQuestion[] = [];

    // 1. 문법 문제 수집
    try {
      const grammarActivity = (await loadLessonActivity(
        lessonId,
        'grammar'
      )) as GrammarActivity | null;
      if (grammarActivity?.exercises) {
        for (const exercise of grammarActivity.exercises) {
          const question = convertGrammarExercise(exercise, lessonId);
          if (question) {
            questions.push(question);
          }
        }
      }
    } catch (e) {
      console.warn(`Failed to load grammar for ${lessonId}:`, e);
    }

    // 2. 어휘 문제 수집
    try {
      const vocabActivity = (await loadLessonActivity(
        lessonId,
        'vocabulary'
      )) as VocabularyActivity | null;
      if (vocabActivity?.words && vocabActivity.words.length >= 4) {
        const words = vocabActivity.words;

        // 어휘 문제 생성 (최대 5개씩)
        const meaningQuestions: TestQuestion[] = [];
        const wordQuestions: TestQuestion[] = [];

        for (const word of words) {
          const mq = generateVocabMeaningQuestion(word, words, lessonId);
          if (mq) meaningQuestions.push(mq);

          const wq = generateVocabWordQuestion(word, words, lessonId);
          if (wq) wordQuestions.push(wq);
        }

        // 각 유형에서 최대 3개씩 선택
        questions.push(...meaningQuestions.slice(0, 3));
        questions.push(...wordQuestions.slice(0, 2));
      }
    } catch (e) {
      console.warn(`Failed to load vocabulary for ${lessonId}:`, e);
    }

    // 문제가 없으면 null
    if (questions.length === 0) {
      console.warn(`No questions generated for ${lessonId}`);
      return null;
    }

    // 문제 섞기
    const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

    // 최대 문제 수 제한
    const finalQuestions = shuffledQuestions.slice(0, TEST_CONFIG.lesson.questionCount);

    // 테스트 메타 생성
    const meta: TestMeta = {
      id: `test-${lessonId}`,
      type: 'lesson',
      title: `${lessonMeta.title} Test`,
      description: `${lessonMeta.subtitle || lessonMeta.title} 레슨 테스트`,
      level,
      lessonId,
      questionCount: finalQuestions.length,
      timeLimit: TEST_CONFIG.lesson.timeLimit,
      passingScore: TEST_CONFIG.lesson.passingScore,
      retakeAllowed: TEST_CONFIG.lesson.retakeAllowed,
      retakeCooldown: TEST_CONFIG.lesson.retakeCooldown,
    };

    return { meta, questions: finalQuestions };
  } catch (error) {
    console.error(`Failed to generate lesson test for ${lessonId}:`, error);
    return null;
  }
}

/**
 * 승급 테스트 생성 (유닛 전체 범위)
 */
export async function generatePromotionTest(unitId: string): Promise<{
  meta: TestMeta;
  questions: TestQuestion[];
} | null> {
  try {
    // unitId 파싱 (e.g., "a1-u1")
    const parts = unitId.split('-');
    if (parts.length !== 2) {
      console.warn(`Invalid unit ID format: ${unitId}`);
      return null;
    }

    const level = parts[0].toUpperCase() as CEFRLevel;
    const levelMeta = await loadLevelMeta(level);
    if (!levelMeta) {
      console.warn(`Level not found: ${level}`);
      return null;
    }

    // 유닛 찾기
    const unit = levelMeta.units.find((u) => u.id === unitId);
    if (!unit) {
      console.warn(`Unit not found: ${unitId}`);
      return null;
    }

    // 모든 레슨에서 문제 수집
    const allQuestions: TestQuestion[] = [];

    for (const lesson of unit.lessons) {
      const lessonTest = await generateLessonTest(lesson.id);
      if (lessonTest) {
        allQuestions.push(...lessonTest.questions);
      }
    }

    if (allQuestions.length === 0) {
      console.warn(`No questions generated for unit ${unitId}`);
      return null;
    }

    // 문제 섞고 제한
    const shuffledQuestions = [...allQuestions].sort(() => Math.random() - 0.5);
    const finalQuestions = shuffledQuestions.slice(0, TEST_CONFIG.promotion.questionCount);

    // 테스트 메타 생성
    const meta: TestMeta = {
      id: `promotion-${unitId}`,
      type: 'promotion',
      title: `${unit.title} Promotion Test`,
      description: `${unit.description || unit.title} 승급 테스트`,
      level,
      unitId,
      questionCount: finalQuestions.length,
      timeLimit: TEST_CONFIG.promotion.timeLimit,
      passingScore: TEST_CONFIG.promotion.passingScore,
      retakeAllowed: TEST_CONFIG.promotion.retakeAllowed,
      retakeCooldown: TEST_CONFIG.promotion.retakeCooldown,
    };

    return { meta, questions: finalQuestions };
  } catch (error) {
    console.error(`Failed to generate promotion test for ${unitId}:`, error);
    return null;
  }
}

/**
 * 테스트 ID로 테스트 로드
 */
export async function loadTest(testId: string): Promise<{
  meta: TestMeta;
  questions: TestQuestion[];
} | null> {
  // 레슨 테스트
  if (testId.startsWith('test-')) {
    const lessonId = testId.replace('test-', '');
    return generateLessonTest(lessonId);
  }

  // 승급 테스트
  if (testId.startsWith('promotion-')) {
    const unitId = testId.replace('promotion-', '');
    return generatePromotionTest(unitId);
  }

  console.warn(`Unknown test ID format: ${testId}`);
  return null;
}

/**
 * 레슨 테스트 가능 여부 확인
 */
export async function canTakeLessonTest(lessonId: string): Promise<boolean> {
  const test = await generateLessonTest(lessonId);
  return test !== null && test.questions.length >= 3;
}

/**
 * 승급 테스트 가능 여부 확인
 */
export async function canTakePromotionTest(unitId: string): Promise<boolean> {
  const test = await generatePromotionTest(unitId);
  return test !== null && test.questions.length >= 5;
}

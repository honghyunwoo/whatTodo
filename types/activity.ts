// ─────────────────────────────────────
// 기본 타입 (Enums)
// ─────────────────────────────────────

/** 활동 타입 (6종류) */
export type ActivityType =
  | 'vocabulary'
  | 'grammar'
  | 'listening'
  | 'reading'
  | 'speaking'
  | 'writing';

/** CEFR 레벨 (A1-C2 전체 지원) */
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** CEFR 전체 레벨 (표준 6단계) */
export type FullCEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** 품사 */
export type PartOfSpeech =
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'interjection'
  | 'pronoun'
  | 'phrase'; // JSON에서 사용됨

/** 문제 타입 */
export type ExerciseType =
  | 'multiple_choice'
  | 'fill_blank'
  | 'translation_ko_en'
  | 'translation_en_ko'
  | 'true_false'
  | 'ordering'
  | 'short_answer'; // JSON에서 사용됨

// ─────────────────────────────────────
// 기본 인터페이스
// ─────────────────────────────────────

/** 단어 */
export interface Word {
  id: string;
  word: string;
  pronunciation: string; // IPA: /həˈloʊ/
  partOfSpeech: PartOfSpeech;
  meaning: string; // 한국어 뜻
  example: string; // 영어 예문
  exampleMeaning: string; // 한국어 해석
}

/** 문법 규칙 */
export interface GrammarRule {
  id: string;
  rule: string;
  explanation: string;
  examples: GrammarExample[];
}

export interface GrammarExample {
  sentence: string;
  translation: string;
}

/** 문제 */
export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
}

/** 평가 체크리스트 */
export interface EvaluationChecklist {
  category: string;
  items: string[];
}

// ─────────────────────────────────────
// 활동별 인터페이스
// ─────────────────────────────────────

/** 기본 활동 인터페이스 */
interface BaseActivity {
  id: string;
  weekId: string; // 'week-1', 'week-2', ...
  type: ActivityType;
  level: CEFRLevel;
  title: string;
  description?: string;
}

/** 어휘 활동 */
export interface VocabularyActivity extends BaseActivity {
  type: 'vocabulary';
  words: Word[];
}

/** 문법 활동 */
export interface GrammarActivity extends BaseActivity {
  type: 'grammar';
  rules: GrammarRule[];
  exercises: Exercise[];
}

/** 듣기 활동 */
export interface ListeningActivity extends BaseActivity {
  type: 'listening';
  audio: {
    text: string; // TTS용 텍스트
    speed: number; // 0.5~1.5
  };
  dictation?: {
    targetSentences: string[];
  };
  questions: Exercise[];
}

/** 읽기 활동 */
export interface ReadingActivity extends BaseActivity {
  type: 'reading';
  passage: {
    text: string;
    wordCount: number;
  };
  vocabulary: ReadingVocabulary[];
  questions: Exercise[];
}

export interface ReadingVocabulary {
  word: string;
  meaning: string;
}

/** 말하기 활동 - 실제 JSON 구조 반영 */
export interface SpeakingActivity extends BaseActivity {
  type: 'speaking';
  sentences: SpeakingSentence[];
  evaluationChecklist?: EvaluationChecklist[];
}

export interface SpeakingSentence {
  id: string;
  text: string;
  translation: string;
  tips: string;
}

/** 쓰기 활동 - 실제 JSON 구조 반영 */
export interface WritingActivity extends BaseActivity {
  type: 'writing';
  prompt: WritingPromptData;
  exampleSentences?: WritingExample[];
  vocabularyHelp?: VocabularyHelpItem[];
  evaluationChecklist?: EvaluationChecklist[];
}

export interface WritingPromptData {
  topic: string;
  description: string;
  requirements: string[];
  wordCount: {
    min: number;
    max: number;
  };
  timeLimit: number; // 분
}

export interface WritingExample {
  id: string;
  sentence: string;
  translation: string;
  useCase: string;
}

export interface VocabularyHelpItem {
  word: string;
  translation: string;
  example: string;
}

/** 모든 활동 유니온 타입 */
export type Activity =
  | VocabularyActivity
  | GrammarActivity
  | ListeningActivity
  | ReadingActivity
  | SpeakingActivity
  | WritingActivity;

// ─────────────────────────────────────
// 진행률 인터페이스
// ─────────────────────────────────────

/** 활동별 진행률 */
export interface LearnProgress {
  activityId: string;
  weekId: string;
  type: ActivityType;
  completed: boolean;
  score: number; // 0-100
  timeSpent: number; // 초
  lastAttempt: string; // ISO date

  // 활동별 상세
  wordsMastered?: number; // vocabulary
  exercisesCorrect?: number; // grammar, listening, reading
  exercisesTotal?: number;
}

/** 주차별 진행률 */
export interface WeekProgress {
  weekId: string;
  level: CEFRLevel;
  activitiesCompleted: string[];
  totalScore: number;
  startedAt: string;
  completedAt?: string;
}

// ─────────────────────────────────────
// UI 관련 타입
// ─────────────────────────────────────

/** 퀴즈 결과 */
export interface QuizResult {
  exerciseId: string;
  correct: boolean;
  userAnswer: string;
  timeSpent: number; // 초
}

/** 플래시카드 결과 */
export interface FlashCardResult {
  wordId: string;
  known: boolean;
  attempts: number;
}

/** 활동 카드 표시용 */
export interface ActivityCardData {
  type: ActivityType;
  title: string;
  icon: string;
  progress: number; // 0-100
  completed: boolean;
}

/** 주차 정보 */
export interface WeekData {
  id: string;
  weekNumber: number;
  level: CEFRLevel;
  theme?: string;
  activities: ActivityType[];
}

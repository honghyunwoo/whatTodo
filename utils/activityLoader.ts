import {
  Activity,
  ActivityType,
  CEFRLevel,
  GrammarActivity,
  ListeningActivity,
  ReadingActivity,
  SpeakingActivity,
  VocabularyActivity,
  WritingActivity,
} from '@/types/activity';

// ─────────────────────────────────────
// 정적 JSON Import (Metro bundler 호환)
// ─────────────────────────────────────

// A1 Vocabulary
import a1Week1Vocab from '@/data/activities/a1/vocabulary/week-1-vocab.json';
import a1Week2Vocab from '@/data/activities/a1/vocabulary/week-2-vocab.json';
import a1Week3Vocab from '@/data/activities/a1/vocabulary/week-3-vocab.json';
import a1Week4Vocab from '@/data/activities/a1/vocabulary/week-4-vocab.json';
import a1Week5Vocab from '@/data/activities/a1/vocabulary/week-5-vocab.json';
import a1Week6Vocab from '@/data/activities/a1/vocabulary/week-6-vocab.json';
import a1Week7Vocab from '@/data/activities/a1/vocabulary/week-7-vocab.json';
import a1Week8Vocab from '@/data/activities/a1/vocabulary/week-8-vocab.json';

// A1 Grammar
import a1Week1Grammar from '@/data/activities/a1/grammar/week-1-grammar.json';
import a1Week2Grammar from '@/data/activities/a1/grammar/week-2-grammar.json';
import a1Week3Grammar from '@/data/activities/a1/grammar/week-3-grammar.json';
import a1Week4Grammar from '@/data/activities/a1/grammar/week-4-grammar.json';
import a1Week5Grammar from '@/data/activities/a1/grammar/week-5-grammar.json';
import a1Week6Grammar from '@/data/activities/a1/grammar/week-6-grammar.json';
import a1Week7Grammar from '@/data/activities/a1/grammar/week-7-grammar.json';
import a1Week8Grammar from '@/data/activities/a1/grammar/week-8-grammar.json';

// A1 Listening
import a1Week1Listening from '@/data/activities/a1/listening/week-1-listening.json';
import a1Week2Listening from '@/data/activities/a1/listening/week-2-listening.json';
import a1Week3Listening from '@/data/activities/a1/listening/week-3-listening.json';
import a1Week4Listening from '@/data/activities/a1/listening/week-4-listening.json';
import a1Week5Listening from '@/data/activities/a1/listening/week-5-listening.json';
import a1Week6Listening from '@/data/activities/a1/listening/week-6-listening.json';
import a1Week7Listening from '@/data/activities/a1/listening/week-7-listening.json';
import a1Week8Listening from '@/data/activities/a1/listening/week-8-listening.json';

// A1 Reading
import a1Week1Reading from '@/data/activities/a1/reading/week-1-reading.json';
import a1Week2Reading from '@/data/activities/a1/reading/week-2-reading.json';
import a1Week3Reading from '@/data/activities/a1/reading/week-3-reading.json';
import a1Week4Reading from '@/data/activities/a1/reading/week-4-reading.json';
import a1Week5Reading from '@/data/activities/a1/reading/week-5-reading.json';
import a1Week6Reading from '@/data/activities/a1/reading/week-6-reading.json';
import a1Week7Reading from '@/data/activities/a1/reading/week-7-reading.json';
import a1Week8Reading from '@/data/activities/a1/reading/week-8-reading.json';

// A1 Speaking
import a1Week1Speaking from '@/data/activities/a1/speaking/week-1-speaking.json';
import a1Week2Speaking from '@/data/activities/a1/speaking/week-2-speaking.json';
import a1Week3Speaking from '@/data/activities/a1/speaking/week-3-speaking.json';
import a1Week4Speaking from '@/data/activities/a1/speaking/week-4-speaking.json';
import a1Week5Speaking from '@/data/activities/a1/speaking/week-5-speaking.json';
import a1Week6Speaking from '@/data/activities/a1/speaking/week-6-speaking.json';
import a1Week7Speaking from '@/data/activities/a1/speaking/week-7-speaking.json';
import a1Week8Speaking from '@/data/activities/a1/speaking/week-8-speaking.json';

// A1 Writing
import a1Week1Writing from '@/data/activities/a1/writing/week-1-writing.json';
import a1Week2Writing from '@/data/activities/a1/writing/week-2-writing.json';
import a1Week3Writing from '@/data/activities/a1/writing/week-3-writing.json';
import a1Week4Writing from '@/data/activities/a1/writing/week-4-writing.json';
import a1Week5Writing from '@/data/activities/a1/writing/week-5-writing.json';
import a1Week6Writing from '@/data/activities/a1/writing/week-6-writing.json';
import a1Week7Writing from '@/data/activities/a1/writing/week-7-writing.json';
import a1Week8Writing from '@/data/activities/a1/writing/week-8-writing.json';

// A2 Vocabulary
import a2Week1Vocab from '@/data/activities/a2/vocabulary/week-1-vocab.json';
import a2Week2Vocab from '@/data/activities/a2/vocabulary/week-2-vocab.json';
import a2Week3Vocab from '@/data/activities/a2/vocabulary/week-3-vocab.json';
import a2Week4Vocab from '@/data/activities/a2/vocabulary/week-4-vocab.json';
import a2Week5Vocab from '@/data/activities/a2/vocabulary/week-5-vocab.json';
import a2Week6Vocab from '@/data/activities/a2/vocabulary/week-6-vocab.json';
import a2Week7Vocab from '@/data/activities/a2/vocabulary/week-7-vocab.json';
import a2Week8Vocab from '@/data/activities/a2/vocabulary/week-8-vocab.json';

// A2 Grammar
import a2Week1Grammar from '@/data/activities/a2/grammar/week-1-grammar.json';
import a2Week2Grammar from '@/data/activities/a2/grammar/week-2-grammar.json';
import a2Week3Grammar from '@/data/activities/a2/grammar/week-3-grammar.json';
import a2Week4Grammar from '@/data/activities/a2/grammar/week-4-grammar.json';
import a2Week5Grammar from '@/data/activities/a2/grammar/week-5-grammar.json';
import a2Week6Grammar from '@/data/activities/a2/grammar/week-6-grammar.json';
import a2Week7Grammar from '@/data/activities/a2/grammar/week-7-grammar.json';
import a2Week8Grammar from '@/data/activities/a2/grammar/week-8-grammar.json';

// A2 Listening
import a2Week1Listening from '@/data/activities/a2/listening/week-1-listening.json';
import a2Week2Listening from '@/data/activities/a2/listening/week-2-listening.json';
import a2Week3Listening from '@/data/activities/a2/listening/week-3-listening.json';
import a2Week4Listening from '@/data/activities/a2/listening/week-4-listening.json';
import a2Week5Listening from '@/data/activities/a2/listening/week-5-listening.json';
import a2Week6Listening from '@/data/activities/a2/listening/week-6-listening.json';
import a2Week7Listening from '@/data/activities/a2/listening/week-7-listening.json';
import a2Week8Listening from '@/data/activities/a2/listening/week-8-listening.json';

// A2 Reading
import a2Week1Reading from '@/data/activities/a2/reading/week-1-reading.json';
import a2Week2Reading from '@/data/activities/a2/reading/week-2-reading.json';
import a2Week3Reading from '@/data/activities/a2/reading/week-3-reading.json';
import a2Week4Reading from '@/data/activities/a2/reading/week-4-reading.json';
import a2Week5Reading from '@/data/activities/a2/reading/week-5-reading.json';
import a2Week6Reading from '@/data/activities/a2/reading/week-6-reading.json';
import a2Week7Reading from '@/data/activities/a2/reading/week-7-reading.json';
import a2Week8Reading from '@/data/activities/a2/reading/week-8-reading.json';

// A2 Speaking
import a2Week1Speaking from '@/data/activities/a2/speaking/week-1-speaking.json';
import a2Week2Speaking from '@/data/activities/a2/speaking/week-2-speaking.json';
import a2Week3Speaking from '@/data/activities/a2/speaking/week-3-speaking.json';
import a2Week4Speaking from '@/data/activities/a2/speaking/week-4-speaking.json';
import a2Week5Speaking from '@/data/activities/a2/speaking/week-5-speaking.json';
import a2Week6Speaking from '@/data/activities/a2/speaking/week-6-speaking.json';
import a2Week7Speaking from '@/data/activities/a2/speaking/week-7-speaking.json';
import a2Week8Speaking from '@/data/activities/a2/speaking/week-8-speaking.json';

// A2 Writing
import a2Week1Writing from '@/data/activities/a2/writing/week-1-writing.json';
import a2Week2Writing from '@/data/activities/a2/writing/week-2-writing.json';
import a2Week3Writing from '@/data/activities/a2/writing/week-3-writing.json';
import a2Week4Writing from '@/data/activities/a2/writing/week-4-writing.json';
import a2Week5Writing from '@/data/activities/a2/writing/week-5-writing.json';
import a2Week6Writing from '@/data/activities/a2/writing/week-6-writing.json';
import a2Week7Writing from '@/data/activities/a2/writing/week-7-writing.json';
import a2Week8Writing from '@/data/activities/a2/writing/week-8-writing.json';

// B1 Vocabulary
import b1Week1Vocab from '@/data/activities/b1/vocabulary/week-1-vocab.json';
import b1Week2Vocab from '@/data/activities/b1/vocabulary/week-2-vocab.json';
import b1Week3Vocab from '@/data/activities/b1/vocabulary/week-3-vocab.json';
import b1Week4Vocab from '@/data/activities/b1/vocabulary/week-4-vocab.json';
import b1Week5Vocab from '@/data/activities/b1/vocabulary/week-5-vocab.json';
import b1Week6Vocab from '@/data/activities/b1/vocabulary/week-6-vocab.json';
import b1Week7Vocab from '@/data/activities/b1/vocabulary/week-7-vocab.json';
import b1Week8Vocab from '@/data/activities/b1/vocabulary/week-8-vocab.json';

// B1 Grammar
import b1Week1Grammar from '@/data/activities/b1/grammar/week-1-grammar.json';
import b1Week2Grammar from '@/data/activities/b1/grammar/week-2-grammar.json';
import b1Week3Grammar from '@/data/activities/b1/grammar/week-3-grammar.json';
import b1Week4Grammar from '@/data/activities/b1/grammar/week-4-grammar.json';
import b1Week5Grammar from '@/data/activities/b1/grammar/week-5-grammar.json';
import b1Week6Grammar from '@/data/activities/b1/grammar/week-6-grammar.json';
import b1Week7Grammar from '@/data/activities/b1/grammar/week-7-grammar.json';
import b1Week8Grammar from '@/data/activities/b1/grammar/week-8-grammar.json';

// B1 Listening
import b1Week1Listening from '@/data/activities/b1/listening/week-1-listening.json';
import b1Week2Listening from '@/data/activities/b1/listening/week-2-listening.json';
import b1Week3Listening from '@/data/activities/b1/listening/week-3-listening.json';
import b1Week4Listening from '@/data/activities/b1/listening/week-4-listening.json';
import b1Week5Listening from '@/data/activities/b1/listening/week-5-listening.json';
import b1Week6Listening from '@/data/activities/b1/listening/week-6-listening.json';
import b1Week7Listening from '@/data/activities/b1/listening/week-7-listening.json';
import b1Week8Listening from '@/data/activities/b1/listening/week-8-listening.json';

// B1 Reading
import b1Week1Reading from '@/data/activities/b1/reading/week-1-reading.json';
import b1Week2Reading from '@/data/activities/b1/reading/week-2-reading.json';
import b1Week3Reading from '@/data/activities/b1/reading/week-3-reading.json';
import b1Week4Reading from '@/data/activities/b1/reading/week-4-reading.json';
import b1Week5Reading from '@/data/activities/b1/reading/week-5-reading.json';
import b1Week6Reading from '@/data/activities/b1/reading/week-6-reading.json';
import b1Week7Reading from '@/data/activities/b1/reading/week-7-reading.json';
import b1Week8Reading from '@/data/activities/b1/reading/week-8-reading.json';

// B1 Speaking
import b1Week1Speaking from '@/data/activities/b1/speaking/week-1-speaking.json';
import b1Week2Speaking from '@/data/activities/b1/speaking/week-2-speaking.json';
import b1Week3Speaking from '@/data/activities/b1/speaking/week-3-speaking.json';
import b1Week4Speaking from '@/data/activities/b1/speaking/week-4-speaking.json';
import b1Week5Speaking from '@/data/activities/b1/speaking/week-5-speaking.json';
import b1Week6Speaking from '@/data/activities/b1/speaking/week-6-speaking.json';
import b1Week7Speaking from '@/data/activities/b1/speaking/week-7-speaking.json';
import b1Week8Speaking from '@/data/activities/b1/speaking/week-8-speaking.json';

// B1 Writing
import b1Week1Writing from '@/data/activities/b1/writing/week-1-writing.json';
import b1Week2Writing from '@/data/activities/b1/writing/week-2-writing.json';
import b1Week3Writing from '@/data/activities/b1/writing/week-3-writing.json';
import b1Week4Writing from '@/data/activities/b1/writing/week-4-writing.json';
import b1Week5Writing from '@/data/activities/b1/writing/week-5-writing.json';
import b1Week6Writing from '@/data/activities/b1/writing/week-6-writing.json';
import b1Week7Writing from '@/data/activities/b1/writing/week-7-writing.json';
import b1Week8Writing from '@/data/activities/b1/writing/week-8-writing.json';

// B2 Vocabulary
import b2Week1Vocab from '@/data/activities/b2/vocabulary/week-1-vocab.json';
import b2Week2Vocab from '@/data/activities/b2/vocabulary/week-2-vocab.json';
import b2Week3Vocab from '@/data/activities/b2/vocabulary/week-3-vocab.json';
import b2Week4Vocab from '@/data/activities/b2/vocabulary/week-4-vocab.json';
import b2Week5Vocab from '@/data/activities/b2/vocabulary/week-5-vocab.json';
import b2Week6Vocab from '@/data/activities/b2/vocabulary/week-6-vocab.json';
import b2Week7Vocab from '@/data/activities/b2/vocabulary/week-7-vocab.json';
import b2Week8Vocab from '@/data/activities/b2/vocabulary/week-8-vocab.json';

// B2 Grammar
import b2Week1Grammar from '@/data/activities/b2/grammar/week-1-grammar.json';
import b2Week2Grammar from '@/data/activities/b2/grammar/week-2-grammar.json';
import b2Week3Grammar from '@/data/activities/b2/grammar/week-3-grammar.json';
import b2Week4Grammar from '@/data/activities/b2/grammar/week-4-grammar.json';
import b2Week5Grammar from '@/data/activities/b2/grammar/week-5-grammar.json';
import b2Week6Grammar from '@/data/activities/b2/grammar/week-6-grammar.json';
import b2Week7Grammar from '@/data/activities/b2/grammar/week-7-grammar.json';
import b2Week8Grammar from '@/data/activities/b2/grammar/week-8-grammar.json';

// B2 Listening
import b2Week1Listening from '@/data/activities/b2/listening/week-1-listening.json';
import b2Week2Listening from '@/data/activities/b2/listening/week-2-listening.json';
import b2Week3Listening from '@/data/activities/b2/listening/week-3-listening.json';
import b2Week4Listening from '@/data/activities/b2/listening/week-4-listening.json';
import b2Week5Listening from '@/data/activities/b2/listening/week-5-listening.json';
import b2Week6Listening from '@/data/activities/b2/listening/week-6-listening.json';
import b2Week7Listening from '@/data/activities/b2/listening/week-7-listening.json';
import b2Week8Listening from '@/data/activities/b2/listening/week-8-listening.json';

// B2 Reading
import b2Week1Reading from '@/data/activities/b2/reading/week-1-reading.json';
import b2Week2Reading from '@/data/activities/b2/reading/week-2-reading.json';
import b2Week3Reading from '@/data/activities/b2/reading/week-3-reading.json';
import b2Week4Reading from '@/data/activities/b2/reading/week-4-reading.json';
import b2Week5Reading from '@/data/activities/b2/reading/week-5-reading.json';
import b2Week6Reading from '@/data/activities/b2/reading/week-6-reading.json';
import b2Week7Reading from '@/data/activities/b2/reading/week-7-reading.json';
import b2Week8Reading from '@/data/activities/b2/reading/week-8-reading.json';

// B2 Speaking
import b2Week1Speaking from '@/data/activities/b2/speaking/week-1-speaking.json';
import b2Week2Speaking from '@/data/activities/b2/speaking/week-2-speaking.json';
import b2Week3Speaking from '@/data/activities/b2/speaking/week-3-speaking.json';
import b2Week4Speaking from '@/data/activities/b2/speaking/week-4-speaking.json';
import b2Week5Speaking from '@/data/activities/b2/speaking/week-5-speaking.json';
import b2Week6Speaking from '@/data/activities/b2/speaking/week-6-speaking.json';
import b2Week7Speaking from '@/data/activities/b2/speaking/week-7-speaking.json';
import b2Week8Speaking from '@/data/activities/b2/speaking/week-8-speaking.json';

// B2 Writing
import b2Week1Writing from '@/data/activities/b2/writing/week-1-writing.json';
import b2Week2Writing from '@/data/activities/b2/writing/week-2-writing.json';
import b2Week3Writing from '@/data/activities/b2/writing/week-3-writing.json';
import b2Week4Writing from '@/data/activities/b2/writing/week-4-writing.json';
import b2Week5Writing from '@/data/activities/b2/writing/week-5-writing.json';
import b2Week6Writing from '@/data/activities/b2/writing/week-6-writing.json';
import b2Week7Writing from '@/data/activities/b2/writing/week-7-writing.json';
import b2Week8Writing from '@/data/activities/b2/writing/week-8-writing.json';

// ─────────────────────────────────────
// CEFR 레벨 (types/activity.ts에서 import)
// ─────────────────────────────────────

// Re-export for backward compatibility
export type { CEFRLevel };

// 현재 앱에서 지원하는 레벨 (A1-B2, 향후 C1-C2 추가 예정)
export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export const CEFR_LEVEL_INFO: Record<CEFRLevel, { name: string; description: string }> = {
  A1: { name: 'Beginner', description: 'Basic phrases and expressions' },
  A2: { name: 'Elementary', description: 'Everyday expressions and simple sentences' },
  B1: { name: 'Intermediate', description: 'Main points and simple connected text' },
  B2: { name: 'Upper Intermediate', description: 'Complex text and abstract topics' },
  C1: { name: 'Advanced', description: 'Complex text and spontaneous expression' },
  C2: { name: 'Proficiency', description: 'Near-native fluency and precision' },
};

// ─────────────────────────────────────
// 정적 데이터 맵
// ─────────────────────────────────────

type ActivityData = Record<ActivityType, Record<string, Activity>>;
type LevelActivityData = Record<CEFRLevel, ActivityData>;

 
const castActivity = <T>(data: any): T => data as T;

const ACTIVITIES: LevelActivityData = {
  A1: {
    vocabulary: {
      'week-1': castActivity<VocabularyActivity>(a1Week1Vocab),
      'week-2': castActivity<VocabularyActivity>(a1Week2Vocab),
      'week-3': castActivity<VocabularyActivity>(a1Week3Vocab),
      'week-4': castActivity<VocabularyActivity>(a1Week4Vocab),
      'week-5': castActivity<VocabularyActivity>(a1Week5Vocab),
      'week-6': castActivity<VocabularyActivity>(a1Week6Vocab),
      'week-7': castActivity<VocabularyActivity>(a1Week7Vocab),
      'week-8': castActivity<VocabularyActivity>(a1Week8Vocab),
    },
    grammar: {
      'week-1': castActivity<GrammarActivity>(a1Week1Grammar),
      'week-2': castActivity<GrammarActivity>(a1Week2Grammar),
      'week-3': castActivity<GrammarActivity>(a1Week3Grammar),
      'week-4': castActivity<GrammarActivity>(a1Week4Grammar),
      'week-5': castActivity<GrammarActivity>(a1Week5Grammar),
      'week-6': castActivity<GrammarActivity>(a1Week6Grammar),
      'week-7': castActivity<GrammarActivity>(a1Week7Grammar),
      'week-8': castActivity<GrammarActivity>(a1Week8Grammar),
    },
    listening: {
      'week-1': castActivity<ListeningActivity>(a1Week1Listening),
      'week-2': castActivity<ListeningActivity>(a1Week2Listening),
      'week-3': castActivity<ListeningActivity>(a1Week3Listening),
      'week-4': castActivity<ListeningActivity>(a1Week4Listening),
      'week-5': castActivity<ListeningActivity>(a1Week5Listening),
      'week-6': castActivity<ListeningActivity>(a1Week6Listening),
      'week-7': castActivity<ListeningActivity>(a1Week7Listening),
      'week-8': castActivity<ListeningActivity>(a1Week8Listening),
    },
    reading: {
      'week-1': castActivity<ReadingActivity>(a1Week1Reading),
      'week-2': castActivity<ReadingActivity>(a1Week2Reading),
      'week-3': castActivity<ReadingActivity>(a1Week3Reading),
      'week-4': castActivity<ReadingActivity>(a1Week4Reading),
      'week-5': castActivity<ReadingActivity>(a1Week5Reading),
      'week-6': castActivity<ReadingActivity>(a1Week6Reading),
      'week-7': castActivity<ReadingActivity>(a1Week7Reading),
      'week-8': castActivity<ReadingActivity>(a1Week8Reading),
    },
    speaking: {
      'week-1': castActivity<SpeakingActivity>(a1Week1Speaking),
      'week-2': castActivity<SpeakingActivity>(a1Week2Speaking),
      'week-3': castActivity<SpeakingActivity>(a1Week3Speaking),
      'week-4': castActivity<SpeakingActivity>(a1Week4Speaking),
      'week-5': castActivity<SpeakingActivity>(a1Week5Speaking),
      'week-6': castActivity<SpeakingActivity>(a1Week6Speaking),
      'week-7': castActivity<SpeakingActivity>(a1Week7Speaking),
      'week-8': castActivity<SpeakingActivity>(a1Week8Speaking),
    },
    writing: {
      'week-1': castActivity<WritingActivity>(a1Week1Writing),
      'week-2': castActivity<WritingActivity>(a1Week2Writing),
      'week-3': castActivity<WritingActivity>(a1Week3Writing),
      'week-4': castActivity<WritingActivity>(a1Week4Writing),
      'week-5': castActivity<WritingActivity>(a1Week5Writing),
      'week-6': castActivity<WritingActivity>(a1Week6Writing),
      'week-7': castActivity<WritingActivity>(a1Week7Writing),
      'week-8': castActivity<WritingActivity>(a1Week8Writing),
    },
  },
  A2: {
    vocabulary: {
      'week-1': castActivity<VocabularyActivity>(a2Week1Vocab),
      'week-2': castActivity<VocabularyActivity>(a2Week2Vocab),
      'week-3': castActivity<VocabularyActivity>(a2Week3Vocab),
      'week-4': castActivity<VocabularyActivity>(a2Week4Vocab),
      'week-5': castActivity<VocabularyActivity>(a2Week5Vocab),
      'week-6': castActivity<VocabularyActivity>(a2Week6Vocab),
      'week-7': castActivity<VocabularyActivity>(a2Week7Vocab),
      'week-8': castActivity<VocabularyActivity>(a2Week8Vocab),
    },
    grammar: {
      'week-1': castActivity<GrammarActivity>(a2Week1Grammar),
      'week-2': castActivity<GrammarActivity>(a2Week2Grammar),
      'week-3': castActivity<GrammarActivity>(a2Week3Grammar),
      'week-4': castActivity<GrammarActivity>(a2Week4Grammar),
      'week-5': castActivity<GrammarActivity>(a2Week5Grammar),
      'week-6': castActivity<GrammarActivity>(a2Week6Grammar),
      'week-7': castActivity<GrammarActivity>(a2Week7Grammar),
      'week-8': castActivity<GrammarActivity>(a2Week8Grammar),
    },
    listening: {
      'week-1': castActivity<ListeningActivity>(a2Week1Listening),
      'week-2': castActivity<ListeningActivity>(a2Week2Listening),
      'week-3': castActivity<ListeningActivity>(a2Week3Listening),
      'week-4': castActivity<ListeningActivity>(a2Week4Listening),
      'week-5': castActivity<ListeningActivity>(a2Week5Listening),
      'week-6': castActivity<ListeningActivity>(a2Week6Listening),
      'week-7': castActivity<ListeningActivity>(a2Week7Listening),
      'week-8': castActivity<ListeningActivity>(a2Week8Listening),
    },
    reading: {
      'week-1': castActivity<ReadingActivity>(a2Week1Reading),
      'week-2': castActivity<ReadingActivity>(a2Week2Reading),
      'week-3': castActivity<ReadingActivity>(a2Week3Reading),
      'week-4': castActivity<ReadingActivity>(a2Week4Reading),
      'week-5': castActivity<ReadingActivity>(a2Week5Reading),
      'week-6': castActivity<ReadingActivity>(a2Week6Reading),
      'week-7': castActivity<ReadingActivity>(a2Week7Reading),
      'week-8': castActivity<ReadingActivity>(a2Week8Reading),
    },
    speaking: {
      'week-1': castActivity<SpeakingActivity>(a2Week1Speaking),
      'week-2': castActivity<SpeakingActivity>(a2Week2Speaking),
      'week-3': castActivity<SpeakingActivity>(a2Week3Speaking),
      'week-4': castActivity<SpeakingActivity>(a2Week4Speaking),
      'week-5': castActivity<SpeakingActivity>(a2Week5Speaking),
      'week-6': castActivity<SpeakingActivity>(a2Week6Speaking),
      'week-7': castActivity<SpeakingActivity>(a2Week7Speaking),
      'week-8': castActivity<SpeakingActivity>(a2Week8Speaking),
    },
    writing: {
      'week-1': castActivity<WritingActivity>(a2Week1Writing),
      'week-2': castActivity<WritingActivity>(a2Week2Writing),
      'week-3': castActivity<WritingActivity>(a2Week3Writing),
      'week-4': castActivity<WritingActivity>(a2Week4Writing),
      'week-5': castActivity<WritingActivity>(a2Week5Writing),
      'week-6': castActivity<WritingActivity>(a2Week6Writing),
      'week-7': castActivity<WritingActivity>(a2Week7Writing),
      'week-8': castActivity<WritingActivity>(a2Week8Writing),
    },
  },
  B1: {
    vocabulary: {
      'week-1': castActivity<VocabularyActivity>(b1Week1Vocab),
      'week-2': castActivity<VocabularyActivity>(b1Week2Vocab),
      'week-3': castActivity<VocabularyActivity>(b1Week3Vocab),
      'week-4': castActivity<VocabularyActivity>(b1Week4Vocab),
      'week-5': castActivity<VocabularyActivity>(b1Week5Vocab),
      'week-6': castActivity<VocabularyActivity>(b1Week6Vocab),
      'week-7': castActivity<VocabularyActivity>(b1Week7Vocab),
      'week-8': castActivity<VocabularyActivity>(b1Week8Vocab),
    },
    grammar: {
      'week-1': castActivity<GrammarActivity>(b1Week1Grammar),
      'week-2': castActivity<GrammarActivity>(b1Week2Grammar),
      'week-3': castActivity<GrammarActivity>(b1Week3Grammar),
      'week-4': castActivity<GrammarActivity>(b1Week4Grammar),
      'week-5': castActivity<GrammarActivity>(b1Week5Grammar),
      'week-6': castActivity<GrammarActivity>(b1Week6Grammar),
      'week-7': castActivity<GrammarActivity>(b1Week7Grammar),
      'week-8': castActivity<GrammarActivity>(b1Week8Grammar),
    },
    listening: {
      'week-1': castActivity<ListeningActivity>(b1Week1Listening),
      'week-2': castActivity<ListeningActivity>(b1Week2Listening),
      'week-3': castActivity<ListeningActivity>(b1Week3Listening),
      'week-4': castActivity<ListeningActivity>(b1Week4Listening),
      'week-5': castActivity<ListeningActivity>(b1Week5Listening),
      'week-6': castActivity<ListeningActivity>(b1Week6Listening),
      'week-7': castActivity<ListeningActivity>(b1Week7Listening),
      'week-8': castActivity<ListeningActivity>(b1Week8Listening),
    },
    reading: {
      'week-1': castActivity<ReadingActivity>(b1Week1Reading),
      'week-2': castActivity<ReadingActivity>(b1Week2Reading),
      'week-3': castActivity<ReadingActivity>(b1Week3Reading),
      'week-4': castActivity<ReadingActivity>(b1Week4Reading),
      'week-5': castActivity<ReadingActivity>(b1Week5Reading),
      'week-6': castActivity<ReadingActivity>(b1Week6Reading),
      'week-7': castActivity<ReadingActivity>(b1Week7Reading),
      'week-8': castActivity<ReadingActivity>(b1Week8Reading),
    },
    speaking: {
      'week-1': castActivity<SpeakingActivity>(b1Week1Speaking),
      'week-2': castActivity<SpeakingActivity>(b1Week2Speaking),
      'week-3': castActivity<SpeakingActivity>(b1Week3Speaking),
      'week-4': castActivity<SpeakingActivity>(b1Week4Speaking),
      'week-5': castActivity<SpeakingActivity>(b1Week5Speaking),
      'week-6': castActivity<SpeakingActivity>(b1Week6Speaking),
      'week-7': castActivity<SpeakingActivity>(b1Week7Speaking),
      'week-8': castActivity<SpeakingActivity>(b1Week8Speaking),
    },
    writing: {
      'week-1': castActivity<WritingActivity>(b1Week1Writing),
      'week-2': castActivity<WritingActivity>(b1Week2Writing),
      'week-3': castActivity<WritingActivity>(b1Week3Writing),
      'week-4': castActivity<WritingActivity>(b1Week4Writing),
      'week-5': castActivity<WritingActivity>(b1Week5Writing),
      'week-6': castActivity<WritingActivity>(b1Week6Writing),
      'week-7': castActivity<WritingActivity>(b1Week7Writing),
      'week-8': castActivity<WritingActivity>(b1Week8Writing),
    },
  },
  B2: {
    vocabulary: {
      'week-1': castActivity<VocabularyActivity>(b2Week1Vocab),
      'week-2': castActivity<VocabularyActivity>(b2Week2Vocab),
      'week-3': castActivity<VocabularyActivity>(b2Week3Vocab),
      'week-4': castActivity<VocabularyActivity>(b2Week4Vocab),
      'week-5': castActivity<VocabularyActivity>(b2Week5Vocab),
      'week-6': castActivity<VocabularyActivity>(b2Week6Vocab),
      'week-7': castActivity<VocabularyActivity>(b2Week7Vocab),
      'week-8': castActivity<VocabularyActivity>(b2Week8Vocab),
    },
    grammar: {
      'week-1': castActivity<GrammarActivity>(b2Week1Grammar),
      'week-2': castActivity<GrammarActivity>(b2Week2Grammar),
      'week-3': castActivity<GrammarActivity>(b2Week3Grammar),
      'week-4': castActivity<GrammarActivity>(b2Week4Grammar),
      'week-5': castActivity<GrammarActivity>(b2Week5Grammar),
      'week-6': castActivity<GrammarActivity>(b2Week6Grammar),
      'week-7': castActivity<GrammarActivity>(b2Week7Grammar),
      'week-8': castActivity<GrammarActivity>(b2Week8Grammar),
    },
    listening: {
      'week-1': castActivity<ListeningActivity>(b2Week1Listening),
      'week-2': castActivity<ListeningActivity>(b2Week2Listening),
      'week-3': castActivity<ListeningActivity>(b2Week3Listening),
      'week-4': castActivity<ListeningActivity>(b2Week4Listening),
      'week-5': castActivity<ListeningActivity>(b2Week5Listening),
      'week-6': castActivity<ListeningActivity>(b2Week6Listening),
      'week-7': castActivity<ListeningActivity>(b2Week7Listening),
      'week-8': castActivity<ListeningActivity>(b2Week8Listening),
    },
    reading: {
      'week-1': castActivity<ReadingActivity>(b2Week1Reading),
      'week-2': castActivity<ReadingActivity>(b2Week2Reading),
      'week-3': castActivity<ReadingActivity>(b2Week3Reading),
      'week-4': castActivity<ReadingActivity>(b2Week4Reading),
      'week-5': castActivity<ReadingActivity>(b2Week5Reading),
      'week-6': castActivity<ReadingActivity>(b2Week6Reading),
      'week-7': castActivity<ReadingActivity>(b2Week7Reading),
      'week-8': castActivity<ReadingActivity>(b2Week8Reading),
    },
    speaking: {
      'week-1': castActivity<SpeakingActivity>(b2Week1Speaking),
      'week-2': castActivity<SpeakingActivity>(b2Week2Speaking),
      'week-3': castActivity<SpeakingActivity>(b2Week3Speaking),
      'week-4': castActivity<SpeakingActivity>(b2Week4Speaking),
      'week-5': castActivity<SpeakingActivity>(b2Week5Speaking),
      'week-6': castActivity<SpeakingActivity>(b2Week6Speaking),
      'week-7': castActivity<SpeakingActivity>(b2Week7Speaking),
      'week-8': castActivity<SpeakingActivity>(b2Week8Speaking),
    },
    writing: {
      'week-1': castActivity<WritingActivity>(b2Week1Writing),
      'week-2': castActivity<WritingActivity>(b2Week2Writing),
      'week-3': castActivity<WritingActivity>(b2Week3Writing),
      'week-4': castActivity<WritingActivity>(b2Week4Writing),
      'week-5': castActivity<WritingActivity>(b2Week5Writing),
      'week-6': castActivity<WritingActivity>(b2Week6Writing),
      'week-7': castActivity<WritingActivity>(b2Week7Writing),
      'week-8': castActivity<WritingActivity>(b2Week8Writing),
    },
  },
  // C1/C2: 향후 콘텐츠 추가 예정
  C1: {
    vocabulary: {},
    grammar: {},
    listening: {},
    reading: {},
    speaking: {},
    writing: {},
  },
  C2: {
    vocabulary: {},
    grammar: {},
    listening: {},
    reading: {},
    speaking: {},
    writing: {},
  },
};

// ─────────────────────────────────────
// 레거시 호환 함수 (no-op)
// ─────────────────────────────────────

export function isLevelLoaded(_level: CEFRLevel): boolean {
  return true; // 정적 import이므로 항상 로드됨
}

export async function preloadLevel(_level: CEFRLevel): Promise<void> {
  // 정적 import이므로 프리로드 불필요
  return Promise.resolve();
}

// ─────────────────────────────────────
// 활동 로더 함수
// ─────────────────────────────────────

/**
 * 특정 레벨과 주차의 활동 데이터 로드
 */
export function loadActivity(
  level: CEFRLevel,
  type: ActivityType,
  weekId: string
): Activity | null {
  const levelActivities = ACTIVITIES[level];
  if (!levelActivities) return null;

  const typeActivities = levelActivities[type];
  if (!typeActivities) return null;

  return typeActivities[weekId] || null;
}

/**
 * 특정 레벨과 주차의 어휘 활동 로드
 */
export function loadVocabulary(level: CEFRLevel, weekId: string): VocabularyActivity | null {
  return loadActivity(level, 'vocabulary', weekId) as VocabularyActivity | null;
}

/**
 * 특정 레벨과 주차의 문법 활동 로드
 */
export function loadGrammar(level: CEFRLevel, weekId: string): GrammarActivity | null {
  return loadActivity(level, 'grammar', weekId) as GrammarActivity | null;
}

/**
 * 특정 레벨과 주차의 듣기 활동 로드
 */
export function loadListening(level: CEFRLevel, weekId: string): ListeningActivity | null {
  return loadActivity(level, 'listening', weekId) as ListeningActivity | null;
}

/**
 * 특정 레벨과 주차의 읽기 활동 로드
 */
export function loadReading(level: CEFRLevel, weekId: string): ReadingActivity | null {
  return loadActivity(level, 'reading', weekId) as ReadingActivity | null;
}

/**
 * 특정 레벨과 주차의 말하기 활동 로드
 */
export function loadSpeaking(level: CEFRLevel, weekId: string): SpeakingActivity | null {
  return loadActivity(level, 'speaking', weekId) as SpeakingActivity | null;
}

/**
 * 특정 레벨과 주차의 쓰기 활동 로드
 */
export function loadWriting(level: CEFRLevel, weekId: string): WritingActivity | null {
  return loadActivity(level, 'writing', weekId) as WritingActivity | null;
}

/**
 * 특정 레벨과 주차의 모든 활동 로드
 */
export function loadWeekActivities(level: CEFRLevel, weekId: string): Activity[] {
  const activities: Activity[] = [];

  const types: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const type of types) {
    const activity = loadActivity(level, type, weekId);
    if (activity) {
      activities.push(activity);
    }
  }

  return activities;
}

/**
 * 특정 레벨의 모든 활동 로드
 */
export function loadLevelActivities(level: CEFRLevel): Activity[] {
  const activities: Activity[] = [];
  const weeks = ['week-1', 'week-2', 'week-3', 'week-4', 'week-5', 'week-6', 'week-7', 'week-8'];

  for (const weekId of weeks) {
    const weekActivities = loadWeekActivities(level, weekId);
    activities.push(...weekActivities);
  }

  return activities;
}

/**
 * 활동 ID로 활동 찾기
 */
export function findActivityById(activityId: string): Activity | null {
  const types: ActivityType[] = [
    'vocabulary',
    'grammar',
    'listening',
    'reading',
    'speaking',
    'writing',
  ];

  for (const level of CEFR_LEVELS) {
    for (const type of types) {
      const weekActivities = ACTIVITIES[level]?.[type];
      if (!weekActivities) continue;
      for (const weekId of Object.keys(weekActivities)) {
        const activity = weekActivities[weekId];
        if (activity && activity.id === activityId) {
          return activity;
        }
      }
    }
  }

  return null;
}

/**
 * 활동 타입별 아이콘 반환 (MaterialCommunityIcons 이름)
 */
export function getActivityIcon(type: ActivityType): string {
  const icons: Record<ActivityType, string> = {
    vocabulary: 'book-open-variant',
    grammar: 'book-alphabet',
    listening: 'headphones',
    reading: 'file-document-outline',
    speaking: 'microphone',
    writing: 'pencil',
  };

  return icons[type] || 'book';
}

/**
 * 활동 타입별 한글명 반환
 */
export function getActivityLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    vocabulary: '단어',
    grammar: '문법',
    listening: '듣기',
    reading: '읽기',
    speaking: '말하기',
    writing: '쓰기',
  };

  return labels[type] || type;
}

/**
 * 레벨별 한글명 반환
 */
export function getLevelLabel(level: CEFRLevel): string {
  const labels: Record<CEFRLevel, string> = {
    A1: '입문',
    A2: '초급',
    B1: '중급',
    B2: '중상급',
    C1: '고급',
    C2: '최상급',
  };

  return labels[level] || level;
}

/**
 * 총 활동 수 반환
 */
export function getTotalActivitiesCount(): number {
  return CEFR_LEVELS.length * 8 * 6; // 4 levels * 8 weeks * 6 activities = 192
}

/**
 * 특정 레벨의 활동 수 반환
 */
export function getLevelActivitiesCount(_level: CEFRLevel): number {
  return 8 * 6; // 8 weeks * 6 activities = 48
}

import {
  Activity,
  ActivityType,
  GrammarActivity,
  ListeningActivity,
  ReadingActivity,
  SpeakingActivity,
  VocabularyActivity,
  WritingActivity,
} from '@/types/activity';

// ─────────────────────────────────────
// CEFR 레벨 타입 정의
// ─────────────────────────────────────

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2';

export const CEFR_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2'];

export const CEFR_LEVEL_INFO: Record<CEFRLevel, { name: string; description: string }> = {
  A1: { name: 'Beginner', description: 'Basic phrases and expressions' },
  A2: { name: 'Elementary', description: 'Everyday expressions and simple sentences' },
  B1: { name: 'Intermediate', description: 'Main points and simple connected text' },
  B2: { name: 'Upper Intermediate', description: 'Complex text and abstract topics' },
};

// ─────────────────────────────────────
// A1 레벨 데이터 임포트
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

// ─────────────────────────────────────
// A2 레벨 데이터 임포트
// ─────────────────────────────────────

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

// ─────────────────────────────────────
// B1 레벨 데이터 임포트
// ─────────────────────────────────────

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

// ─────────────────────────────────────
// B2 레벨 데이터 임포트
// ─────────────────────────────────────

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
// 데이터 맵
// ─────────────────────────────────────

type ActivityData = Record<ActivityType, Record<string, Activity>>;
type LevelActivityData = Record<CEFRLevel, ActivityData>;

const ACTIVITIES: LevelActivityData = {
  A1: {
    vocabulary: {
      'week-1': a1Week1Vocab as VocabularyActivity,
      'week-2': a1Week2Vocab as VocabularyActivity,
      'week-3': a1Week3Vocab as VocabularyActivity,
      'week-4': a1Week4Vocab as VocabularyActivity,
      'week-5': a1Week5Vocab as VocabularyActivity,
      'week-6': a1Week6Vocab as VocabularyActivity,
      'week-7': a1Week7Vocab as VocabularyActivity,
      'week-8': a1Week8Vocab as VocabularyActivity,
    },
    grammar: {
      'week-1': a1Week1Grammar as GrammarActivity,
      'week-2': a1Week2Grammar as GrammarActivity,
      'week-3': a1Week3Grammar as GrammarActivity,
      'week-4': a1Week4Grammar as GrammarActivity,
      'week-5': a1Week5Grammar as GrammarActivity,
      'week-6': a1Week6Grammar as GrammarActivity,
      'week-7': a1Week7Grammar as GrammarActivity,
      'week-8': a1Week8Grammar as GrammarActivity,
    },
    listening: {
      'week-1': a1Week1Listening as ListeningActivity,
      'week-2': a1Week2Listening as ListeningActivity,
      'week-3': a1Week3Listening as ListeningActivity,
      'week-4': a1Week4Listening as ListeningActivity,
      'week-5': a1Week5Listening as ListeningActivity,
      'week-6': a1Week6Listening as ListeningActivity,
      'week-7': a1Week7Listening as ListeningActivity,
      'week-8': a1Week8Listening as ListeningActivity,
    },
    reading: {
      'week-1': a1Week1Reading as ReadingActivity,
      'week-2': a1Week2Reading as ReadingActivity,
      'week-3': a1Week3Reading as ReadingActivity,
      'week-4': a1Week4Reading as ReadingActivity,
      'week-5': a1Week5Reading as ReadingActivity,
      'week-6': a1Week6Reading as ReadingActivity,
      'week-7': a1Week7Reading as ReadingActivity,
      'week-8': a1Week8Reading as ReadingActivity,
    },
    speaking: {
      'week-1': a1Week1Speaking as SpeakingActivity,
      'week-2': a1Week2Speaking as SpeakingActivity,
      'week-3': a1Week3Speaking as SpeakingActivity,
      'week-4': a1Week4Speaking as SpeakingActivity,
      'week-5': a1Week5Speaking as SpeakingActivity,
      'week-6': a1Week6Speaking as SpeakingActivity,
      'week-7': a1Week7Speaking as SpeakingActivity,
      'week-8': a1Week8Speaking as SpeakingActivity,
    },
    writing: {
      'week-1': a1Week1Writing as WritingActivity,
      'week-2': a1Week2Writing as WritingActivity,
      'week-3': a1Week3Writing as WritingActivity,
      'week-4': a1Week4Writing as WritingActivity,
      'week-5': a1Week5Writing as WritingActivity,
      'week-6': a1Week6Writing as WritingActivity,
      'week-7': a1Week7Writing as WritingActivity,
      'week-8': a1Week8Writing as WritingActivity,
    },
  },
  A2: {
    vocabulary: {
      'week-1': a2Week1Vocab as VocabularyActivity,
      'week-2': a2Week2Vocab as VocabularyActivity,
      'week-3': a2Week3Vocab as VocabularyActivity,
      'week-4': a2Week4Vocab as VocabularyActivity,
      'week-5': a2Week5Vocab as VocabularyActivity,
      'week-6': a2Week6Vocab as VocabularyActivity,
      'week-7': a2Week7Vocab as VocabularyActivity,
      'week-8': a2Week8Vocab as VocabularyActivity,
    },
    grammar: {
      'week-1': a2Week1Grammar as GrammarActivity,
      'week-2': a2Week2Grammar as GrammarActivity,
      'week-3': a2Week3Grammar as GrammarActivity,
      'week-4': a2Week4Grammar as GrammarActivity,
      'week-5': a2Week5Grammar as GrammarActivity,
      'week-6': a2Week6Grammar as GrammarActivity,
      'week-7': a2Week7Grammar as GrammarActivity,
      'week-8': a2Week8Grammar as GrammarActivity,
    },
    listening: {
      'week-1': a2Week1Listening as ListeningActivity,
      'week-2': a2Week2Listening as ListeningActivity,
      'week-3': a2Week3Listening as ListeningActivity,
      'week-4': a2Week4Listening as ListeningActivity,
      'week-5': a2Week5Listening as ListeningActivity,
      'week-6': a2Week6Listening as ListeningActivity,
      'week-7': a2Week7Listening as ListeningActivity,
      'week-8': a2Week8Listening as ListeningActivity,
    },
    reading: {
      'week-1': a2Week1Reading as ReadingActivity,
      'week-2': a2Week2Reading as ReadingActivity,
      'week-3': a2Week3Reading as ReadingActivity,
      'week-4': a2Week4Reading as ReadingActivity,
      'week-5': a2Week5Reading as ReadingActivity,
      'week-6': a2Week6Reading as ReadingActivity,
      'week-7': a2Week7Reading as ReadingActivity,
      'week-8': a2Week8Reading as ReadingActivity,
    },
    speaking: {
      'week-1': a2Week1Speaking as SpeakingActivity,
      'week-2': a2Week2Speaking as SpeakingActivity,
      'week-3': a2Week3Speaking as SpeakingActivity,
      'week-4': a2Week4Speaking as SpeakingActivity,
      'week-5': a2Week5Speaking as SpeakingActivity,
      'week-6': a2Week6Speaking as SpeakingActivity,
      'week-7': a2Week7Speaking as SpeakingActivity,
      'week-8': a2Week8Speaking as SpeakingActivity,
    },
    writing: {
      'week-1': a2Week1Writing as WritingActivity,
      'week-2': a2Week2Writing as WritingActivity,
      'week-3': a2Week3Writing as WritingActivity,
      'week-4': a2Week4Writing as WritingActivity,
      'week-5': a2Week5Writing as WritingActivity,
      'week-6': a2Week6Writing as WritingActivity,
      'week-7': a2Week7Writing as WritingActivity,
      'week-8': a2Week8Writing as WritingActivity,
    },
  },
  B1: {
    vocabulary: {
      'week-1': b1Week1Vocab as VocabularyActivity,
      'week-2': b1Week2Vocab as VocabularyActivity,
      'week-3': b1Week3Vocab as VocabularyActivity,
      'week-4': b1Week4Vocab as VocabularyActivity,
      'week-5': b1Week5Vocab as VocabularyActivity,
      'week-6': b1Week6Vocab as VocabularyActivity,
      'week-7': b1Week7Vocab as VocabularyActivity,
      'week-8': b1Week8Vocab as VocabularyActivity,
    },
    grammar: {
      'week-1': b1Week1Grammar as GrammarActivity,
      'week-2': b1Week2Grammar as GrammarActivity,
      'week-3': b1Week3Grammar as GrammarActivity,
      'week-4': b1Week4Grammar as GrammarActivity,
      'week-5': b1Week5Grammar as GrammarActivity,
      'week-6': b1Week6Grammar as GrammarActivity,
      'week-7': b1Week7Grammar as GrammarActivity,
      'week-8': b1Week8Grammar as GrammarActivity,
    },
    listening: {
      'week-1': b1Week1Listening as ListeningActivity,
      'week-2': b1Week2Listening as ListeningActivity,
      'week-3': b1Week3Listening as ListeningActivity,
      'week-4': b1Week4Listening as ListeningActivity,
      'week-5': b1Week5Listening as ListeningActivity,
      'week-6': b1Week6Listening as ListeningActivity,
      'week-7': b1Week7Listening as ListeningActivity,
      'week-8': b1Week8Listening as ListeningActivity,
    },
    reading: {
      'week-1': b1Week1Reading as ReadingActivity,
      'week-2': b1Week2Reading as ReadingActivity,
      'week-3': b1Week3Reading as ReadingActivity,
      'week-4': b1Week4Reading as ReadingActivity,
      'week-5': b1Week5Reading as ReadingActivity,
      'week-6': b1Week6Reading as ReadingActivity,
      'week-7': b1Week7Reading as ReadingActivity,
      'week-8': b1Week8Reading as ReadingActivity,
    },
    speaking: {
      'week-1': b1Week1Speaking as SpeakingActivity,
      'week-2': b1Week2Speaking as SpeakingActivity,
      'week-3': b1Week3Speaking as SpeakingActivity,
      'week-4': b1Week4Speaking as SpeakingActivity,
      'week-5': b1Week5Speaking as SpeakingActivity,
      'week-6': b1Week6Speaking as SpeakingActivity,
      'week-7': b1Week7Speaking as SpeakingActivity,
      'week-8': b1Week8Speaking as SpeakingActivity,
    },
    writing: {
      'week-1': b1Week1Writing as WritingActivity,
      'week-2': b1Week2Writing as WritingActivity,
      'week-3': b1Week3Writing as WritingActivity,
      'week-4': b1Week4Writing as WritingActivity,
      'week-5': b1Week5Writing as WritingActivity,
      'week-6': b1Week6Writing as WritingActivity,
      'week-7': b1Week7Writing as WritingActivity,
      'week-8': b1Week8Writing as WritingActivity,
    },
  },
  B2: {
    vocabulary: {
      'week-1': b2Week1Vocab as VocabularyActivity,
      'week-2': b2Week2Vocab as VocabularyActivity,
      'week-3': b2Week3Vocab as VocabularyActivity,
      'week-4': b2Week4Vocab as VocabularyActivity,
      'week-5': b2Week5Vocab as VocabularyActivity,
      'week-6': b2Week6Vocab as VocabularyActivity,
      'week-7': b2Week7Vocab as VocabularyActivity,
      'week-8': b2Week8Vocab as VocabularyActivity,
    },
    grammar: {
      'week-1': b2Week1Grammar as GrammarActivity,
      'week-2': b2Week2Grammar as GrammarActivity,
      'week-3': b2Week3Grammar as GrammarActivity,
      'week-4': b2Week4Grammar as GrammarActivity,
      'week-5': b2Week5Grammar as GrammarActivity,
      'week-6': b2Week6Grammar as GrammarActivity,
      'week-7': b2Week7Grammar as GrammarActivity,
      'week-8': b2Week8Grammar as GrammarActivity,
    },
    listening: {
      'week-1': b2Week1Listening as ListeningActivity,
      'week-2': b2Week2Listening as ListeningActivity,
      'week-3': b2Week3Listening as ListeningActivity,
      'week-4': b2Week4Listening as ListeningActivity,
      'week-5': b2Week5Listening as ListeningActivity,
      'week-6': b2Week6Listening as ListeningActivity,
      'week-7': b2Week7Listening as ListeningActivity,
      'week-8': b2Week8Listening as ListeningActivity,
    },
    reading: {
      'week-1': b2Week1Reading as ReadingActivity,
      'week-2': b2Week2Reading as ReadingActivity,
      'week-3': b2Week3Reading as ReadingActivity,
      'week-4': b2Week4Reading as ReadingActivity,
      'week-5': b2Week5Reading as ReadingActivity,
      'week-6': b2Week6Reading as ReadingActivity,
      'week-7': b2Week7Reading as ReadingActivity,
      'week-8': b2Week8Reading as ReadingActivity,
    },
    speaking: {
      'week-1': b2Week1Speaking as SpeakingActivity,
      'week-2': b2Week2Speaking as SpeakingActivity,
      'week-3': b2Week3Speaking as SpeakingActivity,
      'week-4': b2Week4Speaking as SpeakingActivity,
      'week-5': b2Week5Speaking as SpeakingActivity,
      'week-6': b2Week6Speaking as SpeakingActivity,
      'week-7': b2Week7Speaking as SpeakingActivity,
      'week-8': b2Week8Speaking as SpeakingActivity,
    },
    writing: {
      'week-1': b2Week1Writing as WritingActivity,
      'week-2': b2Week2Writing as WritingActivity,
      'week-3': b2Week3Writing as WritingActivity,
      'week-4': b2Week4Writing as WritingActivity,
      'week-5': b2Week5Writing as WritingActivity,
      'week-6': b2Week6Writing as WritingActivity,
      'week-7': b2Week7Writing as WritingActivity,
      'week-8': b2Week8Writing as WritingActivity,
    },
  },
};

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
export function loadVocabulary(
  level: CEFRLevel,
  weekId: string
): VocabularyActivity | null {
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
export function loadListening(
  level: CEFRLevel,
  weekId: string
): ListeningActivity | null {
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
      const weekActivities = ACTIVITIES[level][type];
      for (const weekId of Object.keys(weekActivities)) {
        const activity = weekActivities[weekId];
        if (activity.id === activityId) {
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
export function getLevelActivitiesCount(level: CEFRLevel): number {
  return 8 * 6; // 8 weeks * 6 activities = 48
}

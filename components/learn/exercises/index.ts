/**
 * Exercise Components Index
 * Export all exercise types
 */

// TrueFalse - True/False statement verification
export { TrueFalse, type TrueFalseQuestion, type TrueFalseResult } from './TrueFalse';

// ShortAnswer - Text input answer exercise
export { ShortAnswer, type ShortAnswerQuestion, type ShortAnswerResult } from './ShortAnswer';

// Dictation - Listen and type exercise
export {
  Dictation,
  type DictationQuestion,
  type DictationResult,
  type WordDetail,
} from './Dictation';

// MinimalPairs - Minimal pair pronunciation discrimination
export {
  MinimalPairs,
  type MinimalPair,
  type MinimalPairQuestion,
  type MinimalPairsResult,
} from './MinimalPairs';

// Shadowing - Native speaker shadowing practice
export { Shadowing, type ShadowingSentence, type ShadowingResult } from './Shadowing';

/**
 * SRS (Spaced Repetition System) Types
 * SM-2 Algorithm based type definitions
 */

// SRS data for each word/item
export interface SrsData {
  wordId: string;

  // SM-2 Algorithm fields
  repetition: number; // Number of successful reviews (n)
  easeFactor: number; // Ease factor (EF), typically 2.5 at start
  interval: number; // Days until next review

  // Next review date
  nextReviewDate: string; // ISO timestamp

  // Metadata
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

// User review rating
export type ReviewRating = 'again' | 'hard' | 'good' | 'easy';

// SRS review session
export interface SrsReviewSession {
  id: string;
  date: string; // YYYY-MM-DD
  wordsReviewed: number;
  wordsCorrect: number;
  averageRating: number; // 0-5 scale
  duration: number; // minutes
}

// Word with SRS data combined
export interface WordWithSrs {
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  srsData: SrsData;
}

// Review queue item
export interface ReviewQueueItem {
  wordId: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  dueDate: string;
  overdueDays: number;
}

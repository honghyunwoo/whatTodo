/**
 * SRS (Spaced Repetition System) Algorithm
 * Simplified SM-2 Algorithm Implementation
 */

import { ReviewRating, SrsData } from '@/types/srs';

const MIN_EASE_FACTOR = 1.3;

/**
 * Calculate next SRS data based on user's review rating.
 * Simplified version of SM-2 algorithm.
 *
 * @param oldSrsData - Previous SRS data for the word. null for first review.
 * @param rating - User's review rating ('again', 'hard', 'good', 'easy').
 * @returns Updated SRS data object.
 */
export function calculateSrsData(
  oldSrsData: Partial<SrsData> | null,
  rating: ReviewRating
): Omit<SrsData, 'wordId' | 'createdAt'> {
  const now = new Date();

  // First learning - set initial values
  if (!oldSrsData) {
    return {
      repetition: 0,
      easeFactor: 2.5,
      interval: 0,
      nextReviewDate: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  let { repetition = 0, easeFactor = 2.5, interval = 0 } = oldSrsData;

  if (rating === 'again') {
    // Reset - start from beginning
    repetition = 0;
    interval = 1; // Review next day
  } else {
    // 'hard', 'good', 'easy'
    repetition += 1;

    // 1. Calculate interval
    if (repetition === 1) {
      interval = 1; // First success: 1 day
    } else if (repetition === 2) {
      interval = 6; // Second success: 6 days
    } else {
      interval = Math.ceil(interval * easeFactor);
    }

    // 2. Update ease factor (q is rating score)
    const q = rating === 'hard' ? 2 : rating === 'good' ? 4 : 5;
    easeFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

    if (easeFactor < MIN_EASE_FACTOR) {
      easeFactor = MIN_EASE_FACTOR;
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    repetition,
    easeFactor,
    interval,
    nextReviewDate: nextReviewDate.toISOString(),
    updatedAt: now.toISOString(),
  };
}

/**
 * Check if a word is due for review
 */
export function isDueForReview(srsData: SrsData): boolean {
  const now = new Date();
  const nextReview = new Date(srsData.nextReviewDate);
  return now >= nextReview;
}

/**
 * Get overdue days for a word
 */
export function getOverdueDays(srsData: SrsData): number {
  const now = new Date();
  const nextReview = new Date(srsData.nextReviewDate);
  const diffTime = now.getTime() - nextReview.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Get rating score (for statistics)
 */
export function getRatingScore(rating: ReviewRating): number {
  switch (rating) {
    case 'again':
      return 0;
    case 'hard':
      return 2;
    case 'good':
      return 4;
    case 'easy':
      return 5;
    default:
      return 0;
  }
}

/**
 * Create initial SRS data for a new word
 */
export function createInitialSrsData(wordId: string): SrsData {
  const now = new Date().toISOString();
  return {
    wordId,
    repetition: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReviewDate: now,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Sort words by review priority (most urgent first)
 */
export function sortByReviewPriority<T extends { srsData: SrsData }>(words: T[]): T[] {
  return [...words].sort((a, b) => {
    const aOverdue = getOverdueDays(a.srsData);
    const bOverdue = getOverdueDays(b.srsData);

    // More overdue = higher priority
    if (aOverdue !== bOverdue) {
      return bOverdue - aOverdue;
    }

    // Lower ease factor = needs more practice
    return a.srsData.easeFactor - b.srsData.easeFactor;
  });
}

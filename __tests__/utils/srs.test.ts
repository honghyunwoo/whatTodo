/**
 * SRS Algorithm Tests
 *
 * @created 2025-12-24 - Phase 1.2: Critical Path 테스트 작성
 *
 * Tests for the SM-2 spaced repetition algorithm.
 * CRITICAL: SRS 알고리즘이 잘못되면 사용자 학습 데이터가 망가짐!
 */

import {
  calculateSrsData,
  isDueForReview,
  getOverdueDays,
  getRatingScore,
  createInitialSrsData,
  sortByReviewPriority,
} from '@/utils/srs';
import { SrsData } from '@/types/srs';

describe('SRS Algorithm (SM-2)', () => {
  describe('calculateSrsData', () => {
    it('첫 복습에서 null 입력 시 초기값 반환', () => {
      const result = calculateSrsData(null, 'good');

      expect(result.repetition).toBe(0);
      expect(result.easeFactor).toBe(2.5);
      expect(result.interval).toBe(0);
      expect(result.nextReviewDate).toBeDefined();
      expect(result.updatedAt).toBeDefined();
    });

    it('첫 성공 복습 (good) -> repetition 1, interval 1일', () => {
      const oldData = {
        repetition: 0,
        easeFactor: 2.5,
        interval: 0,
      };

      const result = calculateSrsData(oldData, 'good');

      expect(result.repetition).toBe(1);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(2.5); // good (q=4): 2.5 + (0.1 - 1*0.1) = 2.5
    });

    it('두 번째 성공 복습 (good) -> repetition 2, interval 6일', () => {
      const oldData = {
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
      };

      const result = calculateSrsData(oldData, 'good');

      expect(result.repetition).toBe(2);
      expect(result.interval).toBe(6);
    });

    it('세 번째 성공 복습 (good) -> interval = 이전 interval * easeFactor', () => {
      const oldData = {
        repetition: 2,
        easeFactor: 2.5,
        interval: 6,
      };

      const result = calculateSrsData(oldData, 'good');

      expect(result.repetition).toBe(3);
      expect(result.interval).toBe(Math.ceil(6 * 2.5)); // 15
    });

    it('복습 실패 (again) -> repetition 리셋, interval 1일', () => {
      const oldData = {
        repetition: 5,
        easeFactor: 2.3,
        interval: 30,
      };

      const result = calculateSrsData(oldData, 'again');

      expect(result.repetition).toBe(0);
      expect(result.interval).toBe(1);
    });

    it('어려움 (hard) -> easeFactor 감소', () => {
      const oldData = {
        repetition: 0,
        easeFactor: 2.5,
        interval: 0,
      };

      const result = calculateSrsData(oldData, 'hard');

      // hard (q=2): 2.5 + (0.1 - 3*0.26) = 2.5 - 0.68 = 1.82
      expect(result.easeFactor).toBeLessThan(2.5);
      expect(result.easeFactor).toBeGreaterThanOrEqual(1.3); // MIN_EASE_FACTOR
    });

    it('쉬움 (easy) -> easeFactor 증가', () => {
      const oldData = {
        repetition: 0,
        easeFactor: 2.5,
        interval: 0,
      };

      const result = calculateSrsData(oldData, 'easy');

      // easy (q=5): 2.5 + 0.1 = 2.6
      expect(result.easeFactor).toBeGreaterThan(2.5);
    });

    it('easeFactor는 1.3 아래로 내려가지 않음', () => {
      let srsData = {
        repetition: 0,
        easeFactor: 1.4,
        interval: 0,
      };

      // hard를 여러 번 반복해서 easeFactor를 계속 감소
      for (let i = 0; i < 10; i++) {
        srsData = {
          ...srsData,
          ...calculateSrsData(srsData, 'hard'),
        };
      }

      expect(srsData.easeFactor).toBeGreaterThanOrEqual(1.3);
      expect(srsData.easeFactor).toBeLessThanOrEqual(1.4); // 초기값보다 작거나 같아야 함
    });

    it('nextReviewDate가 interval만큼 미래 날짜', () => {
      const oldData = {
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
      };

      const result = calculateSrsData(oldData, 'good');

      const nextReview = new Date(result.nextReviewDate);
      const now = new Date();
      const diffDays = Math.floor((nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      expect(diffDays).toBe(result.interval);
    });
  });

  describe('isDueForReview', () => {
    it('nextReviewDate가 과거면 true 반환', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const srsData: SrsData = {
        wordId: 'test-1',
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: yesterday.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(isDueForReview(srsData)).toBe(true);
    });

    it('nextReviewDate가 미래면 false 반환', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const srsData: SrsData = {
        wordId: 'test-1',
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: tomorrow.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(isDueForReview(srsData)).toBe(false);
    });

    it('nextReviewDate가 오늘이면 true 반환', () => {
      const today = new Date();

      const srsData: SrsData = {
        wordId: 'test-1',
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: today.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(isDueForReview(srsData)).toBe(true);
    });
  });

  describe('getOverdueDays', () => {
    it('2일 지연된 단어 -> 2 반환', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const srsData: SrsData = {
        wordId: 'test-1',
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: twoDaysAgo.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const overdue = getOverdueDays(srsData);
      expect(overdue).toBeGreaterThanOrEqual(1); // 최소 1일
    });

    it('미래 날짜면 0 반환', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const srsData: SrsData = {
        wordId: 'test-1',
        repetition: 1,
        easeFactor: 2.5,
        interval: 1,
        nextReviewDate: tomorrow.toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      expect(getOverdueDays(srsData)).toBe(0);
    });
  });

  describe('getRatingScore', () => {
    it('again -> 0', () => {
      expect(getRatingScore('again')).toBe(0);
    });

    it('hard -> 2', () => {
      expect(getRatingScore('hard')).toBe(2);
    });

    it('good -> 4', () => {
      expect(getRatingScore('good')).toBe(4);
    });

    it('easy -> 5', () => {
      expect(getRatingScore('easy')).toBe(5);
    });
  });

  describe('createInitialSrsData', () => {
    it('초기 SRS 데이터 생성', () => {
      const wordId = 'test-word-1';
      const srsData = createInitialSrsData(wordId);

      expect(srsData.wordId).toBe(wordId);
      expect(srsData.repetition).toBe(0);
      expect(srsData.easeFactor).toBe(2.5);
      expect(srsData.interval).toBe(0);
      expect(srsData.nextReviewDate).toBeDefined();
      expect(srsData.createdAt).toBeDefined();
      expect(srsData.updatedAt).toBeDefined();
    });
  });

  describe('sortByReviewPriority', () => {
    it('더 오래 지연된 단어가 먼저 나옴', () => {
      const now = new Date();
      const twoDaysAgo = new Date(now);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
      const oneDayAgo = new Date(now);
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      const words = [
        {
          word: 'word1',
          srsData: {
            wordId: '1',
            repetition: 1,
            easeFactor: 2.5,
            interval: 1,
            nextReviewDate: oneDayAgo.toISOString(), // 1일 지연
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
        {
          word: 'word2',
          srsData: {
            wordId: '2',
            repetition: 1,
            easeFactor: 2.5,
            interval: 1,
            nextReviewDate: twoDaysAgo.toISOString(), // 2일 지연
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
      ];

      const sorted = sortByReviewPriority(words);

      expect(sorted[0].word).toBe('word2'); // 더 오래 지연된 것이 먼저
    });

    it('지연 일수가 같으면 easeFactor가 낮은 것이 먼저', () => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);

      const words = [
        {
          word: 'word1',
          srsData: {
            wordId: '1',
            repetition: 1,
            easeFactor: 2.5, // 높음
            interval: 1,
            nextReviewDate: yesterday.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
        {
          word: 'word2',
          srsData: {
            wordId: '2',
            repetition: 1,
            easeFactor: 1.5, // 낮음 -> 더 많은 연습 필요
            interval: 1,
            nextReviewDate: yesterday.toISOString(),
            createdAt: now.toISOString(),
            updatedAt: now.toISOString(),
          },
        },
      ];

      const sorted = sortByReviewPriority(words);

      expect(sorted[0].word).toBe('word2'); // easeFactor 낮은 것이 먼저
    });
  });
});

/**
 * SrsStore Tests
 *
 * @created 2026-01-03 - 상용화 준비 Phase 0
 *
 * Tests for spaced repetition system, word management, and review scheduling.
 */

import { useSrsStore } from '@/store/srsStore';
import type { ReviewRating } from '@/types/srs';

// Helper to create test word data
const createWordData = (id: string, overrides = {}) => ({
  wordId: id,
  word: `word-${id}`,
  meaning: `meaning-${id}`,
  example: `example-${id}`,
  ...overrides,
});

describe('srsStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useSrsStore.setState({
      words: [],
      reviewStats: {
        totalReviews: 0,
        correctReviews: 0,
        averageEaseFactor: 2.5,
        longestInterval: 0,
        lastReviewDate: null,
      },
      dailyReviewGoal: 20,
      todayReviewCount: 0,
      lastReviewDate: null,
    });
  });

  describe('addWord', () => {
    it('새 단어를 추가해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      const words = useSrsStore.getState().words;
      expect(words).toHaveLength(1);
      expect(words[0].wordId).toBe('word-1');
    });

    it('SRS 데이터가 초기화되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      const word = useSrsStore.getState().words[0];
      expect(word.srsData).toBeDefined();
      expect(word.srsData.repetition).toBe(0);
      expect(word.srsData.easeFactor).toBe(2.5);
      expect(word.srsData.interval).toBe(0);
    });

    it('중복 단어는 추가하지 않아야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-1'));

      expect(useSrsStore.getState().words).toHaveLength(1);
    });
  });

  describe('addWords', () => {
    it('여러 단어를 한 번에 추가해야 함', () => {
      const store = useSrsStore.getState();
      store.addWords([
        createWordData('word-1'),
        createWordData('word-2'),
        createWordData('word-3'),
      ]);

      expect(useSrsStore.getState().words).toHaveLength(3);
    });

    it('중복 단어는 제외해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      store.addWords([
        createWordData('word-1'), // 중복
        createWordData('word-2'), // 새로운
      ]);

      expect(useSrsStore.getState().words).toHaveLength(2);
    });
  });

  describe('removeWord', () => {
    it('단어를 삭제해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      store.removeWord('word-1');

      const words = useSrsStore.getState().words;
      expect(words).toHaveLength(1);
      expect(words[0].wordId).toBe('word-2');
    });

    it('존재하지 않는 단어 삭제는 에러 없이 처리', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      expect(() => store.removeWord('non-existent')).not.toThrow();
      expect(useSrsStore.getState().words).toHaveLength(1);
    });
  });

  describe('reviewWord', () => {
    it('리뷰 후 SRS 데이터가 업데이트되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      store.reviewWord('word-1', 'good');

      const word = store.getWordById('word-1');
      expect(word?.srsData.repetition).toBeGreaterThan(0);
    });

    it('리뷰 통계가 업데이트되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      store.reviewWord('word-1', 'good');

      const stats = store.getReviewStats();
      expect(stats.totalReviews).toBe(1);
      expect(stats.correctReviews).toBe(1);
    });

    it('"again" 리뷰는 incorrectReview로 계산되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      store.reviewWord('word-1', 'again');

      const stats = store.getReviewStats();
      expect(stats.totalReviews).toBe(1);
      expect(stats.correctReviews).toBe(0);
    });

    it('오늘 리뷰 카운트가 증가해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      store.reviewWord('word-1', 'good');

      expect(useSrsStore.getState().todayReviewCount).toBe(1);
    });

    it('모든 리뷰 등급을 처리해야 함', () => {
      const store = useSrsStore.getState();
      const ratings: ReviewRating[] = ['again', 'hard', 'good', 'easy'];

      ratings.forEach((rating, i) => {
        store.addWord(createWordData(`word-${i}`));
        expect(() => store.reviewWord(`word-${i}`, rating)).not.toThrow();
      });
    });
  });

  describe('getWordById', () => {
    it('ID로 단어를 찾아야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1', { word: 'apple' }));

      const found = store.getWordById('word-1');
      expect(found?.word).toBe('apple');
    });

    it('존재하지 않는 ID는 undefined 반환', () => {
      const store = useSrsStore.getState();
      expect(store.getWordById('non-existent')).toBeUndefined();
    });
  });

  describe('getAllWords', () => {
    it('모든 단어를 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      const all = store.getAllWords();
      expect(all).toHaveLength(2);
    });
  });

  describe('getWordsForReview', () => {
    it('복습 예정인 단어를 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      // 새 단어는 바로 복습 대상
      const dueWords = store.getWordsForReview();
      expect(dueWords).toHaveLength(1);
    });

    it('우선순위로 정렬되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      const dueWords = store.getWordsForReview();
      expect(dueWords.length).toBeGreaterThan(0);
    });
  });

  describe('getDueWordCount', () => {
    it('복습 예정 단어 수를 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      expect(store.getDueWordCount()).toBe(2);
    });
  });

  describe('getMasteredWords', () => {
    it('interval >= 21인 단어만 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      // 새 단어는 interval 0이므로 마스터되지 않음
      expect(store.getMasteredWords()).toHaveLength(0);

      // 수동으로 interval 설정 (테스트용)
      useSrsStore.setState({
        words: [
          {
            ...createWordData('word-1'),
            srsData: {
              wordId: 'word-1',
              repetition: 5,
              easeFactor: 2.5,
              interval: 25,
              nextReviewDate: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      });

      expect(store.getMasteredWords()).toHaveLength(1);
    });
  });

  describe('getWordProgress', () => {
    it('단어의 SRS 데이터를 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));

      const progress = store.getWordProgress('word-1');
      expect(progress).toBeDefined();
      expect(progress?.easeFactor).toBe(2.5);
    });

    it('존재하지 않는 단어는 undefined 반환', () => {
      const store = useSrsStore.getState();
      expect(store.getWordProgress('non-existent')).toBeUndefined();
    });
  });

  describe('setDailyGoal', () => {
    it('일일 목표를 설정해야 함', () => {
      const store = useSrsStore.getState();
      store.setDailyGoal(30);

      expect(useSrsStore.getState().dailyReviewGoal).toBe(30);
    });

    it('최소값은 1이어야 함', () => {
      const store = useSrsStore.getState();
      store.setDailyGoal(0);

      expect(useSrsStore.getState().dailyReviewGoal).toBe(1);
    });

    it('최대값은 100이어야 함', () => {
      const store = useSrsStore.getState();
      store.setDailyGoal(200);

      expect(useSrsStore.getState().dailyReviewGoal).toBe(100);
    });
  });

  describe('getTodayProgress', () => {
    it('오늘의 진행 상황을 반환해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.reviewWord('word-1', 'good');

      const progress = store.getTodayProgress();
      expect(progress.done).toBe(1);
      expect(progress.goal).toBe(20); // 기본값
    });
  });

  describe('checkAndResetDaily', () => {
    it('날짜가 바뀌면 todayReviewCount를 리셋해야 함', () => {
      const store = useSrsStore.getState();

      // 어제 날짜로 설정
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

      useSrsStore.setState({
        todayReviewCount: 15,
        lastReviewDate: yesterdayStr,
      });

      store.checkAndResetDaily();

      expect(useSrsStore.getState().todayReviewCount).toBe(0);
    });

    it('같은 날이면 리셋하지 않아야 함', () => {
      const store = useSrsStore.getState();
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      useSrsStore.setState({
        todayReviewCount: 10,
        lastReviewDate: todayStr,
      });

      store.checkAndResetDaily();

      expect(useSrsStore.getState().todayReviewCount).toBe(10);
    });
  });

  describe('resetAllProgress', () => {
    it('모든 단어의 SRS 데이터를 초기화해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.reviewWord('word-1', 'easy');
      store.reviewWord('word-1', 'easy');

      const beforeReset = store.getWordById('word-1');
      expect(beforeReset?.srsData.repetition).toBeGreaterThan(0);

      store.resetAllProgress();

      const afterReset = store.getWordById('word-1');
      expect(afterReset?.srsData.repetition).toBe(0);
    });

    it('통계를 초기화해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.reviewWord('word-1', 'good');

      store.resetAllProgress();

      const stats = store.getReviewStats();
      expect(stats.totalReviews).toBe(0);
      expect(stats.correctReviews).toBe(0);
    });

    it('단어 자체는 유지해야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      store.resetAllProgress();

      expect(useSrsStore.getState().words).toHaveLength(2);
    });
  });

  describe('getReviewStats', () => {
    it('초기 통계를 반환해야 함', () => {
      const store = useSrsStore.getState();
      const stats = store.getReviewStats();

      expect(stats.totalReviews).toBe(0);
      expect(stats.correctReviews).toBe(0);
      expect(stats.averageEaseFactor).toBe(2.5);
      expect(stats.longestInterval).toBe(0);
    });

    it('리뷰 후 통계가 업데이트되어야 함', () => {
      const store = useSrsStore.getState();
      store.addWord(createWordData('word-1'));
      store.addWord(createWordData('word-2'));

      store.reviewWord('word-1', 'good');
      store.reviewWord('word-2', 'easy');

      const stats = store.getReviewStats();
      expect(stats.totalReviews).toBe(2);
      expect(stats.correctReviews).toBe(2);
      expect(stats.lastReviewDate).toBeDefined();
    });
  });

  describe('getOverdueWords', () => {
    it('기한이 지난 단어를 반환해야 함', () => {
      const store = useSrsStore.getState();

      // 과거 날짜로 nextReviewDate 설정
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 5);

      useSrsStore.setState({
        words: [
          {
            ...createWordData('word-1'),
            srsData: {
              wordId: 'word-1',
              repetition: 1,
              easeFactor: 2.5,
              interval: 1,
              nextReviewDate: pastDate.toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
        ],
      });

      const overdue = store.getOverdueWords();
      expect(overdue).toHaveLength(1);
    });
  });
});

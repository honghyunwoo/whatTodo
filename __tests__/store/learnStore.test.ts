/**
 * LearnStore Tests
 *
 * @created 2026-01-03 - 상용화 준비 Phase 0
 *
 * Tests for learning progress, week/level management, and quiz results.
 */

import {
  useLearnStore,
  createActivityId,
  getWeekNumber,
  ACTIVITY_TYPES,
  WEEK_IDS,
} from '@/store/learnStore';
import type { ActivityType, CEFRLevel, LearnProgress } from '@/types/activity';

// Mock the hooks module
jest.mock('@/hooks/useStoreReady', () => ({
  isStoreHydrated: jest.fn(() => false),
}));

describe('learnStore', () => {
  // Reset store before each test
  beforeEach(() => {
    useLearnStore.setState({
      currentWeek: 'week-1',
      currentLevel: 'A1',
      progress: [],
      weekProgress: [],
      streak: 0,
      lastStudyDate: null,
    });
  });

  describe('setCurrentWeek', () => {
    it('유효한 주차로 변경해야 함', () => {
      const store = useLearnStore.getState();
      store.setCurrentWeek('week-3');

      expect(useLearnStore.getState().currentWeek).toBe('week-3');
    });

    it('유효하지 않은 주차는 무시해야 함', () => {
      const store = useLearnStore.getState();
      store.setCurrentWeek('week-99');

      expect(useLearnStore.getState().currentWeek).toBe('week-1');
    });

    it('모든 유효한 주차를 허용해야 함', () => {
      const store = useLearnStore.getState();

      WEEK_IDS.forEach((weekId) => {
        store.setCurrentWeek(weekId);
        expect(useLearnStore.getState().currentWeek).toBe(weekId);
      });
    });
  });

  describe('setCurrentLevel', () => {
    it('레벨을 변경해야 함', () => {
      const store = useLearnStore.getState();
      store.setCurrentLevel('B1');

      expect(useLearnStore.getState().currentLevel).toBe('B1');
    });

    it('모든 CEFR 레벨을 허용해야 함', () => {
      const store = useLearnStore.getState();
      const levels: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

      levels.forEach((level) => {
        store.setCurrentLevel(level);
        expect(useLearnStore.getState().currentLevel).toBe(level);
      });
    });
  });

  describe('updateProgress', () => {
    it('새 진행률을 추가해야 함', () => {
      const store = useLearnStore.getState();
      const progress: LearnProgress = {
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: false,
        score: 0,
        timeSpent: 0,
        lastAttempt: new Date().toISOString(),
      };

      store.updateProgress(progress);

      expect(useLearnStore.getState().progress).toHaveLength(1);
      expect(useLearnStore.getState().progress[0].activityId).toBe('week-1-vocabulary');
    });

    it('기존 진행률을 업데이트해야 함', () => {
      const store = useLearnStore.getState();

      // 첫 번째 진행률
      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: false,
        score: 50,
        timeSpent: 100,
        lastAttempt: new Date().toISOString(),
      });

      // 업데이트
      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: true,
        score: 90,
        timeSpent: 200,
        lastAttempt: new Date().toISOString(),
      });

      const progress = useLearnStore.getState().progress;
      expect(progress).toHaveLength(1);
      expect(progress[0].score).toBe(90);
      expect(progress[0].completed).toBe(true);
    });
  });

  describe('markActivityComplete', () => {
    it('활동을 완료로 표시해야 함', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');

      store.markActivityComplete('week-1-vocabulary', 'week-1', 'vocabulary', 85);

      const progress = store.getActivityProgress('week-1-vocabulary');
      expect(progress).toBeDefined();
      expect(progress?.completed).toBe(true);
      expect(progress?.score).toBe(85);
    });

    it('주간 진행률에 완료된 활동을 추가해야 함', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');

      store.markActivityComplete('week-1-vocabulary', 'week-1', 'vocabulary', 80);
      store.markActivityComplete('week-1-grammar', 'week-1', 'grammar', 90);

      const weekProgress = store.getWeekProgress('week-1');
      expect(weekProgress?.activitiesCompleted).toHaveLength(2);
      expect(weekProgress?.activitiesCompleted).toContain('week-1-vocabulary');
      expect(weekProgress?.activitiesCompleted).toContain('week-1-grammar');
    });

    it('중복 완료는 무시해야 함', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');

      store.markActivityComplete('week-1-vocabulary', 'week-1', 'vocabulary', 80);
      store.markActivityComplete('week-1-vocabulary', 'week-1', 'vocabulary', 90);

      const weekProgress = store.getWeekProgress('week-1');
      expect(weekProgress?.activitiesCompleted).toHaveLength(1);
    });
  });

  describe('saveQuizResults', () => {
    it('퀴즈 결과를 저장하고 점수를 계산해야 함', () => {
      const store = useLearnStore.getState();

      // 먼저 진행률 생성
      store.updateProgress({
        activityId: 'week-1-grammar',
        weekId: 'week-1',
        type: 'grammar',
        completed: false,
        score: 0,
        timeSpent: 0,
        lastAttempt: new Date().toISOString(),
      });

      // 퀴즈 결과 저장 (5개 중 4개 정답)
      store.saveQuizResults('week-1-grammar', [
        { exerciseId: 'ex1', userAnswer: 'a', correct: true, timeSpent: 10 },
        { exerciseId: 'ex2', userAnswer: 'b', correct: true, timeSpent: 15 },
        { exerciseId: 'ex3', userAnswer: 'c', correct: true, timeSpent: 12 },
        { exerciseId: 'ex4', userAnswer: 'd', correct: true, timeSpent: 8 },
        { exerciseId: 'ex5', userAnswer: 'e', correct: false, timeSpent: 20 },
      ]);

      const progress = store.getActivityProgress('week-1-grammar');
      expect(progress?.score).toBe(80); // 4/5 = 80%
      expect(progress?.exercisesCorrect).toBe(4);
      expect(progress?.exercisesTotal).toBe(5);
    });
  });

  describe('saveFlashCardResults', () => {
    it('플래시카드 결과를 저장해야 함', () => {
      const store = useLearnStore.getState();

      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: false,
        score: 0,
        timeSpent: 0,
        lastAttempt: new Date().toISOString(),
      });

      // 10개 중 7개 알고 있음
      store.saveFlashCardResults(
        'week-1-vocabulary',
        Array.from({ length: 10 }, (_, i) => ({
          wordId: `word-${i}`,
          known: i < 7,
          attempts: 1,
        }))
      );

      const progress = store.getActivityProgress('week-1-vocabulary');
      expect(progress?.score).toBe(70);
      expect(progress?.wordsMastered).toBe(7);
    });
  });

  describe('getWeekCompletionRate', () => {
    it('주간 완료율을 계산해야 함', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');

      // 6개 활동 중 3개 완료
      store.markActivityComplete('week-1-vocabulary', 'week-1', 'vocabulary', 80);
      store.markActivityComplete('week-1-grammar', 'week-1', 'grammar', 85);
      store.markActivityComplete('week-1-listening', 'week-1', 'listening', 90);

      const rate = store.getWeekCompletionRate('week-1');
      expect(rate).toBe(50); // 3/6 = 50%
    });

    it('주간 진행률이 없으면 0 반환', () => {
      const store = useLearnStore.getState();
      expect(store.getWeekCompletionRate('week-99')).toBe(0);
    });
  });

  describe('getTotalWordsLearned', () => {
    it('학습한 총 단어 수를 계산해야 함', () => {
      const store = useLearnStore.getState();

      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: true,
        score: 80,
        timeSpent: 100,
        wordsMastered: 15,
        lastAttempt: new Date().toISOString(),
      });

      store.updateProgress({
        activityId: 'week-2-vocabulary',
        weekId: 'week-2',
        type: 'vocabulary',
        completed: true,
        score: 90,
        timeSpent: 120,
        wordsMastered: 20,
        lastAttempt: new Date().toISOString(),
      });

      expect(store.getTotalWordsLearned()).toBe(35);
    });

    it('vocabulary 타입만 계산해야 함', () => {
      const store = useLearnStore.getState();

      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: true,
        score: 80,
        timeSpent: 100,
        wordsMastered: 10,
        lastAttempt: new Date().toISOString(),
      });

      store.updateProgress({
        activityId: 'week-1-grammar',
        weekId: 'week-1',
        type: 'grammar',
        completed: true,
        score: 90,
        timeSpent: 120,
        wordsMastered: 5, // grammar는 무시됨
        lastAttempt: new Date().toISOString(),
      });

      expect(store.getTotalWordsLearned()).toBe(10);
    });
  });

  describe('getTotalActivitiesCompleted', () => {
    it('완료한 활동 수를 계산해야 함', () => {
      const store = useLearnStore.getState();

      store.updateProgress({
        activityId: 'week-1-vocabulary',
        weekId: 'week-1',
        type: 'vocabulary',
        completed: true,
        score: 80,
        timeSpent: 100,
        lastAttempt: new Date().toISOString(),
      });

      store.updateProgress({
        activityId: 'week-1-grammar',
        weekId: 'week-1',
        type: 'grammar',
        completed: false, // 미완료
        score: 50,
        timeSpent: 50,
        lastAttempt: new Date().toISOString(),
      });

      store.updateProgress({
        activityId: 'week-1-listening',
        weekId: 'week-1',
        type: 'listening',
        completed: true,
        score: 90,
        timeSpent: 80,
        lastAttempt: new Date().toISOString(),
      });

      expect(store.getTotalActivitiesCompleted()).toBe(2);
    });
  });

  describe('initWeekProgress', () => {
    it('주간 진행률을 초기화해야 함', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');

      const weekProgress = store.getWeekProgress('week-1');
      expect(weekProgress).toBeDefined();
      expect(weekProgress?.weekId).toBe('week-1');
      expect(weekProgress?.activitiesCompleted).toEqual([]);
      expect(weekProgress?.totalScore).toBe(0);
    });

    it('이미 존재하는 주차는 중복 생성하지 않음', () => {
      const store = useLearnStore.getState();
      store.initWeekProgress('week-1');
      store.initWeekProgress('week-1');

      expect(useLearnStore.getState().weekProgress).toHaveLength(1);
    });
  });

  describe('updateStreak', () => {
    it('첫 학습 시 스트릭 1로 설정', () => {
      const store = useLearnStore.getState();
      store.updateStreak();

      expect(store.getStreak()).toBe(1);
    });

    it('같은 날 다시 학습해도 스트릭 유지', () => {
      const store = useLearnStore.getState();
      store.updateStreak();
      store.updateStreak();
      store.updateStreak();

      expect(store.getStreak()).toBe(1);
    });

    it('연속 학습 시 스트릭 증가', () => {
      const store = useLearnStore.getState();

      // 어제 학습 기록 설정
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      useLearnStore.setState({
        streak: 5,
        lastStudyDate: yesterday.toDateString(),
      });

      store.updateStreak();

      expect(store.getStreak()).toBe(6);
    });

    it('학습 중단 시 스트릭 리셋', () => {
      const store = useLearnStore.getState();

      // 2일 전 학습 기록 설정
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      useLearnStore.setState({
        streak: 10,
        lastStudyDate: twoDaysAgo.toDateString(),
      });

      store.updateStreak();

      expect(store.getStreak()).toBe(1);
    });
  });

  describe('resetProgress', () => {
    it('모든 진행률을 초기화해야 함', () => {
      const store = useLearnStore.getState();

      // 데이터 추가
      store.setCurrentWeek('week-3');
      store.setCurrentLevel('B2');
      store.initWeekProgress('week-3');
      store.markActivityComplete('week-3-vocabulary', 'week-3', 'vocabulary', 80);
      store.updateStreak();

      // 리셋
      store.resetProgress();

      const state = useLearnStore.getState();
      expect(state.progress).toEqual([]);
      expect(state.weekProgress).toEqual([]);
      expect(state.streak).toBe(0);
      expect(state.lastStudyDate).toBeNull();
      expect(state.currentWeek).toBe('week-1');
    });
  });

  describe('Utility Functions', () => {
    it('createActivityId: 활동 ID를 생성해야 함', () => {
      expect(createActivityId('week-1', 'vocabulary')).toBe('week-1-vocabulary');
      expect(createActivityId('week-3', 'grammar')).toBe('week-3-grammar');
    });

    it('getWeekNumber: 주차 번호를 추출해야 함', () => {
      expect(getWeekNumber('week-1')).toBe(1);
      expect(getWeekNumber('week-5')).toBe(5);
      expect(getWeekNumber('week-8')).toBe(8);
      expect(getWeekNumber('invalid')).toBe(1);
    });

    it('ACTIVITY_TYPES: 6개 활동 타입이 있어야 함', () => {
      expect(ACTIVITY_TYPES).toHaveLength(6);
      expect(ACTIVITY_TYPES).toContain('vocabulary');
      expect(ACTIVITY_TYPES).toContain('grammar');
      expect(ACTIVITY_TYPES).toContain('listening');
      expect(ACTIVITY_TYPES).toContain('reading');
      expect(ACTIVITY_TYPES).toContain('speaking');
      expect(ACTIVITY_TYPES).toContain('writing');
    });

    it('WEEK_IDS: 8개 주차가 있어야 함', () => {
      expect(WEEK_IDS).toHaveLength(8);
      expect(WEEK_IDS[0]).toBe('week-1');
      expect(WEEK_IDS[7]).toBe('week-8');
    });
  });
});

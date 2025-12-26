/**
 * Adaptive Level Test Algorithm
 * CEFR placement test with adaptive difficulty
 */

import type { CEFRLevel } from '@/types/activity';
import type {
  LevelScore,
  LevelTestConfig,
  LevelTestResult,
  LevelTestState,
  QuestionType,
  SkillResult,
  TestAnswer,
  TestQuestion,
} from '@/types/levelTest';

// ─────────────────────────────────────
// Configuration
// ─────────────────────────────────────

const DEFAULT_CONFIG: LevelTestConfig = {
  minQuestions: 15,
  maxQuestions: 30,
  questionsPerLevel: 5,
  accuracyThresholdUp: 0.8, // 80% correct to level up
  accuracyThresholdDown: 0.4, // Below 40% to level down
  timePerQuestion: 45, // 45 seconds default
  skillDistribution: {
    vocabulary: 0.3,
    grammar: 0.3,
    reading: 0.25,
    listening: 0.15,
  },
};

const CEFR_ORDER: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

// ─────────────────────────────────────
// Adaptive Level Test Class
// ─────────────────────────────────────

export class AdaptiveLevelTest {
  private state: LevelTestState;
  private config: LevelTestConfig;
  private questionBank: Map<CEFRLevel, TestQuestion[]>;

  constructor(
    questionBank: Map<CEFRLevel, TestQuestion[]>,
    config: Partial<LevelTestConfig> = {},
    initialLevel: CEFRLevel = 'A2'
  ) {
    this.questionBank = questionBank;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = this.createInitialState(initialLevel);
  }

  // ─────────────────────────────────────
  // State Management
  // ─────────────────────────────────────

  /**
   * Create initial test state
   */
  private createInitialState(initialLevel: CEFRLevel): LevelTestState {
    const levelScores: Record<CEFRLevel, LevelScore> = {} as Record<CEFRLevel, LevelScore>;
    CEFR_ORDER.forEach((level) => {
      levelScores[level] = { attempted: 0, correct: 0, accuracy: 0 };
    });

    return {
      testId: this.generateId(),
      startedAt: new Date().toISOString(),
      currentQuestionIndex: 0,
      currentLevel: initialLevel,
      answers: [],
      levelScores,
      isComplete: false,
    };
  }

  /**
   * Get current state
   */
  getState(): LevelTestState {
    return { ...this.state };
  }

  /**
   * Restore state from saved session
   */
  restoreState(state: LevelTestState): void {
    this.state = { ...state };
  }

  // ─────────────────────────────────────
  // Question Selection
  // ─────────────────────────────────────

  /**
   * Get the next question based on current state
   */
  getNextQuestion(): TestQuestion | null {
    // Check if test should end
    if (this.shouldEndTest()) {
      return null;
    }

    // Get questions for current level
    const levelQuestions = this.questionBank.get(this.state.currentLevel) || [];
    const answeredIds = new Set(this.state.answers.map((a) => a.questionId));

    // Filter out already answered questions
    const availableQuestions = levelQuestions.filter((q) => !answeredIds.has(q.id));

    if (availableQuestions.length === 0) {
      // No more questions at this level, try to adjust level
      const adjusted = this.tryAdjustLevel();
      if (!adjusted) {
        return null; // No more questions anywhere
      }
      return this.getNextQuestion();
    }

    // Select question based on skill distribution
    const selectedQuestion = this.selectBalancedQuestion(availableQuestions);

    return selectedQuestion;
  }

  /**
   * Select a question that balances skill types
   */
  private selectBalancedQuestion(questions: TestQuestion[]): TestQuestion {
    // Count current skill distribution
    const skillCounts: Record<QuestionType, number> = {
      vocabulary: 0,
      grammar: 0,
      reading: 0,
      listening: 0,
    };

    this.state.answers.forEach((answer) => {
      skillCounts[answer.question.type]++;
    });

    const totalAnswered = this.state.answers.length || 1;

    // Calculate which skill needs more questions
    const skillNeeds: { type: QuestionType; need: number }[] = [];

    (Object.keys(this.config.skillDistribution) as QuestionType[]).forEach((skill) => {
      const targetRatio = this.config.skillDistribution[skill];
      const currentRatio = skillCounts[skill] / totalAnswered;
      skillNeeds.push({ type: skill, need: targetRatio - currentRatio });
    });

    // Sort by need (highest first)
    skillNeeds.sort((a, b) => b.need - a.need);

    // Try to find a question matching the most needed skill
    for (const { type } of skillNeeds) {
      const skillQuestions = questions.filter((q) => q.type === type);
      if (skillQuestions.length > 0) {
        // Return random question from this skill
        return skillQuestions[Math.floor(Math.random() * skillQuestions.length)];
      }
    }

    // Fallback: return any random question
    return questions[Math.floor(Math.random() * questions.length)];
  }

  // ─────────────────────────────────────
  // Answer Processing
  // ─────────────────────────────────────

  /**
   * Submit an answer and get feedback
   */
  submitAnswer(
    question: TestQuestion,
    selectedAnswer: number,
    timeSpent: number
  ): { correct: boolean; shouldContinue: boolean } {
    const correct = selectedAnswer === question.correctAnswer;

    // Record answer
    const answer: TestAnswer = {
      questionId: question.id,
      question,
      selectedAnswer,
      correct,
      timeSpent,
      answeredAt: new Date().toISOString(),
    };

    this.state.answers.push(answer);
    this.state.currentQuestionIndex++;

    // Update level scores
    const levelScore = this.state.levelScores[question.level];
    levelScore.attempted++;
    if (correct) levelScore.correct++;
    levelScore.accuracy = (levelScore.correct / levelScore.attempted) * 100;

    // Check if we should adjust level
    this.checkAndAdjustLevel();

    // Check if test should continue
    const shouldContinue = !this.shouldEndTest();

    if (!shouldContinue) {
      this.state.isComplete = true;
      this.state.finalLevel = this.calculateFinalLevel();
    }

    return { correct, shouldContinue };
  }

  // ─────────────────────────────────────
  // Level Adjustment
  // ─────────────────────────────────────

  /**
   * Check and adjust level based on recent performance
   */
  private checkAndAdjustLevel(): void {
    const currentLevelAnswers = this.state.answers.filter(
      (a) => a.question.level === this.state.currentLevel
    );

    // Only adjust after enough questions at current level
    if (currentLevelAnswers.length < this.config.questionsPerLevel) {
      return;
    }

    // Calculate recent accuracy at current level
    const recentAnswers = currentLevelAnswers.slice(-this.config.questionsPerLevel);
    const recentCorrect = recentAnswers.filter((a) => a.correct).length;
    const recentAccuracy = recentCorrect / recentAnswers.length;

    // Decide whether to adjust level
    if (recentAccuracy >= this.config.accuracyThresholdUp) {
      // Try to level up
      this.tryLevelUp();
    } else if (recentAccuracy < this.config.accuracyThresholdDown) {
      // Try to level down
      this.tryLevelDown();
    }
  }

  /**
   * Try to move up a level
   */
  private tryLevelUp(): boolean {
    const currentIndex = CEFR_ORDER.indexOf(this.state.currentLevel);
    if (currentIndex < CEFR_ORDER.length - 1) {
      this.state.currentLevel = CEFR_ORDER[currentIndex + 1];
      return true;
    }
    return false;
  }

  /**
   * Try to move down a level
   */
  private tryLevelDown(): boolean {
    const currentIndex = CEFR_ORDER.indexOf(this.state.currentLevel);
    if (currentIndex > 0) {
      this.state.currentLevel = CEFR_ORDER[currentIndex - 1];
      return true;
    }
    return false;
  }

  /**
   * Try to adjust level when out of questions
   */
  private tryAdjustLevel(): boolean {
    // Try to go up first, then down
    if (this.tryLevelUp()) return true;
    if (this.tryLevelDown()) return true;
    return false;
  }

  // ─────────────────────────────────────
  // Test Completion
  // ─────────────────────────────────────

  /**
   * Check if test should end
   */
  private shouldEndTest(): boolean {
    const totalAnswered = this.state.answers.length;

    // Maximum questions reached
    if (totalAnswered >= this.config.maxQuestions) {
      return true;
    }

    // Minimum questions not reached yet
    if (totalAnswered < this.config.minQuestions) {
      return false;
    }

    // Check if level is stable (same level for last N questions)
    const recentLevels = this.state.answers
      .slice(-this.config.questionsPerLevel)
      .map((a) => a.question.level);

    const allSameLevel = recentLevels.every((l) => l === this.state.currentLevel);
    const goodAccuracy =
      this.state.levelScores[this.state.currentLevel].accuracy >= 60 &&
      this.state.levelScores[this.state.currentLevel].accuracy <= 80;

    return allSameLevel && goodAccuracy;
  }

  /**
   * Calculate final level based on all answers
   */
  private calculateFinalLevel(): CEFRLevel {
    // Find the highest level with at least 60% accuracy
    for (let i = CEFR_ORDER.length - 1; i >= 0; i--) {
      const level = CEFR_ORDER[i];
      const score = this.state.levelScores[level];

      if (score.attempted >= 3 && score.accuracy >= 60) {
        return level;
      }
    }

    // Find highest level with any correct answers
    for (let i = CEFR_ORDER.length - 1; i >= 0; i--) {
      const level = CEFR_ORDER[i];
      const score = this.state.levelScores[level];

      if (score.correct > 0) {
        return level;
      }
    }

    return 'A1'; // Default to A1
  }

  // ─────────────────────────────────────
  // Results
  // ─────────────────────────────────────

  /**
   * Get final test result
   */
  getResult(): LevelTestResult | null {
    if (!this.state.isComplete || !this.state.finalLevel) {
      return null;
    }

    const startTime = new Date(this.state.startedAt);
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    // Calculate skill breakdown
    const skillBreakdown = this.calculateSkillBreakdown();

    // Calculate confidence
    const confidence = this.calculateConfidence();

    // Generate recommendations
    const recommendations = this.generateRecommendations();

    // Calculate suggested start week
    const suggestedStartWeek = this.calculateSuggestedStartWeek();

    return {
      testId: this.state.testId,
      completedAt: endTime.toISOString(),
      duration,
      finalLevel: this.state.finalLevel,
      confidence,
      skillBreakdown,
      levelBreakdown: { ...this.state.levelScores },
      recommendations,
      suggestedStartWeek,
    };
  }

  /**
   * Calculate skill breakdown
   */
  private calculateSkillBreakdown(): LevelTestResult['skillBreakdown'] {
    const skills: QuestionType[] = ['vocabulary', 'grammar', 'reading', 'listening'];
    const breakdown = {} as LevelTestResult['skillBreakdown'];

    skills.forEach((skill) => {
      const skillAnswers = this.state.answers.filter((a) => a.question.type === skill);
      const correct = skillAnswers.filter((a) => a.correct).length;
      const total = skillAnswers.length;

      // Estimate level for this skill
      let estimatedLevel: CEFRLevel = 'A1';
      if (total >= 2) {
        const accuracy = (correct / total) * 100;
        const avgLevel = this.calculateAverageLevel(skillAnswers);
        estimatedLevel = this.adjustLevelByAccuracy(avgLevel, accuracy);
      }

      breakdown[skill] = {
        questionsAttempted: total,
        questionsCorrect: correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
        estimatedLevel,
      };
    });

    return breakdown;
  }

  /**
   * Calculate average level from answers
   */
  private calculateAverageLevel(answers: TestAnswer[]): CEFRLevel {
    if (answers.length === 0) return 'A1';

    const correctAnswers = answers.filter((a) => a.correct);
    if (correctAnswers.length === 0) return 'A1';

    const levelSum = correctAnswers.reduce((sum, a) => {
      return sum + CEFR_ORDER.indexOf(a.question.level);
    }, 0);

    const avgIndex = Math.round(levelSum / correctAnswers.length);
    return CEFR_ORDER[Math.min(avgIndex, CEFR_ORDER.length - 1)];
  }

  /**
   * Adjust level based on accuracy
   */
  private adjustLevelByAccuracy(baseLevel: CEFRLevel, accuracy: number): CEFRLevel {
    const index = CEFR_ORDER.indexOf(baseLevel);

    if (accuracy >= 80 && index < CEFR_ORDER.length - 1) {
      return CEFR_ORDER[index + 1];
    } else if (accuracy < 50 && index > 0) {
      return CEFR_ORDER[index - 1];
    }

    return baseLevel;
  }

  /**
   * Calculate confidence in the result
   */
  private calculateConfidence(): number {
    const totalQuestions = this.state.answers.length;
    const finalLevelQuestions = this.state.answers.filter(
      (a) => a.question.level === this.state.finalLevel
    );
    const finalLevelAccuracy =
      finalLevelQuestions.length > 0
        ? finalLevelQuestions.filter((a) => a.correct).length / finalLevelQuestions.length
        : 0;

    // Confidence factors
    const questionCount = Math.min(totalQuestions / this.config.maxQuestions, 1) * 40;
    const accuracyScore = finalLevelAccuracy * 40;
    const consistencyScore = this.calculateConsistencyScore() * 20;

    return Math.round(questionCount + accuracyScore + consistencyScore);
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(): number {
    if (this.state.answers.length < 5) return 0;

    // Check how consistent the answers were at the final level
    const recentAnswers = this.state.answers.slice(-5);
    const atFinalLevel = recentAnswers.filter(
      (a) => a.question.level === this.state.finalLevel
    ).length;

    return atFinalLevel / 5;
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const skillBreakdown = this.calculateSkillBreakdown();

    // Find weakest skill
    const skills = Object.entries(skillBreakdown);
    skills.sort((a, b) => a[1].accuracy - b[1].accuracy);
    const weakestSkill = skills[0];

    if (weakestSkill[1].accuracy < 60) {
      const skillNames: Record<QuestionType, string> = {
        vocabulary: '어휘',
        grammar: '문법',
        reading: '읽기',
        listening: '듣기',
      };
      recommendations.push(
        `${skillNames[weakestSkill[0] as QuestionType]} 영역을 집중적으로 학습하세요.`
      );
    }

    // Level-specific recommendations
    const level = this.state.finalLevel;
    if (level === 'A1') {
      recommendations.push('기초 어휘와 간단한 문장 구조부터 시작하세요.');
      recommendations.push('매일 짧은 시간이라도 꾸준히 학습하세요.');
    } else if (level === 'A2') {
      recommendations.push('일상 대화 표현을 많이 연습하세요.');
      recommendations.push('듣기와 말하기 연습을 병행하세요.');
    } else if (level === 'B1') {
      recommendations.push('다양한 주제의 글을 읽어보세요.');
      recommendations.push('복잡한 문장 구조를 연습하세요.');
    } else if (level === 'B2') {
      recommendations.push('뉴스나 기사를 영어로 읽어보세요.');
      recommendations.push('영어로 의견을 표현하는 연습을 하세요.');
    }

    return recommendations;
  }

  /**
   * Calculate suggested start week based on level
   */
  private calculateSuggestedStartWeek(): number {
    const level = this.state.finalLevel || 'A1';
    const levelScore = this.state.levelScores[level];

    // If accuracy is high at current level, start at later week
    if (levelScore.accuracy >= 80) {
      return 5; // Start at week 5 of the level
    } else if (levelScore.accuracy >= 60) {
      return 3; // Start at week 3
    }

    return 1; // Start from week 1
  }

  // ─────────────────────────────────────
  // Utility
  // ─────────────────────────────────────

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get progress info
   */
  getProgress(): { current: number; max: number; percentage: number } {
    return {
      current: this.state.answers.length,
      max: this.config.maxQuestions,
      percentage: Math.round((this.state.answers.length / this.config.maxQuestions) * 100),
    };
  }

  /**
   * Get current accuracy
   */
  getCurrentAccuracy(): number {
    if (this.state.answers.length === 0) return 0;
    const correct = this.state.answers.filter((a) => a.correct).length;
    return Math.round((correct / this.state.answers.length) * 100);
  }
}

// ─────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────

/**
 * Create an empty question bank structure
 */
export function createEmptyQuestionBank(): Map<CEFRLevel, TestQuestion[]> {
  const bank = new Map<CEFRLevel, TestQuestion[]>();
  CEFR_ORDER.forEach((level) => {
    bank.set(level, []);
  });
  return bank;
}

/**
 * Add questions to a question bank
 */
export function addQuestionsToBank(
  bank: Map<CEFRLevel, TestQuestion[]>,
  questions: TestQuestion[]
): void {
  questions.forEach((q) => {
    const levelQuestions = bank.get(q.level);
    if (levelQuestions) {
      levelQuestions.push(q);
    }
  });
}

/**
 * Get level display info
 */
export function getLevelInfo(level: CEFRLevel): { name: string; color: string; description: string } {
  const info: Record<CEFRLevel, { name: string; color: string; description: string }> = {
    A1: { name: '초급', color: '#10b981', description: '기초 표현과 간단한 문장' },
    A2: { name: '기초', color: '#3b82f6', description: '일상적인 상황 대처 가능' },
    B1: { name: '중급', color: '#f59e0b', description: '주요 상황에서 자연스러운 대화' },
    B2: { name: '중상급', color: '#ef4444', description: '복잡한 주제 이해 및 토론 가능' },
    C1: { name: '고급', color: '#8b5cf6', description: '복잡한 텍스트 이해 및 자연스러운 표현' },
    C2: { name: '최상급', color: '#ec4899', description: '원어민 수준의 유창함' },
  };
  return info[level];
}

export default AdaptiveLevelTest;

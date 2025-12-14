/**
 * Level Test Types
 * Types for adaptive CEFR placement test
 */

import type { CEFRLevel } from '@/types/activity';

// Test question types
export type QuestionType = 'vocabulary' | 'grammar' | 'reading' | 'listening';

// Test question
export interface TestQuestion {
  id: string;
  type: QuestionType;
  level: CEFRLevel;
  difficulty: number; // 1-10 within level

  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option

  // Optional fields
  context?: string; // Reading passage or listening context
  audioUrl?: string; // For listening questions
  explanation?: string; // Explanation of correct answer
  timeLimit?: number; // Seconds allowed for this question
}

// Test state
export interface LevelTestState {
  testId: string;
  startedAt: string;
  currentQuestionIndex: number;
  currentLevel: CEFRLevel;

  // History
  answers: TestAnswer[];
  levelScores: Record<CEFRLevel, LevelScore>;

  // Control
  isComplete: boolean;
  finalLevel?: CEFRLevel;
}

// Individual answer
export interface TestAnswer {
  questionId: string;
  question: TestQuestion;
  selectedAnswer: number;
  correct: boolean;
  timeSpent: number; // Seconds
  answeredAt: string;
}

// Score per level
export interface LevelScore {
  attempted: number;
  correct: number;
  accuracy: number; // 0-100
}

// Test result
export interface LevelTestResult {
  testId: string;
  completedAt: string;
  duration: number; // Total test time in seconds

  finalLevel: CEFRLevel;
  confidence: number; // 0-100, how confident we are in the level

  // Breakdown by skill
  skillBreakdown: {
    vocabulary: SkillResult;
    grammar: SkillResult;
    reading: SkillResult;
    listening: SkillResult;
  };

  // Breakdown by level
  levelBreakdown: Record<CEFRLevel, LevelScore>;

  // Recommendations
  recommendations: string[];
  suggestedStartWeek: number;
}

// Skill result
export interface SkillResult {
  questionsAttempted: number;
  questionsCorrect: number;
  accuracy: number;
  estimatedLevel: CEFRLevel;
}

// Test configuration
export interface LevelTestConfig {
  minQuestions: number; // Minimum questions to ask
  maxQuestions: number; // Maximum questions to ask
  questionsPerLevel: number; // Questions before level change decision
  accuracyThresholdUp: number; // Accuracy to go up a level (e.g., 0.8)
  accuracyThresholdDown: number; // Accuracy to go down a level (e.g., 0.4)
  timePerQuestion: number; // Default seconds per question
  skillDistribution: Record<QuestionType, number>; // Weight for each skill type
}

// Test session for persistence
export interface LevelTestSession {
  id: string;
  userId?: string;
  state: LevelTestState;
  config: LevelTestConfig;
  createdAt: string;
  updatedAt: string;
}

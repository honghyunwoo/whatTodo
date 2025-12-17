/**
 * CEFR 12-Level System
 * Common European Framework of Reference for Languages
 * A1.1 ~ C2.2 (12 detailed levels)
 */

import { CEFRLevel, FullCEFRLevel } from '@/types/activity';

// CEFR Level Definition (all 6 levels)
export interface CEFRLevelDefinition {
  code: FullCEFRLevel;
  major: string; // A1, A2, B1, B2, C1, C2
  minor: string; // 1, 2
  name: string;
  koreanName: string;
  description: string;
  canDo: string[];
  grammarPoints: string[];
  vocabularySize: number;
  estimatedHours: number; // Cumulative hours
  color: string; // UI color
}

// 12 CEFR Levels
export const CEFR_LEVELS: CEFRLevelDefinition[] = [
  // A1 - Beginner
  {
    code: 'A1',
    major: 'A1',
    minor: '1',
    name: 'Beginner',
    koreanName: '초급',
    description: 'Basic everyday expressions',
    canDo: [
      'Introduce yourself and others',
      'Ask and answer simple questions',
      'Use basic greetings and expressions',
    ],
    grammarPoints: ['be verb', 'present tense', 'pronouns', 'singular/plural', 'basic questions'],
    vocabularySize: 600,
    estimatedHours: 100,
    color: '#10b981',
  },

  // A2 - Elementary
  {
    code: 'A2',
    major: 'A2',
    minor: '1',
    name: 'Elementary',
    koreanName: '기초',
    description: 'Familiar everyday topics communication',
    canDo: [
      'Describe your background, education, job',
      'Handle simple travel situations',
      'Talk about personal interests',
    ],
    grammarPoints: [
      'future tense',
      'comparatives/superlatives',
      'modals (can, should)',
      'conjunctions',
    ],
    vocabularySize: 1500,
    estimatedHours: 250,
    color: '#3b82f6',
  },

  // B1 - Intermediate
  {
    code: 'B1',
    major: 'B1',
    minor: '1',
    name: 'Intermediate',
    koreanName: '중급',
    description: 'Standard language on familiar topics',
    canDo: [
      'Participate in work/school discussions',
      'Handle most travel situations',
      'Give simple presentations',
    ],
    grammarPoints: [
      'past perfect',
      'future perfect',
      'relative adverbs',
      'participles',
      'conditionals',
    ],
    vocabularySize: 3500,
    estimatedHours: 550,
    color: '#f59e0b',
  },

  // B2 - Upper Intermediate
  {
    code: 'B2',
    major: 'B2',
    minor: '1',
    name: 'Upper Intermediate',
    koreanName: '중상급',
    description: 'Complex text comprehension',
    canDo: [
      'Understand complex abstract topics',
      'Engage in technical discussions',
      'Communicate fluently with natives',
    ],
    grammarPoints: [
      'advanced passive',
      'complex conditionals',
      'reported speech',
      'emphasis',
      'ellipsis',
    ],
    vocabularySize: 6500,
    estimatedHours: 900,
    color: '#ef4444',
  },

  // C1 - Advanced
  {
    code: 'C1',
    major: 'C1',
    minor: '1',
    name: 'Advanced',
    koreanName: '고급',
    description: 'Wide range of demanding texts',
    canDo: [
      'Understand long complex texts',
      'Express fluently and spontaneously',
      'Use language effectively for all purposes',
    ],
    grammarPoints: [
      'advanced grammar',
      'idiomatic expressions',
      'academic writing',
      'logical connectors',
    ],
    vocabularySize: 11000,
    estimatedHours: 1300,
    color: '#8b5cf6',
  },

  // C2 - Proficiency
  {
    code: 'C2',
    major: 'C2',
    minor: '1',
    name: 'Proficiency',
    koreanName: '최상급',
    description: 'Near-native fluency',
    canDo: [
      'Understand virtually everything',
      'Summarize from various sources',
      'Express precisely in complex situations',
    ],
    grammarPoints: [
      'native level',
      'all structures mastered',
      'nuance understanding',
      'literary analysis',
    ],
    vocabularySize: 20000,
    estimatedHours: 2000,
    color: '#ec4899',
  },
];

// Helper functions
export function getCEFRLevel(code: FullCEFRLevel): CEFRLevelDefinition | undefined {
  return CEFR_LEVELS.find((level) => level.code === code);
}

export function getCEFRLevelsByMajor(major: string): CEFRLevelDefinition[] {
  return CEFR_LEVELS.filter((level) => level.major === major);
}

export function getNextLevel(currentLevel: FullCEFRLevel): FullCEFRLevel | null {
  const currentIndex = CEFR_LEVELS.findIndex((level) => level.code === currentLevel);
  if (currentIndex === -1 || currentIndex === CEFR_LEVELS.length - 1) {
    return null;
  }
  return CEFR_LEVELS[currentIndex + 1].code;
}

export function getPreviousLevel(currentLevel: FullCEFRLevel): FullCEFRLevel | null {
  const currentIndex = CEFR_LEVELS.findIndex((level) => level.code === currentLevel);
  if (currentIndex === -1 || currentIndex === 0) {
    return null;
  }
  return CEFR_LEVELS[currentIndex - 1].code;
}

export function calculateProgress(currentLevel: FullCEFRLevel): {
  percentage: number;
  currentIndex: number;
  totalLevels: number;
} {
  const currentIndex = CEFR_LEVELS.findIndex((level) => level.code === currentLevel);
  return {
    percentage: ((currentIndex + 1) / CEFR_LEVELS.length) * 100,
    currentIndex: currentIndex + 1,
    totalLevels: CEFR_LEVELS.length,
  };
}

export function estimateTimeToNextLevel(currentLevel: FullCEFRLevel): number {
  const current = getCEFRLevel(currentLevel);
  const next = getNextLevel(currentLevel);

  if (!current || !next) {
    return 0;
  }

  const nextDef = getCEFRLevel(next);
  if (!nextDef) {
    return 0;
  }

  return nextDef.estimatedHours - current.estimatedHours;
}

// Determine CEFR level from test score (returns full level for display)
export function determineCEFRLevel(score: number): FullCEFRLevel {
  // Map 0-100 score to 6 levels
  if (score < 16.67) return 'A1';
  if (score < 33.33) return 'A2';
  if (score < 50) return 'B1';
  if (score < 66.67) return 'B2';
  if (score < 83.33) return 'C1';
  return 'C2';
}

// Determine supported app level (A1-B2 only)
export function determineAppLevel(score: number): CEFRLevel {
  // Map 0-100 score to 4 supported levels
  if (score < 25) return 'A1';
  if (score < 50) return 'A2';
  if (score < 75) return 'B1';
  return 'B2';
}

// Recommended study time per level
export function getRecommendedStudyTime(level: FullCEFRLevel): {
  hoursPerWeek: number;
  weeksToNextLevel: number;
  totalHours: number;
} {
  const estimatedHours = estimateTimeToNextLevel(level);

  return {
    hoursPerWeek: 10, // Recommended 10 hours per week
    weeksToNextLevel: Math.ceil(estimatedHours / 10),
    totalHours: estimatedHours,
  };
}

// Get level color
export function getLevelColor(level: FullCEFRLevel): string {
  const def = getCEFRLevel(level);
  return def?.color || '#6b7280';
}

// Get level display name
export function getLevelDisplayName(level: FullCEFRLevel): string {
  const def = getCEFRLevel(level);
  return def ? `${def.code} - ${def.koreanName}` : level;
}

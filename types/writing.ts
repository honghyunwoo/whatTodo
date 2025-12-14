/**
 * Writing Service Types
 * Types for AI-powered writing evaluation
 */

import type { CEFRLevel } from '@/types/activity';

// Writing evaluation result
export interface WritingEvaluation {
  overallScore: number; // 0-100

  categories: {
    content: CategoryScore;
    grammar: CategoryScore;
    vocabulary: CategoryScore;
    organization: CategoryScore;
  };

  corrections: Correction[];
  suggestions: string[];
  correctedText: string;

  strengths: string[];
  improvements: string[];

  wordCount: number;
  sentenceCount: number;
  averageSentenceLength: number;
}

// Category score breakdown
export interface CategoryScore {
  score: number; // 0-100
  feedback: string; // Feedback in Korean
  issues: string[]; // List of issues found
}

// Text correction
export interface Correction {
  original: string; // Original text
  corrected: string; // Corrected text
  explanation: string; // Explanation in Korean
  type: CorrectionType;
  position: TextPosition;
}

export type CorrectionType = 'grammar' | 'vocabulary' | 'spelling' | 'style' | 'punctuation';

export interface TextPosition {
  start: number;
  end: number;
}

// Writing prompt for exercises
export interface WritingPrompt {
  id: string;
  type: WritingType;
  level: CEFRLevel;

  topic: string;
  scenario: string;
  requirements: string[];

  wordCount: {
    min: number;
    max: number;
  };
  timeLimit?: number; // minutes

  hints?: WritingHint;
  sampleAnswer?: SampleAnswer;
}

export type WritingType = 'email' | 'essay' | 'story' | 'description' | 'letter' | 'report';

// Writing hints/helpers
export interface WritingHint {
  structure?: {
    opening: string[];
    body: string[];
    closing: string[];
  };

  usefulExpressions?: {
    phrase: string;
    example: string;
  }[];

  connectors?: {
    addition: string[];
    contrast: string[];
    reason: string[];
    sequence: string[];
  };

  vocabulary?: string[];
}

// Sample answer for reference
export interface SampleAnswer {
  text: string;
  annotations?: Annotation[];
}

export interface Annotation {
  range: [number, number]; // Start and end positions
  comment: string;
  type: 'structure' | 'vocabulary' | 'grammar' | 'style';
}

// Evaluation rubric
export interface EvaluationRubric {
  content: RubricCategory;
  grammar: RubricCategory;
  vocabulary: RubricCategory;
  organization: RubricCategory;
}

export interface RubricCategory {
  weight: number; // 0-1, sum should be 1
  criteria: string[];
  levels: {
    excellent: string; // 90-100
    good: string; // 70-89
    fair: string; // 50-69
    poor: string; // 0-49
  };
}

// Writing session
export interface WritingSession {
  id: string;
  promptId: string;
  startTime: string;
  endTime?: string;
  drafts: WritingDraft[];
  finalSubmission?: WritingSubmission;
}

export interface WritingDraft {
  id: string;
  content: string;
  savedAt: string;
}

export interface WritingSubmission {
  content: string;
  submittedAt: string;
  evaluation?: WritingEvaluation;
}

/**
 * Writing Service
 * Rule-based writing evaluation (NO API REQUIRED)
 * Uses local analysis: word count, keywords, sentence structure
 * NO EMOJI - uses icons only
 */

import type { CEFRLevel } from '@/types/activity';
import type {
  CategoryScore,
  WritingEvaluation,
  WritingPrompt,
} from '@/types/writing';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface RuleBasedEvaluation {
  wordCount: number;
  isWordCountValid: boolean;
  wordCountScore: number;
  keywordsFound: string[];
  keywordsMissing: string[];
  keywordScore: number;
  sentenceCount: number;
  avgSentenceLength: number;
  hasOpening: boolean;
  hasClosing: boolean;
  structureScore: number;
  overallScore: number;
}

export interface SelfCheckItem {
  id: string;
  label: string;
  category: 'content' | 'grammar' | 'vocabulary' | 'organization';
  checked: boolean;
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

// Level-specific expectations
const LEVEL_EXPECTATIONS: Record<CEFRLevel, { minWords: number; maxWords: number; complexity: string }> = {
  A1: { minWords: 30, maxWords: 80, complexity: 'simple sentences, basic vocabulary' },
  A2: { minWords: 50, maxWords: 120, complexity: 'compound sentences, everyday vocabulary' },
  B1: { minWords: 80, maxWords: 180, complexity: 'complex sentences, varied vocabulary' },
  B2: { minWords: 120, maxWords: 250, complexity: 'sophisticated structures, nuanced vocabulary' },
};

// Common opening phrases
const OPENING_PHRASES = [
  'dear', 'hello', 'hi', 'good morning', 'good afternoon', 'good evening',
  "i'm writing", 'i am writing', 'thank you for', 'i hope', 'i would like',
  'to whom it may concern', 'greetings',
];

// Common closing phrases
const CLOSING_PHRASES = [
  'sincerely', 'regards', 'best regards', 'kind regards', 'yours truly',
  'thank you', 'thanks', 'looking forward', 'please let me know',
  'best wishes', 'take care', 'see you', 'talk to you soon',
];

// Self-check items by category
const SELF_CHECK_ITEMS: SelfCheckItem[] = [
  // Content
  { id: 'req_all', label: '모든 요구사항을 포함했나요?', category: 'content', checked: false },
  { id: 'req_topic', label: '주제에 맞게 작성했나요?', category: 'content', checked: false },
  { id: 'req_clear', label: '내용이 명확하게 전달되나요?', category: 'content', checked: false },
  // Grammar
  { id: 'gram_tense', label: '시제를 올바르게 사용했나요?', category: 'grammar', checked: false },
  { id: 'gram_subject', label: '주어-동사 일치가 맞나요?', category: 'grammar', checked: false },
  { id: 'gram_article', label: '관사(a/an/the)를 올바르게 사용했나요?', category: 'grammar', checked: false },
  // Vocabulary
  { id: 'vocab_varied', label: '다양한 어휘를 사용했나요?', category: 'vocabulary', checked: false },
  { id: 'vocab_appropriate', label: '상황에 적절한 표현을 사용했나요?', category: 'vocabulary', checked: false },
  // Organization
  { id: 'org_opening', label: '적절한 시작 인사가 있나요?', category: 'organization', checked: false },
  { id: 'org_closing', label: '적절한 마무리가 있나요?', category: 'organization', checked: false },
  { id: 'org_flow', label: '문장들이 자연스럽게 연결되나요?', category: 'organization', checked: false },
];

// ─────────────────────────────────────
// Writing Service Class
// ─────────────────────────────────────

class WritingService {
  // ─────────────────────────────────────
  // Rule-based Evaluation (No API)
  // ─────────────────────────────────────

  /**
   * Evaluate writing using rule-based analysis (no API required)
   */
  evaluateWithRules(text: string, prompt: WritingPrompt): RuleBasedEvaluation {
    const wordCount = this.countWords(text);
    const sentences = this.getSentences(text);
    const sentenceCount = sentences.length;
    const avgSentenceLength = wordCount / Math.max(1, sentenceCount);

    // Word count evaluation
    const { min, max } = prompt.wordCount;
    const isWordCountValid = wordCount >= min && wordCount <= max;
    const wordCountScore = this.calculateWordCountScore(wordCount, min, max);

    // Keyword analysis
    const keywords = this.extractKeywordsFromRequirements(prompt.requirements);
    const { found, missing } = this.checkKeywords(text, keywords);
    const keywordScore = keywords.length > 0
      ? Math.round((found.length / keywords.length) * 100)
      : 100;

    // Structure analysis
    const hasOpening = this.hasOpeningPhrase(text);
    const hasClosing = this.hasClosingPhrase(text);
    const structureScore = this.calculateStructureScore(hasOpening, hasClosing, sentenceCount);

    // Overall score (weighted average)
    const overallScore = Math.round(
      wordCountScore * 0.2 +
      keywordScore * 0.4 +
      structureScore * 0.4
    );

    return {
      wordCount,
      isWordCountValid,
      wordCountScore,
      keywordsFound: found,
      keywordsMissing: missing,
      keywordScore,
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      hasOpening,
      hasClosing,
      structureScore,
      overallScore,
    };
  }

  /**
   * Get full evaluation with self-check support
   */
  getFullEvaluation(
    text: string,
    prompt: WritingPrompt,
    selfCheckResults?: Record<string, boolean>
  ): WritingEvaluation {
    const ruleEval = this.evaluateWithRules(text, prompt);

    // Calculate category scores based on rule evaluation
    const categories = {
      content: this.calculateContentScore(ruleEval, selfCheckResults),
      grammar: this.calculateGrammarScore(text, selfCheckResults),
      vocabulary: this.calculateVocabularyScore(text, prompt.level, selfCheckResults),
      organization: this.calculateOrganizationScore(ruleEval, selfCheckResults),
    };

    // Calculate overall score
    const overallScore = selfCheckResults
      ? this.calculateSelfCheckScore(categories)
      : ruleEval.overallScore;

    return {
      overallScore,
      categories,
      corrections: [], // No automatic corrections without API
      suggestions: this.generateSuggestions(ruleEval),
      correctedText: text, // No automatic correction
      strengths: this.identifyStrengths(ruleEval),
      improvements: this.identifyImprovements(ruleEval),
      wordCount: ruleEval.wordCount,
      sentenceCount: ruleEval.sentenceCount,
      averageSentenceLength: ruleEval.avgSentenceLength,
    };
  }

  // ─────────────────────────────────────
  // Text Analysis Methods
  // ─────────────────────────────────────

  /**
   * Count words in text
   */
  private countWords(text: string): number {
    return text
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length;
  }

  /**
   * Get sentences from text
   */
  private getSentences(text: string): string[] {
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }

  /**
   * Extract keywords from requirements
   */
  private extractKeywordsFromRequirements(requirements: string[]): string[] {
    const keywords: string[] = [];

    requirements.forEach((req) => {
      // Extract key nouns/verbs from requirement
      const words = req.toLowerCase()
        .replace(/[.,!?;:'"()]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 3); // Skip short words

      // Common action words to look for
      const actionWords = ['mention', 'include', 'describe', 'explain', 'suggest', 'ask', 'greet', 'propose'];
      const contentWords = words.filter((w) => !actionWords.includes(w));

      keywords.push(...contentWords);
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Check if keywords are present in text
   */
  private checkKeywords(text: string, keywords: string[]): { found: string[]; missing: string[] } {
    const lowerText = text.toLowerCase();
    const found: string[] = [];
    const missing: string[] = [];

    keywords.forEach((keyword) => {
      if (lowerText.includes(keyword.toLowerCase())) {
        found.push(keyword);
      } else {
        missing.push(keyword);
      }
    });

    return { found, missing };
  }

  /**
   * Check if text has opening phrase
   */
  private hasOpeningPhrase(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    return OPENING_PHRASES.some((phrase) => lowerText.startsWith(phrase));
  }

  /**
   * Check if text has closing phrase
   */
  private hasClosingPhrase(text: string): boolean {
    const lowerText = text.toLowerCase().trim();
    return CLOSING_PHRASES.some((phrase) => lowerText.includes(phrase));
  }

  // ─────────────────────────────────────
  // Score Calculation Methods
  // ─────────────────────────────────────

  /**
   * Calculate word count score
   */
  private calculateWordCountScore(wordCount: number, min: number, max: number): number {
    if (wordCount >= min && wordCount <= max) {
      return 100;
    }
    if (wordCount < min) {
      // Penalty for being under minimum
      const deficit = min - wordCount;
      const penalty = Math.min(deficit * 2, 50);
      return Math.max(50, 100 - penalty);
    }
    // Penalty for exceeding maximum
    const excess = wordCount - max;
    const penalty = Math.min(excess, 30);
    return Math.max(70, 100 - penalty);
  }

  /**
   * Calculate structure score
   */
  private calculateStructureScore(hasOpening: boolean, hasClosing: boolean, sentenceCount: number): number {
    let score = 60; // Base score

    if (hasOpening) score += 15;
    if (hasClosing) score += 15;

    // Bonus for having multiple sentences
    if (sentenceCount >= 3) score += 5;
    if (sentenceCount >= 5) score += 5;

    return Math.min(100, score);
  }

  /**
   * Calculate content category score
   */
  private calculateContentScore(
    ruleEval: RuleBasedEvaluation,
    selfCheck?: Record<string, boolean>
  ): CategoryScore {
    let score = ruleEval.keywordScore;

    // Apply self-check adjustments
    if (selfCheck) {
      const contentChecks = ['req_all', 'req_topic', 'req_clear'];
      const checkedCount = contentChecks.filter((id) => selfCheck[id]).length;
      score = Math.round((score + checkedCount * 33) / 2);
    }

    const feedback = score >= 80
      ? '요구사항을 잘 반영했습니다.'
      : score >= 60
      ? '일부 요구사항이 누락되었을 수 있습니다.'
      : '요구사항을 다시 확인해보세요.';

    return {
      score: Math.min(100, score),
      feedback,
      issues: ruleEval.keywordsMissing.length > 0
        ? [`누락된 키워드: ${ruleEval.keywordsMissing.join(', ')}`]
        : [],
    };
  }

  /**
   * Calculate grammar category score (basic heuristics)
   */
  private calculateGrammarScore(
    text: string,
    selfCheck?: Record<string, boolean>
  ): CategoryScore {
    let score = 70; // Base score

    // Basic checks
    const sentences = this.getSentences(text);
    const hasCapitalStart = sentences.every((s) => /^[A-Z]/.test(s));
    const hasProperEnding = sentences.length > 0 && /[.!?]$/.test(text.trim());

    if (hasCapitalStart) score += 10;
    if (hasProperEnding) score += 10;

    // Apply self-check adjustments
    if (selfCheck) {
      const grammarChecks = ['gram_tense', 'gram_subject', 'gram_article'];
      const checkedCount = grammarChecks.filter((id) => selfCheck[id]).length;
      score = Math.round((score + checkedCount * 33) / 2);
    }

    const feedback = score >= 80
      ? '문법적으로 잘 작성되었습니다.'
      : score >= 60
      ? '일부 문법 오류가 있을 수 있습니다.'
      : '문법을 다시 확인해보세요.';

    const issues: string[] = [];
    if (!hasCapitalStart) issues.push('문장 시작은 대문자로');
    if (!hasProperEnding) issues.push('문장 끝에 마침표 필요');

    return {
      score: Math.min(100, score),
      feedback,
      issues,
    };
  }

  /**
   * Calculate vocabulary category score
   */
  private calculateVocabularyScore(
    text: string,
    level: CEFRLevel,
    selfCheck?: Record<string, boolean>
  ): CategoryScore {
    const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
    const uniqueWords = new Set(words);
    const vocabularyRatio = uniqueWords.size / Math.max(1, words.length);

    // Score based on vocabulary diversity
    let score = Math.round(vocabularyRatio * 100);

    // Level-based adjustment
    const levelBonus: Record<CEFRLevel, number> = { A1: 20, A2: 15, B1: 10, B2: 5 };
    score += levelBonus[level] || 0;

    // Apply self-check adjustments
    if (selfCheck) {
      const vocabChecks = ['vocab_varied', 'vocab_appropriate'];
      const checkedCount = vocabChecks.filter((id) => selfCheck[id]).length;
      score = Math.round((score + checkedCount * 50) / 2);
    }

    const feedback = score >= 80
      ? '다양한 어휘를 사용했습니다.'
      : score >= 60
      ? '어휘를 더 다양하게 사용해보세요.'
      : '기본 어휘 연습이 필요합니다.';

    return {
      score: Math.min(100, score),
      feedback,
      issues: vocabularyRatio < 0.5 ? ['단어 반복이 많습니다'] : [],
    };
  }

  /**
   * Calculate organization category score
   */
  private calculateOrganizationScore(
    ruleEval: RuleBasedEvaluation,
    selfCheck?: Record<string, boolean>
  ): CategoryScore {
    let score = ruleEval.structureScore;

    // Apply self-check adjustments
    if (selfCheck) {
      const orgChecks = ['org_opening', 'org_closing', 'org_flow'];
      const checkedCount = orgChecks.filter((id) => selfCheck[id]).length;
      score = Math.round((score + checkedCount * 33) / 2);
    }

    const feedback = score >= 80
      ? '글의 구조가 잘 잡혀있습니다.'
      : score >= 60
      ? '시작과 마무리를 개선해보세요.'
      : '글의 구조를 다시 생각해보세요.';

    const issues: string[] = [];
    if (!ruleEval.hasOpening) issues.push('시작 인사가 없습니다');
    if (!ruleEval.hasClosing) issues.push('마무리 인사가 없습니다');

    return {
      score: Math.min(100, score),
      feedback,
      issues,
    };
  }

  /**
   * Calculate overall score from self-check
   */
  private calculateSelfCheckScore(categories: WritingEvaluation['categories']): number {
    return Math.round(
      categories.content.score * 0.3 +
      categories.grammar.score * 0.25 +
      categories.vocabulary.score * 0.25 +
      categories.organization.score * 0.2
    );
  }

  // ─────────────────────────────────────
  // Feedback Generation
  // ─────────────────────────────────────

  /**
   * Generate improvement suggestions
   */
  private generateSuggestions(ruleEval: RuleBasedEvaluation): string[] {
    const suggestions: string[] = [];

    if (!ruleEval.isWordCountValid) {
      if (ruleEval.wordCount < ruleEval.wordCountScore) {
        suggestions.push('글을 더 길게 작성해보세요.');
      } else {
        suggestions.push('글을 더 간결하게 작성해보세요.');
      }
    }

    if (!ruleEval.hasOpening) {
      suggestions.push('적절한 시작 인사를 추가해보세요. (예: Dear..., Hello...)');
    }

    if (!ruleEval.hasClosing) {
      suggestions.push('적절한 마무리 인사를 추가해보세요. (예: Best regards, Thank you)');
    }

    if (ruleEval.keywordsMissing.length > 0) {
      suggestions.push('요구사항에 맞는 내용을 더 추가해보세요.');
    }

    return suggestions;
  }

  /**
   * Identify strengths
   */
  private identifyStrengths(ruleEval: RuleBasedEvaluation): string[] {
    const strengths: string[] = [];

    if (ruleEval.isWordCountValid) {
      strengths.push('적절한 분량으로 작성했습니다.');
    }

    if (ruleEval.hasOpening) {
      strengths.push('좋은 시작 인사가 있습니다.');
    }

    if (ruleEval.hasClosing) {
      strengths.push('적절한 마무리가 있습니다.');
    }

    if (ruleEval.keywordScore >= 80) {
      strengths.push('요구사항을 잘 반영했습니다.');
    }

    if (strengths.length === 0) {
      strengths.push('작문 연습을 시작한 것이 좋습니다!');
    }

    return strengths;
  }

  /**
   * Identify areas for improvement
   */
  private identifyImprovements(ruleEval: RuleBasedEvaluation): string[] {
    const improvements: string[] = [];

    if (!ruleEval.isWordCountValid) {
      improvements.push('요구되는 단어 수에 맞춰 작성해보세요.');
    }

    if (!ruleEval.hasOpening) {
      improvements.push('시작 인사를 추가하면 더 좋습니다.');
    }

    if (!ruleEval.hasClosing) {
      improvements.push('마무리 인사를 추가하면 더 좋습니다.');
    }

    if (ruleEval.keywordsMissing.length > 0) {
      improvements.push('누락된 요구사항을 추가해보세요.');
    }

    return improvements;
  }

  // ─────────────────────────────────────
  // Public Helper Methods
  // ─────────────────────────────────────

  /**
   * Get self-check items
   */
  getSelfCheckItems(): SelfCheckItem[] {
    return SELF_CHECK_ITEMS.map((item) => ({ ...item }));
  }

  /**
   * Get feedback based on overall score
   */
  getScoreMessage(score: number): string {
    if (score >= 90) return '훌륭합니다!';
    if (score >= 80) return '잘 했습니다!';
    if (score >= 70) return '좋습니다!';
    if (score >= 60) return '괜찮습니다.';
    if (score >= 50) return '더 연습이 필요합니다.';
    return '기초부터 다시 연습해 보세요.';
  }

  /**
   * Get score color for UI
   */
  getScoreColor(score: number): string {
    if (score >= 90) return '#22c55e'; // Green
    if (score >= 80) return '#3b82f6'; // Blue
    if (score >= 70) return '#f59e0b'; // Amber
    if (score >= 60) return '#f97316'; // Orange
    return '#ef4444'; // Red
  }

  /**
   * Get level expectations
   */
  getLevelExpectations(level: CEFRLevel): { minWords: number; maxWords: number; complexity: string } {
    return LEVEL_EXPECTATIONS[level];
  }

  /**
   * Create a sample prompt for testing
   */
  createSamplePrompt(level: CEFRLevel): WritingPrompt {
    const expectations = LEVEL_EXPECTATIONS[level];

    return {
      id: `sample-${level}`,
      type: 'email',
      level,
      topic: 'Write an email to a friend',
      scenario: 'You want to invite a friend to have dinner together this weekend.',
      requirements: [
        'Greet your friend',
        'Suggest a day and time',
        'Propose a restaurant or place',
        'Ask for their reply',
      ],
      wordCount: {
        min: expectations.minWords,
        max: expectations.maxWords,
      },
      timeLimit: 15,
    };
  }
}

// ─────────────────────────────────────
// Singleton Instance
// ─────────────────────────────────────

const writingService = new WritingService();

export default writingService;
export { WritingService, SELF_CHECK_ITEMS };

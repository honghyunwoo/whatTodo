/**
 * Spine Loader Service
 *
 * 스파인 기반 핵심 콘텐츠 로딩 서비스
 * - 기능 언어 (functions)
 * - 핵심 문법 (grammar)
 * - 어휘 덩어리 (lexis)
 * - 발음 포인트 (pronunciation)
 */

import type { CEFRLevel } from '@/types/contentPack';

// ─────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────

export interface FunctionExpression {
  en: string;
  ko: string;
  formality: 'formal' | 'neutral' | 'informal';
}

export interface LanguageFunction {
  id: string;
  name: string;
  nameKo: string;
  canDo: string;
  expressions: FunctionExpression[];
  contexts: string[];
}

export interface FunctionsData {
  level: CEFRLevel;
  version: string;
  description: string;
  functions: LanguageFunction[];
}

export interface GrammarExample {
  en: string;
  ko: string;
}

export interface GrammarError {
  wrong: string;
  correct: string;
  reason: string;
}

export interface GrammarPoint {
  id: string;
  name: string;
  nameKo: string;
  priority: number;
  explanation: string;
  explanationKo: string;
  forms: Record<string, string>;
  examples: GrammarExample[];
  koreanTip: string;
  commonErrors: GrammarError[];
  relatedPacks: string[];
}

export interface GrammarData {
  level: CEFRLevel;
  version: string;
  description: string;
  grammarPoints: GrammarPoint[];
}

export interface LexisItem {
  en: string;
  ko: string;
  example: string;
}

export interface LexisChunk {
  id: string;
  category: string;
  categoryKo: string;
  items: LexisItem[];
}

export interface Collocation {
  id: string;
  verb: string;
  combinations: { phrase: string; ko: string }[];
}

export interface LexisData {
  level: CEFRLevel;
  version: string;
  description: string;
  chunks: LexisChunk[];
  collocations: Collocation[];
}

export interface MinimalPair {
  word1: string;
  word2: string;
  ipa1: string;
  ipa2: string;
}

export interface PronunciationFocus {
  id: string;
  category: string;
  categoryKo: string;
  title: string;
  titleKo: string;
  difficulty: 'low' | 'medium' | 'high';
  explanation: string;
  tips: string[];
  minimalPairs?: MinimalPair[];
  examples?: {
    word?: string;
    sentence?: string;
    pronunciation?: string;
    pattern?: string;
    type?: string;
    note?: string;
  }[];
  practiceWords?: string[];
  commonErrors?: { wrong: string; correct: string; word: string }[];
}

export interface PronunciationData {
  version: string;
  description: string;
  targetLearners: string;
  focusAreas: PronunciationFocus[];
}

// ─────────────────────────────────────
// Spine Content Loaders (require-based)
// ─────────────────────────────────────

// Functions
const FUNCTION_MODULES: Partial<Record<CEFRLevel, () => FunctionsData>> = {
  A1: () => require('@/data/spine/functions/a1-functions.json'),
};

// Grammar
const GRAMMAR_MODULES: Partial<Record<CEFRLevel, () => GrammarData>> = {
  A1: () => require('@/data/spine/grammar/a1-grammar.json'),
};

// Lexis
const LEXIS_MODULES: Partial<Record<CEFRLevel, () => LexisData>> = {
  A1: () => require('@/data/spine/lexis/a1-lexis.json'),
};

// Pronunciation
const PRONUNCIATION_MODULES: Record<string, () => PronunciationData> = {
  korean: () => require('@/data/spine/pronunciation/korean-focus.json'),
};

// ─────────────────────────────────────
// Spine Loader API
// ─────────────────────────────────────

export const spineLoader = {
  /**
   * 사용 가능한 레벨 목록
   */
  getAvailableLevels(): {
    functions: CEFRLevel[];
    grammar: CEFRLevel[];
    lexis: CEFRLevel[];
  } {
    return {
      functions: Object.keys(FUNCTION_MODULES) as CEFRLevel[],
      grammar: Object.keys(GRAMMAR_MODULES) as CEFRLevel[],
      lexis: Object.keys(LEXIS_MODULES) as CEFRLevel[],
    };
  },

  // ─────────────────────────────────────
  // Functions (기능 언어)
  // ─────────────────────────────────────

  /**
   * 레벨별 기능 언어 로드
   */
  loadFunctions(level: CEFRLevel): FunctionsData | null {
    const loader = FUNCTION_MODULES[level];
    return loader ? loader() : null;
  },

  /**
   * 특정 기능 찾기
   */
  getFunction(level: CEFRLevel, functionName: string): LanguageFunction | null {
    const data = this.loadFunctions(level);
    if (!data) return null;
    return data.functions.find((f) => f.name === functionName) || null;
  },

  /**
   * 컨텍스트로 기능 검색
   */
  getFunctionsByContext(level: CEFRLevel, context: string): LanguageFunction[] {
    const data = this.loadFunctions(level);
    if (!data) return [];
    return data.functions.filter((f) =>
      f.contexts.some((c) => c.toLowerCase().includes(context.toLowerCase()))
    );
  },

  // ─────────────────────────────────────
  // Grammar (핵심 문법)
  // ─────────────────────────────────────

  /**
   * 레벨별 문법 로드
   */
  loadGrammar(level: CEFRLevel): GrammarData | null {
    const loader = GRAMMAR_MODULES[level];
    return loader ? loader() : null;
  },

  /**
   * 특정 문법 포인트 찾기
   */
  getGrammarPoint(level: CEFRLevel, grammarName: string): GrammarPoint | null {
    const data = this.loadGrammar(level);
    if (!data) return null;
    return data.grammarPoints.find((g) => g.name === grammarName) || null;
  },

  /**
   * 우선순위별 문법 포인트 정렬
   */
  getGrammarByPriority(level: CEFRLevel): GrammarPoint[] {
    const data = this.loadGrammar(level);
    if (!data) return [];
    return [...data.grammarPoints].sort((a, b) => a.priority - b.priority);
  },

  /**
   * 관련 팩으로 문법 검색
   */
  getGrammarByPack(level: CEFRLevel, packId: string): GrammarPoint[] {
    const data = this.loadGrammar(level);
    if (!data) return [];
    return data.grammarPoints.filter((g) => g.relatedPacks.includes(packId));
  },

  // ─────────────────────────────────────
  // Lexis (어휘 덩어리)
  // ─────────────────────────────────────

  /**
   * 레벨별 어휘 덩어리 로드
   */
  loadLexis(level: CEFRLevel): LexisData | null {
    const loader = LEXIS_MODULES[level];
    return loader ? loader() : null;
  },

  /**
   * 카테고리별 덩어리 조회
   */
  getChunksByCategory(level: CEFRLevel, category: string): LexisChunk | null {
    const data = this.loadLexis(level);
    if (!data) return null;
    return data.chunks.find((c) => c.category === category) || null;
  },

  /**
   * 동사별 연어 조회
   */
  getCollocations(level: CEFRLevel, verb: string): Collocation | null {
    const data = this.loadLexis(level);
    if (!data) return null;
    return data.collocations.find((c) => c.verb === verb) || null;
  },

  /**
   * 모든 카테고리 목록
   */
  getChunkCategories(level: CEFRLevel): string[] {
    const data = this.loadLexis(level);
    if (!data) return [];
    return data.chunks.map((c) => c.category);
  },

  // ─────────────────────────────────────
  // Pronunciation (발음)
  // ─────────────────────────────────────

  /**
   * 대상 언어별 발음 포인트 로드
   */
  loadPronunciation(targetLanguage: string = 'korean'): PronunciationData | null {
    const loader = PRONUNCIATION_MODULES[targetLanguage];
    return loader ? loader() : null;
  },

  /**
   * 카테고리별 발음 포인트
   */
  getPronunciationByCategory(
    category: string,
    targetLanguage: string = 'korean'
  ): PronunciationFocus[] {
    const data = this.loadPronunciation(targetLanguage);
    if (!data) return [];
    return data.focusAreas.filter((f) => f.category === category);
  },

  /**
   * 난이도별 발음 포인트
   */
  getPronunciationByDifficulty(
    difficulty: 'low' | 'medium' | 'high',
    targetLanguage: string = 'korean'
  ): PronunciationFocus[] {
    const data = this.loadPronunciation(targetLanguage);
    if (!data) return [];
    return data.focusAreas.filter((f) => f.difficulty === difficulty);
  },

  // ─────────────────────────────────────
  // 통합 검색
  // ─────────────────────────────────────

  /**
   * 통합 통계
   */
  getStats(): {
    functions: { total: number; byLevel: Partial<Record<CEFRLevel, number>> };
    grammar: { total: number; byLevel: Partial<Record<CEFRLevel, number>> };
    lexis: { total: number; byLevel: Partial<Record<CEFRLevel, number>> };
    pronunciation: { total: number };
  } {
    const funcStats: Partial<Record<CEFRLevel, number>> = {};
    const gramStats: Partial<Record<CEFRLevel, number>> = {};
    const lexStats: Partial<Record<CEFRLevel, number>> = {};

    let funcTotal = 0;
    let gramTotal = 0;
    let lexTotal = 0;

    for (const level of Object.keys(FUNCTION_MODULES) as CEFRLevel[]) {
      const data = this.loadFunctions(level);
      if (data) {
        funcStats[level] = data.functions.length;
        funcTotal += data.functions.length;
      }
    }

    for (const level of Object.keys(GRAMMAR_MODULES) as CEFRLevel[]) {
      const data = this.loadGrammar(level);
      if (data) {
        gramStats[level] = data.grammarPoints.length;
        gramTotal += data.grammarPoints.length;
      }
    }

    for (const level of Object.keys(LEXIS_MODULES) as CEFRLevel[]) {
      const data = this.loadLexis(level);
      if (data) {
        lexStats[level] = data.chunks.length + data.collocations.length;
        lexTotal += data.chunks.length + data.collocations.length;
      }
    }

    const pronData = this.loadPronunciation('korean');
    const pronTotal = pronData?.focusAreas.length || 0;

    return {
      functions: { total: funcTotal, byLevel: funcStats },
      grammar: { total: gramTotal, byLevel: gramStats },
      lexis: { total: lexTotal, byLevel: lexStats },
      pronunciation: { total: pronTotal },
    };
  },
};

export default spineLoader;

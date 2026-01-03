/**
 * Spine Loader Tests
 *
 * @created 2026-01-03 - Spine A2-C2 콘텐츠 확장 검증
 *
 * Tests for the spine content loader service.
 * Validates all CEFR levels (A1-C2) load correctly.
 */

import { spineLoader } from '@/services/spineLoader';
import type { CEFRLevel } from '@/types/contentPack';

const ALL_LEVELS: CEFRLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

describe('spineLoader', () => {
  describe('getAvailableLevels', () => {
    it('모든 CEFR 레벨 (A1-C2)이 사용 가능해야 함', () => {
      const levels = spineLoader.getAvailableLevels();

      expect(levels.functions).toEqual(ALL_LEVELS);
      expect(levels.grammar).toEqual(ALL_LEVELS);
      expect(levels.lexis).toEqual(ALL_LEVELS);
    });
  });

  describe('loadFunctions', () => {
    it.each(ALL_LEVELS)('%s 레벨 기능 언어를 로드해야 함', (level) => {
      const data = spineLoader.loadFunctions(level);

      expect(data).not.toBeNull();
      expect(data!.level).toBe(level);
      expect(data!.functions).toBeDefined();
      expect(Array.isArray(data!.functions)).toBe(true);
      expect(data!.functions.length).toBeGreaterThan(0);
    });

    it('각 기능에 필수 필드가 있어야 함', () => {
      const data = spineLoader.loadFunctions('A1');
      const func = data!.functions[0];

      expect(func.id).toBeDefined();
      expect(func.name).toBeDefined();
      expect(func.nameKo).toBeDefined();
      expect(func.canDo).toBeDefined();
      expect(func.expressions).toBeDefined();
      expect(Array.isArray(func.expressions)).toBe(true);
    });

    it('존재하지 않는 레벨은 null 반환', () => {
      const data = spineLoader.loadFunctions('X1' as CEFRLevel);
      expect(data).toBeNull();
    });
  });

  describe('loadGrammar', () => {
    it.each(ALL_LEVELS)('%s 레벨 문법을 로드해야 함', (level) => {
      const data = spineLoader.loadGrammar(level);

      expect(data).not.toBeNull();
      expect(data!.level).toBe(level);
      expect(data!.grammarPoints).toBeDefined();
      expect(Array.isArray(data!.grammarPoints)).toBe(true);
      expect(data!.grammarPoints.length).toBeGreaterThan(0);
    });

    it('각 문법 포인트에 필수 필드가 있어야 함', () => {
      const data = spineLoader.loadGrammar('A1');
      const grammar = data!.grammarPoints[0];

      expect(grammar.id).toBeDefined();
      expect(grammar.name).toBeDefined();
      expect(grammar.nameKo).toBeDefined();
      expect(grammar.explanation).toBeDefined();
      expect(grammar.examples).toBeDefined();
      expect(Array.isArray(grammar.examples)).toBe(true);
    });
  });

  describe('loadLexis', () => {
    it.each(ALL_LEVELS)('%s 레벨 어휘를 로드해야 함', (level) => {
      const data = spineLoader.loadLexis(level);

      expect(data).not.toBeNull();
      expect(data!.level).toBe(level);
      expect(data!.chunks).toBeDefined();
      expect(Array.isArray(data!.chunks)).toBe(true);
      expect(data!.chunks.length).toBeGreaterThan(0);
    });

    it('각 어휘 덩어리에 필수 필드가 있어야 함', () => {
      const data = spineLoader.loadLexis('A1');
      const chunk = data!.chunks[0];

      expect(chunk.id).toBeDefined();
      expect(chunk.category).toBeDefined();
      expect(chunk.categoryKo).toBeDefined();
      expect(chunk.items).toBeDefined();
      expect(Array.isArray(chunk.items)).toBe(true);
    });

    it('연어(collocations)가 있어야 함', () => {
      const data = spineLoader.loadLexis('A1');

      expect(data!.collocations).toBeDefined();
      expect(Array.isArray(data!.collocations)).toBe(true);
    });
  });

  describe('loadPronunciation', () => {
    it('한국어 화자용 발음 포인트를 로드해야 함', () => {
      const data = spineLoader.loadPronunciation('korean');

      expect(data).not.toBeNull();
      expect(data!.focusAreas).toBeDefined();
      expect(Array.isArray(data!.focusAreas)).toBe(true);
      expect(data!.focusAreas.length).toBeGreaterThan(0);
    });

    it('존재하지 않는 언어는 null 반환', () => {
      const data = spineLoader.loadPronunciation('japanese');
      expect(data).toBeNull();
    });
  });

  describe('getStats', () => {
    it('통계를 올바르게 계산해야 함', () => {
      const stats = spineLoader.getStats();

      // Functions
      expect(stats.functions.total).toBeGreaterThan(0);
      expect(Object.keys(stats.functions.byLevel).length).toBe(6);

      // Grammar
      expect(stats.grammar.total).toBeGreaterThan(0);
      expect(Object.keys(stats.grammar.byLevel).length).toBe(6);

      // Lexis
      expect(stats.lexis.total).toBeGreaterThan(0);
      expect(Object.keys(stats.lexis.byLevel).length).toBe(6);

      // Pronunciation
      expect(stats.pronunciation.total).toBeGreaterThan(0);
    });

    it('각 레벨당 최소 10개 항목이 있어야 함', () => {
      const stats = spineLoader.getStats();

      for (const level of ALL_LEVELS) {
        expect(stats.functions.byLevel[level]).toBeGreaterThanOrEqual(10);
        expect(stats.grammar.byLevel[level]).toBeGreaterThanOrEqual(10);
      }
    });
  });

  describe('helper methods', () => {
    it('getFunction: 특정 기능을 찾아야 함', () => {
      const func = spineLoader.getFunction('A1', 'greeting');

      expect(func).not.toBeNull();
      expect(func!.name).toBe('greeting');
    });

    it('getGrammarPoint: 특정 문법을 찾아야 함', () => {
      const grammar = spineLoader.getGrammarPoint('A1', 'present_simple');

      expect(grammar).not.toBeNull();
      expect(grammar!.name).toBe('present_simple');
    });

    it('getChunkCategories: 카테고리 목록 반환', () => {
      const categories = spineLoader.getChunkCategories('A1');

      expect(categories.length).toBeGreaterThan(0);
      expect(typeof categories[0]).toBe('string');
    });

    it('getPronunciationByDifficulty: 난이도별 필터링', () => {
      const easy = spineLoader.getPronunciationByDifficulty('low');
      const hard = spineLoader.getPronunciationByDifficulty('high');

      expect(easy.every((p) => p.difficulty === 'low')).toBe(true);
      expect(hard.every((p) => p.difficulty === 'high')).toBe(true);
    });
  });
});

/**
 * Pack Loader Service
 *
 * 팩 기반 콘텐츠 로딩 및 검색 서비스
 * - 인덱스 기반 빠른 검색
 * - RN/Expo 번들링 최적화
 * - Todo 연동 추천
 */

import {
  ContentPack,
  PackIndex,
  ItemsIndex,
  ItemIndexEntry,
  normalizeTag,
  CEFRLevel,
} from '@/types/contentPack';
import type { Task } from '@/types/task';

// ─────────────────────────────────────
// Index Files (빌드 시 자동 생성)
// ─────────────────────────────────────

// 초기 빈 인덱스 (팩 추가 전)
const EMPTY_PACK_INDEX: PackIndex = {
  version: '1.0',
  lastUpdated: new Date().toISOString().split('T')[0],
  total: 0,
  packs: {},
  byLevel: {
    A1: [],
    A2: [],
    B1: [],
    B2: [],
    C1: [],
    C2: [],
  },
  byTopic: {},
  byFunctionId: {},
  byTag: {},
};

const EMPTY_ITEMS_INDEX: ItemsIndex = {
  version: '1.0',
  items: {},
};

// 인덱스 로드 시도 (파일이 없으면 빈 인덱스 사용)
let packIndex: PackIndex = EMPTY_PACK_INDEX;
let itemsIndex: ItemsIndex = EMPTY_ITEMS_INDEX;

// 팩 캐시 (메모리)
const packCache = new Map<string, ContentPack>();

// ─────────────────────────────────────
// RN/Expo 번들링을 위한 팩 매핑
// ─────────────────────────────────────

/**
 * 팩 모듈 매핑 (require 기반)
 * A1 레벨 10개 팩 완성
 */
const PACK_MODULES: Record<string, () => ContentPack> = {
  'pack-000001': () => require('@/data/packs/pack-000001.json'),
  'pack-000002': () => require('@/data/packs/pack-000002.json'),
  'pack-000003': () => require('@/data/packs/pack-000003.json'),
  'pack-000004': () => require('@/data/packs/pack-000004.json'),
  'pack-000005': () => require('@/data/packs/pack-000005.json'),
  'pack-000006': () => require('@/data/packs/pack-000006.json'),
  'pack-000007': () => require('@/data/packs/pack-000007.json'),
  'pack-000008': () => require('@/data/packs/pack-000008.json'),
  'pack-000009': () => require('@/data/packs/pack-000009.json'),
  'pack-000010': () => require('@/data/packs/pack-000010.json'),
};

// ─────────────────────────────────────
// Pack Loader API
// ─────────────────────────────────────

export const packLoader = {
  /**
   * 인덱스 초기화
   * App 시작 시 호출
   */
  async initialize(): Promise<void> {
    try {
      // 동적으로 인덱스 로드 시도
      // 실제 구현에서는 require 또는 fetch 사용
      // packIndex = require('@/data/packs/index.json');
      // itemsIndex = require('@/data/packs/items-index.json');
    } catch {
      // 파일이 없으면 빈 인덱스 사용
      packIndex = EMPTY_PACK_INDEX;
      itemsIndex = EMPTY_ITEMS_INDEX;
    }
  },

  /**
   * 전체 통계
   */
  getStats(): { total: number; byLevel: Record<CEFRLevel, number> } {
    const byLevel = {} as Record<CEFRLevel, number>;
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFRLevel[]) {
      byLevel[level] = packIndex.byLevel[level]?.length || 0;
    }
    return {
      total: packIndex.total,
      byLevel,
    };
  },

  // ─────────────────────────────────────
  // 인덱스 기반 검색
  // ─────────────────────────────────────

  /**
   * 레벨로 팩 검색
   */
  getPacksByLevel(level: CEFRLevel): string[] {
    return packIndex.byLevel[level] || [];
  },

  /**
   * 태그로 팩 검색 (정규화 적용)
   */
  getPacksByTags(tags: string[]): string[] {
    const normalizedTags = tags.map(normalizeTag);
    const results = new Set<string>();

    for (const tag of normalizedTags) {
      const packs = packIndex.byTag[tag] || [];
      packs.forEach((p) => results.add(p));
    }

    return Array.from(results);
  },

  /**
   * 기능 ID로 팩 검색
   */
  getPacksByFunction(functionId: string): string[] {
    return packIndex.byFunctionId[functionId] || [];
  },

  /**
   * 토픽으로 팩 검색
   */
  getPacksByTopic(topic: string): string[] {
    const normalizedTopic = normalizeTag(topic);
    return packIndex.byTopic[normalizedTopic] || [];
  },

  /**
   * 복합 검색 (AND 조건)
   */
  searchPacks(options: {
    level?: CEFRLevel;
    tags?: string[];
    functionId?: string;
    difficulty?: number;
  }): string[] {
    let results: Set<string> | null = null;

    if (options.level) {
      const levelPacks = new Set(this.getPacksByLevel(options.level));
      results = results ? new Set([...results].filter((p) => levelPacks.has(p))) : levelPacks;
    }

    if (options.tags && options.tags.length > 0) {
      const tagPacks = new Set(this.getPacksByTags(options.tags));
      results = results ? new Set([...results].filter((p) => tagPacks.has(p))) : tagPacks;
    }

    if (options.functionId) {
      const funcPacks = new Set(this.getPacksByFunction(options.functionId));
      results = results ? new Set([...results].filter((p) => funcPacks.has(p))) : funcPacks;
    }

    if (options.difficulty && results) {
      results = new Set(
        [...results].filter((p) => packIndex.packs[p]?.difficulty === options.difficulty)
      );
    }

    return results ? Array.from(results) : [];
  },

  // ─────────────────────────────────────
  // 팩 로딩
  // ─────────────────────────────────────

  /**
   * 단일 팩 로딩 (동기, 번들에 포함된 JSON)
   */
  loadPack(packId: string): ContentPack | null {
    // 캐시 확인
    if (packCache.has(packId)) {
      return packCache.get(packId)!;
    }

    // 모듈에서 로드
    const loader = PACK_MODULES[packId];
    if (!loader) {
      return null;
    }

    const pack = loader();
    packCache.set(packId, pack);
    return pack;
  },

  /**
   * 여러 팩 로딩
   */
  loadPacks(packIds: string[]): ContentPack[] {
    return packIds.map((id) => this.loadPack(id)).filter((p): p is ContentPack => p !== null);
  },

  /**
   * 캐시 클리어
   */
  clearCache(): void {
    packCache.clear();
  },

  // ─────────────────────────────────────
  // 아이템 정보 조회 (오답복습/통계용)
  // ─────────────────────────────────────

  /**
   * 아이템 ID로 정보 조회
   */
  getItemInfo(itemId: string): ItemIndexEntry | null {
    return itemsIndex.items[itemId] || null;
  },

  /**
   * 아이템 ID에서 팩 ID 추출
   */
  getPackIdFromItem(itemId: string): string {
    return itemId.split(':')[0];
  },

  /**
   * 같은 타입의 유사 아이템 검색 (오답 생성용)
   */
  getSimilarItems(itemId: string, options?: { sameLevel?: boolean; maxCount?: number }): string[] {
    const item = this.getItemInfo(itemId);
    if (!item) return [];

    const { sameLevel = true, maxCount = 10 } = options || {};
    const results: string[] = [];

    for (const [id, info] of Object.entries(itemsIndex.items)) {
      if (id === itemId) continue;
      if (info.type !== item.type) continue;
      if (sameLevel && info.level !== item.level) continue;

      results.push(id);
      if (results.length >= maxCount) break;
    }

    return results;
  },

  // ─────────────────────────────────────
  // Todo 연동 추천
  // ─────────────────────────────────────

  /**
   * Todo 목록에서 키워드 추출
   */
  extractKeywordsFromTodos(todos: Task[]): string[] {
    const keywords = new Set<string>();

    // 간단한 키워드 추출 (향후 NLP 연동 가능)
    const keywordPatterns = [
      /병원|진료|의사|doctor|hospital|clinic/gi,
      /회의|미팅|meeting|conference/gi,
      /출장|여행|travel|trip/gi,
      /쇼핑|마트|shopping|store/gi,
      /카페|커피|cafe|coffee/gi,
      /식당|레스토랑|restaurant|dining/gi,
      /은행|banking|bank/gi,
      /공항|비행기|airport|flight/gi,
    ];

    for (const todo of todos) {
      const text = todo.title.toLowerCase();
      for (const pattern of keywordPatterns) {
        if (pattern.test(text)) {
          const match = text.match(pattern);
          if (match) {
            keywords.add(normalizeTag(match[0]));
          }
        }
      }
    }

    return Array.from(keywords);
  },

  /**
   * Todo 기반 팩 추천
   */
  recommendPacksFromTodos(todos: Task[], userLevel: CEFRLevel): ContentPack[] {
    const keywords = this.extractKeywordsFromTodos(todos);

    if (keywords.length === 0) {
      // 키워드가 없으면 레벨별 기본 팩 추천
      const levelPacks = this.getPacksByLevel(userLevel);
      return this.loadPacks(levelPacks.slice(0, 3));
    }

    // 키워드로 팩 검색
    const packIds = this.searchPacks({
      level: userLevel,
      tags: keywords,
    });

    return this.loadPacks(packIds.slice(0, 5));
  },
};

export default packLoader;

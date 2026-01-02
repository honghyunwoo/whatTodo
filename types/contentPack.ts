/**
 * Content Pack Types
 *
 * 핵심 원칙: "모든 콘텐츠 아이템은 고유 id를 갖고, packs/index.json으로 역색인을 제공한다."
 *
 * ID 네이밍 규칙:
 * - Pack ID: pack-NNNNNN (예: pack-000001)
 * - Item ID: pack-NNNNNN:type-seq (예: pack-000001:grammar-ex-001)
 *
 * @see docs/content-pack-spec.md
 */

import { CEFRLevel, PartOfSpeech, ExerciseType } from './activity';

// Re-export for convenience
export type { CEFRLevel };

// ─────────────────────────────────────
// Core Types
// ─────────────────────────────────────

/** 모든 콘텐츠 아이템의 기본 인터페이스 (오답복습/통계에서 필수) */
export interface ContentItem {
  id: string; // 고유 ID - 네임스페이스 방식: "pack-000001:grammar-ex-001"
}

/** 진행 난이도 (레벨 내 세분화) */
export type Difficulty = 1 | 2 | 3 | 4; // A1-1 ~ A1-4

/** 스킬 타입 (활동 영역) */
export type Skill = 'grammar' | 'vocab' | 'reading' | 'listening' | 'writing' | 'speaking';

// ─────────────────────────────────────
// Tag Normalization
// ─────────────────────────────────────

/**
 * 태그 정규화 함수
 * - 소문자 변환
 * - 공백을 언더스코어로
 * - 동의어 매핑
 */
export const normalizeTag = (tag: string): string => {
  const normalized = tag.toLowerCase().trim().replace(/\s+/g, '_');
  return TAG_SYNONYMS[normalized] || normalized;
};

/** 태그 동의어 테이블 (확장 가능) */
export const TAG_SYNONYMS: Record<string, string> = {
  clinic: 'hospital',
  doctor: 'hospital',
  cafe: 'coffee_shop',
  restaurant: 'dining',
  eatery: 'dining',
};

// ─────────────────────────────────────
// Content Pack
// ─────────────────────────────────────

/**
 * Content Pack Interface
 * 1팩 = 40~80개 아이템 생성
 */
export interface ContentPack {
  // === 기본 정보 ===
  id: string; // 고유 ID (필수!): pack-NNNNNN
  level: CEFRLevel;
  topic: string;
  canDo: string; // CEFR can-do statement

  // === 운영용 메타 ===
  functionId: string; // 스파인 기능 연결 (request, refusal, opinion...)
  difficulty: Difficulty; // A1-1 ~ A1-4 진행감
  skills: Skill[]; // 팩의 주요 스킬
  estimatedMinutes: number; // 예상 학습 시간
  tags: string[]; // todo 매칭용 (hospital, commute, cafe...)

  // === 콘텐츠 ===
  grammar: PackGrammar;
  vocabulary: PackVocabulary;
  reading: PackReading;
  listening: PackListening;
  writing: PackWriting;
  speaking: PackSpeaking;
  koreanErrors: KoreanError[]; // 3개
}

// ─────────────────────────────────────
// Pack Content Sections
// ─────────────────────────────────────

/** Grammar Section (12~20개 연습문제) */
export interface PackGrammar {
  point: string;
  rules: GrammarRule[];
  exercises: GrammarExercise[]; // 각각 id 필수
}

export interface GrammarRule extends ContentItem {
  title: string;
  explanation: string;
  examples: string[];
  koreanTip?: string; // 한국인 특화 팁
}

export interface GrammarExercise extends ContentItem {
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  koreanTip?: string;
}

/** Vocabulary Section (12~20개 단어) */
export interface PackVocabulary {
  words: VocabItem[]; // 각각 id 필수
  collocations: string[];
}

export interface VocabItem extends ContentItem {
  word: string;
  pronunciation: string; // IPA
  meaning: string;
  meaningKo: string;
  partOfSpeech: PartOfSpeech;
  examples: string[];
  koreanTip?: string;
  commonMistakes?: string; // "I am student (X) → I am a student (O)"
  relatedWords?: string[];
}

/** Reading Section (6~10개 문제) */
export interface PackReading extends ContentItem {
  title: string;
  passage: string;
  wordCount: number;
  questions: ReadingQuestion[]; // 각각 id 필수
}

export interface ReadingQuestion extends ContentItem {
  type: 'comprehension' | 'vocabulary' | 'inference' | 'main_idea';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

/** Listening Section (6~10개 연습문제) */
export interface PackListening extends ContentItem {
  title: string;
  script: string;
  audioUrl?: string;
  duration?: number; // seconds
  exercises: ListeningExercise[]; // 각각 id 필수
}

export interface ListeningExercise extends ContentItem {
  type: 'comprehension' | 'dictation' | 'fill_blank';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
}

/** Writing Section */
export interface PackWriting {
  template: TemplateWriting; // 슬롯 채우기 (채점 가능)
  free: FreeWriting; // 자유 작문 + 체크리스트
}

export interface TemplateWriting extends ContentItem {
  type: 'sentence_assembly' | 'pattern_transform' | 'error_correction';
  prompt: string;
  template: string; // "[SUBJECT] would like to [ACTION] at [TIME]."
  slots: TemplateSlot[];
  correctExample: string;
}

export interface TemplateSlot {
  name: string;
  options?: string[];
  hint?: string;
}

export interface FreeWriting extends ContentItem {
  topic: string;
  prompt: string;
  minWords: number;
  maxWords: number;
  checklist: WritingChecklistItem[];
}

export interface WritingChecklistItem {
  item: string;
  required: boolean;
}

/** Speaking Section */
export interface PackSpeaking {
  shadowing: ShadowingTask; // 따라 말하기
  roleplay: RoleplayTask; // 역할극 프롬프트
}

export interface ShadowingTask extends ContentItem {
  sentence: string;
  pronunciation: string; // IPA
  audioUrl?: string;
  koreanTip?: string;
  speedOptions: number[]; // [1.0, 0.8, 0.6]
}

export interface RoleplayTask extends ContentItem {
  scenario: string;
  role: string;
  partnerRole: string;
  prompts: RoleplayPrompt[];
  checklistItems: string[];
}

export interface RoleplayPrompt {
  speaker: 'user' | 'partner';
  text: string;
  hint?: string;
}

/** Korean Error (한국인 특화 오류) */
export interface KoreanError extends ContentItem {
  category: 'pronunciation' | 'grammar' | 'vocabulary' | 'usage';
  errorExample: string;
  correctForm: string;
  explanation: string;
  tip: string;
  audioUrl?: string;
}

// ─────────────────────────────────────
// Pack Index Types
// ─────────────────────────────────────

/** Pack Index (팩 단위 검색용) */
export interface PackIndex {
  version: string;
  lastUpdated: string;
  total: number;
  packs: Record<string, PackIndexEntry>;
  byLevel: Record<CEFRLevel, string[]>;
  byTopic: Record<string, string[]>;
  byFunctionId: Record<string, string[]>;
  byTag: Record<string, string[]>;
}

export interface PackIndexEntry {
  id: string;
  level: CEFRLevel;
  topic: string;
  difficulty: Difficulty;
  skills: Skill[];
  estimatedMinutes: number;
  tags: string[];
  itemCount: number;
}

/** Items Index (아이템 단위 검색용 - 오답/통계) */
export interface ItemsIndex {
  version: string;
  items: Record<string, ItemIndexEntry>;
}

export interface ItemIndexEntry {
  packId: string;
  type: Skill | 'korean_error';
  level: CEFRLevel;
  difficulty: Difficulty;
  tags: string[];
}

// ─────────────────────────────────────
// Utility Types
// ─────────────────────────────────────

/** 팩 ID 생성 */
export const generatePackId = (sequence: number): string => {
  return `pack-${sequence.toString().padStart(6, '0')}`;
};

/** 아이템 ID 생성 */
export const generateItemId = (packId: string, type: string, sequence: number): string => {
  return `${packId}:${type}-${sequence.toString().padStart(3, '0')}`;
};

/** 팩 ID에서 시퀀스 추출 */
export const extractPackSequence = (packId: string): number => {
  const match = packId.match(/pack-(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
};

/** 아이템 ID에서 팩 ID 추출 */
export const extractPackIdFromItem = (itemId: string): string => {
  return itemId.split(':')[0];
};

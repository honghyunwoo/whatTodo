/* eslint-disable no-console, @typescript-eslint/array-type */
/**
 * Content Validation Script
 *
 * 콘텐츠 품질 검증 스크립트
 * - 중복 ID 검사 → ERROR (즉시 실패)
 * - 해시 기반 콘텐츠 중복 검사
 * - 태그 정규화 검사
 * - 필수 필드 누락 검사
 * - 레벨/영역 분포 리포트
 *
 * 실행: npx ts-node scripts/validate-content.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface ValidationError {
  type: 'error';
  file: string;
  message: string;
  details?: string;
}

interface ValidationWarning {
  type: 'warning';
  file: string;
  message: string;
  details?: string;
}

interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  stats: ContentStats;
}

interface ContentStats {
  totalPacks: number;
  totalItems: number;
  byLevel: Record<string, number>;
  bySkill: Record<string, number>;
  duplicateContent: number;
}

// ─────────────────────────────────────
// Configuration
// ─────────────────────────────────────

const CONFIG = {
  packsDir: path.join(__dirname, '..', 'data', 'packs'),
  // 해시 중복 임계치 (이 이상이면 ERROR)
  duplicateThreshold: 5,
  // 필수 필드
  requiredPackFields: [
    'id',
    'level',
    'topic',
    'canDo',
    'functionId',
    'difficulty',
    'skills',
    'tags',
  ],
  // 태그 정규화 패턴
  tagPattern: /^[a-z][a-z0-9_]*$/,
};

// ─────────────────────────────────────
// Utilities
// ─────────────────────────────────────

function createContentHash(content: string): string {
  return crypto.createHash('md5').update(content.toLowerCase().trim()).digest('hex').slice(0, 12);
}

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, '_');
}

// ─────────────────────────────────────
// Validators
// ─────────────────────────────────────

/**
 * 중복 ID 검사
 */
function checkDuplicateIds(
  packs: Array<{ file: string; data: Record<string, unknown> }>
): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenIds = new Map<string, string>(); // id -> file

  for (const { file, data } of packs) {
    const packId = data.id as string;
    if (!packId) continue;

    if (seenIds.has(packId)) {
      errors.push({
        type: 'error',
        file,
        message: `Duplicate pack ID: ${packId}`,
        details: `Also found in: ${seenIds.get(packId)}`,
      });
    } else {
      seenIds.set(packId, file);
    }

    // 내부 아이템 ID 검사
    const checkItemIds = (items: unknown[], itemType: string) => {
      if (!Array.isArray(items)) return;
      for (const item of items) {
        const itemId = (item as Record<string, unknown>).id as string;
        if (!itemId) continue;

        if (seenIds.has(itemId)) {
          errors.push({
            type: 'error',
            file,
            message: `Duplicate item ID in ${itemType}: ${itemId}`,
            details: `Also found in: ${seenIds.get(itemId)}`,
          });
        } else {
          seenIds.set(itemId, file);
        }
      }
    };

    // 각 섹션의 아이템 ID 검사
    const grammar = data.grammar as Record<string, unknown>;
    if (grammar) {
      checkItemIds(grammar.exercises as unknown[], 'grammar.exercises');
      checkItemIds(grammar.rules as unknown[], 'grammar.rules');
    }

    const vocabulary = data.vocabulary as Record<string, unknown>;
    if (vocabulary) {
      checkItemIds(vocabulary.words as unknown[], 'vocabulary.words');
    }

    const reading = data.reading as Record<string, unknown>;
    if (reading) {
      checkItemIds(reading.questions as unknown[], 'reading.questions');
    }

    const listening = data.listening as Record<string, unknown>;
    if (listening) {
      checkItemIds(listening.exercises as unknown[], 'listening.exercises');
    }
  }

  return errors;
}

/**
 * 해시 기반 콘텐츠 중복 검사
 */
function checkDuplicateContent(packs: Array<{ file: string; data: Record<string, unknown> }>): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  count: number;
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const contentHashes = new Map<string, { file: string; level: string; content: string }[]>();

  for (const { file, data } of packs) {
    const level = data.level as string;

    // 문법 연습문제 해시
    const grammar = data.grammar as Record<string, unknown>;
    if (grammar && Array.isArray(grammar.exercises)) {
      for (const ex of grammar.exercises as Array<{ question?: string }>) {
        if (!ex.question) continue;
        const hash = createContentHash(ex.question);
        if (!contentHashes.has(hash)) {
          contentHashes.set(hash, []);
        }
        contentHashes.get(hash)!.push({ file, level, content: ex.question });
      }
    }

    // 읽기 지문 해시
    const reading = data.reading as Record<string, unknown>;
    if (reading && typeof reading.passage === 'string') {
      const hash = createContentHash(reading.passage);
      if (!contentHashes.has(hash)) {
        contentHashes.set(hash, []);
      }
      contentHashes.get(hash)!.push({ file, level, content: reading.passage.slice(0, 100) });
    }
  }

  // 중복 검사
  let duplicateCount = 0;
  for (const [hash, entries] of contentHashes) {
    if (entries.length > 1) {
      duplicateCount++;

      // 레벨이 모두 같으면 완전 중복 (ERROR)
      const levels = new Set(entries.map((e) => e.level));
      if (levels.size === 1) {
        // 임계치 이상이면 ERROR
        if (duplicateCount > CONFIG.duplicateThreshold) {
          errors.push({
            type: 'error',
            file: entries[0].file,
            message: `Complete duplicate content detected (hash: ${hash})`,
            details: `Found in ${entries.length} files: ${entries.map((e) => e.file).join(', ')}`,
          });
        }
      } else {
        // 레벨이 다르면 경고만 (의도적 레벨별 복제 가능)
        warnings.push({
          type: 'warning',
          file: entries[0].file,
          message: `Content duplicated across levels (hash: ${hash})`,
          details: `Levels: ${Array.from(levels).join(', ')}`,
        });
      }
    }
  }

  return { errors, warnings, count: duplicateCount };
}

/**
 * 태그 정규화 검사
 */
function checkTagNormalization(
  packs: Array<{ file: string; data: Record<string, unknown> }>
): ValidationWarning[] {
  const warnings: ValidationWarning[] = [];

  for (const { file, data } of packs) {
    const tags = data.tags as string[];
    if (!Array.isArray(tags)) continue;

    for (const tag of tags) {
      // 정규화 필요 여부 검사
      const normalized = normalizeTag(tag);
      if (tag !== normalized) {
        warnings.push({
          type: 'warning',
          file,
          message: `Tag needs normalization: "${tag}" → "${normalized}"`,
        });
      }

      // 패턴 검사
      if (!CONFIG.tagPattern.test(normalized)) {
        warnings.push({
          type: 'warning',
          file,
          message: `Invalid tag format: "${tag}"`,
          details: 'Tags should be lowercase with underscores only',
        });
      }
    }
  }

  return warnings;
}

/**
 * 필수 필드 검사
 */
function checkRequiredFields(
  packs: Array<{ file: string; data: Record<string, unknown> }>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const { file, data } of packs) {
    for (const field of CONFIG.requiredPackFields) {
      if (!(field in data) || data[field] === undefined || data[field] === null) {
        errors.push({
          type: 'error',
          file,
          message: `Missing required field: ${field}`,
        });
      }
    }
  }

  return errors;
}

/**
 * 통계 생성
 */
function generateStats(
  packs: Array<{ file: string; data: Record<string, unknown> }>,
  duplicateCount: number
): ContentStats {
  const stats: ContentStats = {
    totalPacks: packs.length,
    totalItems: 0,
    byLevel: {},
    bySkill: {},
    duplicateContent: duplicateCount,
  };

  for (const { data } of packs) {
    const level = data.level as string;
    stats.byLevel[level] = (stats.byLevel[level] || 0) + 1;

    const skills = data.skills as string[];
    if (Array.isArray(skills)) {
      for (const skill of skills) {
        stats.bySkill[skill] = (stats.bySkill[skill] || 0) + 1;
      }
    }

    // 아이템 카운트
    const countItems = (items: unknown) => {
      if (Array.isArray(items)) {
        stats.totalItems += items.length;
      }
    };

    const grammar = data.grammar as Record<string, unknown>;
    if (grammar) {
      countItems(grammar.exercises);
      countItems(grammar.rules);
    }

    const vocabulary = data.vocabulary as Record<string, unknown>;
    if (vocabulary) {
      countItems(vocabulary.words);
    }

    const reading = data.reading as Record<string, unknown>;
    if (reading) {
      countItems(reading.questions);
    }

    const listening = data.listening as Record<string, unknown>;
    if (listening) {
      countItems(listening.exercises);
    }
  }

  return stats;
}

// ─────────────────────────────────────
// Main
// ─────────────────────────────────────

async function main(): Promise<void> {
  console.log('🔍 Content Validation Script\n');

  // 팩 파일 로드
  const packsDir = CONFIG.packsDir;
  if (!fs.existsSync(packsDir)) {
    console.log(`📁 Packs directory not found: ${packsDir}`);
    console.log('   Run this script after creating pack files.\n');
    return;
  }

  const packFiles = fs
    .readdirSync(packsDir)
    .filter((f) => f.startsWith('pack-') && f.endsWith('.json'));

  if (packFiles.length === 0) {
    console.log('📦 No pack files found. Nothing to validate.\n');
    return;
  }

  console.log(`📦 Found ${packFiles.length} pack files\n`);

  // 팩 데이터 로드
  const packs: Array<{ file: string; data: Record<string, unknown> }> = [];
  for (const file of packFiles) {
    const filePath = path.join(packsDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    packs.push({ file, data: JSON.parse(content) });
  }

  // 검증 실행
  const result: ValidationResult = {
    errors: [],
    warnings: [],
    stats: { totalPacks: 0, totalItems: 0, byLevel: {}, bySkill: {}, duplicateContent: 0 },
  };

  // 1. 중복 ID 검사
  console.log('1️⃣ Checking duplicate IDs...');
  result.errors.push(...checkDuplicateIds(packs));

  // 2. 해시 기반 콘텐츠 중복 검사
  console.log('2️⃣ Checking duplicate content...');
  const duplicateResult = checkDuplicateContent(packs);
  result.errors.push(...duplicateResult.errors);
  result.warnings.push(...duplicateResult.warnings);

  // 3. 태그 정규화 검사
  console.log('3️⃣ Checking tag normalization...');
  result.warnings.push(...checkTagNormalization(packs));

  // 4. 필수 필드 검사
  console.log('4️⃣ Checking required fields...');
  result.errors.push(...checkRequiredFields(packs));

  // 5. 통계 생성
  console.log('5️⃣ Generating statistics...\n');
  result.stats = generateStats(packs, duplicateResult.count);

  // 결과 출력
  console.log('═══════════════════════════════════════');
  console.log('📊 Validation Results');
  console.log('═══════════════════════════════════════\n');

  if (result.errors.length === 0 && result.warnings.length === 0) {
    console.log('✅ All checks passed!\n');
  }

  if (result.errors.length > 0) {
    console.log(`❌ Errors: ${result.errors.length}`);
    for (const error of result.errors) {
      console.log(`   • [${error.file}] ${error.message}`);
      if (error.details) console.log(`     ${error.details}`);
    }
    console.log();
  }

  if (result.warnings.length > 0) {
    console.log(`⚠️ Warnings: ${result.warnings.length}`);
    for (const warning of result.warnings) {
      console.log(`   • [${warning.file}] ${warning.message}`);
      if (warning.details) console.log(`     ${warning.details}`);
    }
    console.log();
  }

  // 통계 출력
  console.log('📈 Statistics');
  console.log('───────────────────────────────────────');
  console.log(`   Total Packs: ${result.stats.totalPacks}`);
  console.log(`   Total Items: ${result.stats.totalItems}`);
  console.log(`   Duplicate Content: ${result.stats.duplicateContent}`);
  console.log();
  console.log('   By Level:');
  for (const [level, count] of Object.entries(result.stats.byLevel).sort()) {
    console.log(`     ${level}: ${count}`);
  }
  console.log();
  console.log('   By Skill:');
  for (const [skill, count] of Object.entries(result.stats.bySkill).sort()) {
    console.log(`     ${skill}: ${count}`);
  }
  console.log();

  // 종료 코드
  if (result.errors.length > 0) {
    console.log('❌ Validation FAILED\n');
    process.exit(1);
  } else {
    console.log('✅ Validation PASSED\n');
    process.exit(0);
  }
}

main().catch((error) => {
  console.error('Script error:', error);
  process.exit(1);
});

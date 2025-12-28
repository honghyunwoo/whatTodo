/**
 * Static imports for lesson meta files
 * Metro bundler requires static imports (no dynamic paths)
 */

import type { LevelMeta } from '@/types/lesson';

// Import all level meta files statically
import a1Meta from './a1/meta.json';
import a2Meta from './a2/meta.json';
import b1Meta from './b1/meta.json';
import b2Meta from './b2/meta.json';
import c1Meta from './c1/meta.json';
import c2Meta from './c2/meta.json';

// Define CEFRLevel here to avoid circular dependency
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

// Export all level metas
export const LEVEL_METAS: Record<CEFRLevel, LevelMeta> = {
  A1: a1Meta as unknown as LevelMeta,
  A2: a2Meta as unknown as LevelMeta,
  B1: b1Meta as unknown as LevelMeta,
  B2: b2Meta as unknown as LevelMeta,
  C1: c1Meta as unknown as LevelMeta,
  C2: c2Meta as unknown as LevelMeta,
};

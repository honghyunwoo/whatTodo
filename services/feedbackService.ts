/**
 * Unified Feedback Service - Phase 0
 * 햅틱 + 사운드 + (향후) 애니메이션 통합 서비스
 *
 * 원리: 다감각 피드백 = 더 강한 도파민 반응
 * - 촉각 (햅틱) + 청각 (사운드) + 시각 (애니메이션)
 */

import {
  learnHaptics,
  successHaptic,
  heavyHaptic,
  mediumHaptic,
  lightHaptic,
} from './hapticService';
import { learnSounds } from './soundService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export type FeedbackType =
  | 'success'
  | 'wrong'
  | 'combo'
  | 'levelUp'
  | 'badge'
  | 'bonus'
  | 'perfect'
  | 'tap'
  | 'selection';

// ─────────────────────────────────────
// Unified Feedback Functions
// ─────────────────────────────────────

/**
 * 정답 피드백
 * - 햅틱: Success notification
 * - 사운드: correct.mp3
 */
export async function success(): Promise<void> {
  await Promise.all([learnHaptics.correct(), learnSounds.correct()]);
}

/**
 * 오답 피드백
 * - 햅틱: Error notification
 * - 사운드: wrong.mp3
 */
export async function wrong(): Promise<void> {
  await Promise.all([learnHaptics.wrong(), learnSounds.wrong()]);
}

/**
 * 콤보 달성 피드백 (3연속)
 * - 햅틱: Heavy impact
 * - 사운드: combo 또는 level-up
 */
export async function combo(): Promise<void> {
  await Promise.all([heavyHaptic(), learnSounds.levelUp()]);
}

/**
 * 레벨업 / 5연속 피드백
 * - 햅틱: Double success
 * - 사운드: level-up
 */
export async function levelUp(): Promise<void> {
  await Promise.all([learnHaptics.levelUp(), learnSounds.levelUp()]);
}

/**
 * 배지/업적 달성 피드백 (10연속, 만점 등)
 * - 햅틱: Triple success (강조)
 * - 사운드: achievement
 */
export async function badge(): Promise<void> {
  await learnSounds.achievement();
  await successHaptic();
  setTimeout(() => successHaptic(), 150);
  setTimeout(() => successHaptic(), 300);
}

/**
 * 보너스 XP 획득 피드백
 * - 햅틱: Medium impact
 * - 사운드: achievement
 */
export async function bonus(): Promise<void> {
  await Promise.all([mediumHaptic(), learnSounds.achievement()]);
}

/**
 * 퍼펙트 (만점) 피드백
 * - 햅틱: 강한 연속 피드백
 * - 사운드: achievement
 */
export async function perfect(): Promise<void> {
  await learnSounds.achievement();
  await heavyHaptic();
  setTimeout(() => successHaptic(), 200);
  setTimeout(() => heavyHaptic(), 400);
}

/**
 * 탭 피드백
 * - 햅틱: Light
 */
export async function tap(): Promise<void> {
  await lightHaptic();
}

/**
 * 선택 피드백
 * - 햅틱: Selection
 */
export async function selection(): Promise<void> {
  await learnHaptics.selection();
}

/**
 * 카드 플립 피드백
 */
export async function cardFlip(): Promise<void> {
  await Promise.all([learnHaptics.cardFlip(), learnSounds.cardFlip()]);
}

/**
 * 스트릭 마일스톤 피드백
 */
export async function streakMilestone(): Promise<void> {
  await Promise.all([learnHaptics.streakMilestone(), learnSounds.achievement()]);
}

// ─────────────────────────────────────
// 타입별 피드백 호출 (동적)
// ─────────────────────────────────────

export async function trigger(type: FeedbackType): Promise<void> {
  switch (type) {
    case 'success':
      await success();
      break;
    case 'wrong':
      await wrong();
      break;
    case 'combo':
      await combo();
      break;
    case 'levelUp':
      await levelUp();
      break;
    case 'badge':
      await badge();
      break;
    case 'bonus':
      await bonus();
      break;
    case 'perfect':
      await perfect();
      break;
    case 'tap':
      await tap();
      break;
    case 'selection':
      await selection();
      break;
  }
}

// ─────────────────────────────────────
// Export
// ─────────────────────────────────────

export const feedbackService = {
  // 기본 피드백
  success,
  wrong,

  // 콤보/마일스톤
  combo,
  levelUp,
  badge,
  bonus,
  perfect,

  // UI 인터랙션
  tap,
  selection,
  cardFlip,
  streakMilestone,

  // 동적 호출
  trigger,
};

export default feedbackService;

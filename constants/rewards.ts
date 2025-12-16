/**
 * Variable Reward System - Phase 0
 * 행동 심리학 기반 가변 보상 시스템
 *
 * 원리: 예측 불가능한 보상 = 도파민 분비 극대화
 * 참고: Nir Eyal "Hooked", BJ Fogg Behavior Model
 */

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface PraiseVariant {
  id: string;
  text: string;
  emoji: string;
  probability: number;
  condition: 'default' | 'streak3' | 'streak5' | 'streak10' | 'perfect' | 'fast' | 'first';
  bonusXP?: number;
  animation?: 'bounce' | 'shake' | 'confetti' | 'firework' | 'glow';
  sound?: 'success' | 'amazing' | 'perfect' | 'bonus' | 'combo';
}

export interface WrongVariant {
  id: string;
  text: string;
  emoji: string;
  encouragement: boolean;
}

// ─────────────────────────────────────
// 정답 칭찬 메시지 (Variable Reward)
// ─────────────────────────────────────

export const PRAISE_VARIANTS: PraiseVariant[] = [
  // 기본 칭찬 (60% 확률로 이 중 하나)
  {
    id: 'correct1',
    text: '정답이에요!',
    emoji: '✅',
    probability: 0.15,
    condition: 'default',
    sound: 'success',
  },
  {
    id: 'correct2',
    text: '맞았어요!',
    emoji: '👍',
    probability: 0.15,
    condition: 'default',
    sound: 'success',
  },
  {
    id: 'correct3',
    text: '좋아요!',
    emoji: '👏',
    probability: 0.12,
    condition: 'default',
    sound: 'success',
  },
  {
    id: 'correct4',
    text: '잘했어요!',
    emoji: '🌟',
    probability: 0.1,
    condition: 'default',
    sound: 'success',
  },
  {
    id: 'correct5',
    text: '바로 그거예요!',
    emoji: '🎯',
    probability: 0.08,
    condition: 'default',
    sound: 'success',
  },

  // 특별 칭찬 (25% 확률) - 애니메이션 포함
  {
    id: 'special1',
    text: '완벽해요!',
    emoji: '💯',
    probability: 0.08,
    condition: 'default',
    animation: 'bounce',
    sound: 'amazing',
  },
  {
    id: 'special2',
    text: '대단해요!',
    emoji: '⭐',
    probability: 0.06,
    condition: 'default',
    animation: 'bounce',
    sound: 'amazing',
  },
  {
    id: 'special3',
    text: '천재인가요?',
    emoji: '🧠',
    probability: 0.04,
    condition: 'default',
    animation: 'glow',
    sound: 'perfect',
  },
  {
    id: 'special4',
    text: '언어 천재!',
    emoji: '💫',
    probability: 0.04,
    condition: 'default',
    animation: 'glow',
    sound: 'perfect',
  },
  {
    id: 'special5',
    text: '놀라워요!',
    emoji: '🤩',
    probability: 0.03,
    condition: 'default',
    animation: 'bounce',
    sound: 'amazing',
  },

  // 보너스 XP (15% 확률) - 도파민 폭발
  {
    id: 'bonus1',
    text: '보너스 +5!',
    emoji: '🎁',
    probability: 0.06,
    condition: 'default',
    bonusXP: 5,
    animation: 'confetti',
    sound: 'bonus',
  },
  {
    id: 'bonus2',
    text: '럭키 보너스!',
    emoji: '🍀',
    probability: 0.04,
    condition: 'default',
    bonusXP: 10,
    animation: 'confetti',
    sound: 'bonus',
  },
  {
    id: 'bonus3',
    text: '더블 XP!',
    emoji: '✨',
    probability: 0.03,
    condition: 'default',
    bonusXP: 15,
    animation: 'firework',
    sound: 'bonus',
  },
  {
    id: 'bonus4',
    text: '잭팟!',
    emoji: '💎',
    probability: 0.02,
    condition: 'default',
    bonusXP: 25,
    animation: 'firework',
    sound: 'bonus',
  },

  // ─────────────────────────────────────
  // 조건부 메시지 (특정 상황에서 100% 출현)
  // ─────────────────────────────────────

  // 연속 정답 (콤보)
  {
    id: 'streak3',
    text: '3연속 정답!',
    emoji: '🔥',
    probability: 1.0,
    condition: 'streak3',
    animation: 'bounce',
    sound: 'combo',
  },
  {
    id: 'streak5',
    text: '불타오르네요!',
    emoji: '🔥🔥',
    probability: 1.0,
    condition: 'streak5',
    bonusXP: 5,
    animation: 'firework',
    sound: 'combo',
  },
  {
    id: 'streak10',
    text: '전설이 되셨네요!',
    emoji: '🔥🔥🔥',
    probability: 1.0,
    condition: 'streak10',
    bonusXP: 15,
    animation: 'confetti',
    sound: 'bonus',
  },

  // 빠른 정답 (3초 이내)
  {
    id: 'fast1',
    text: '번개처럼 빠르게!',
    emoji: '⚡',
    probability: 0.5,
    condition: 'fast',
    bonusXP: 3,
    animation: 'glow',
    sound: 'amazing',
  },
  {
    id: 'fast2',
    text: '순식간에!',
    emoji: '💨',
    probability: 0.5,
    condition: 'fast',
    bonusXP: 3,
    animation: 'bounce',
    sound: 'amazing',
  },

  // 첫 정답 (세션 시작)
  {
    id: 'first',
    text: '좋은 시작이에요!',
    emoji: '🚀',
    probability: 1.0,
    condition: 'first',
    animation: 'bounce',
    sound: 'success',
  },

  // 만점 (100%)
  {
    id: 'perfect',
    text: '퍼펙트!',
    emoji: '👑',
    probability: 1.0,
    condition: 'perfect',
    bonusXP: 20,
    animation: 'firework',
    sound: 'perfect',
  },
];

// ─────────────────────────────────────
// 오답 메시지 (격려 중심)
// ─────────────────────────────────────

export const WRONG_VARIANTS: WrongVariant[] = [
  { id: 'wrong1', text: '괜찮아요, 다시 해봐요!', emoji: '💪', encouragement: true },
  { id: 'wrong2', text: '아쉬워요, 한 번 더!', emoji: '🔄', encouragement: true },
  { id: 'wrong3', text: '실수는 배움의 어머니!', emoji: '📚', encouragement: true },
  { id: 'wrong4', text: '포기하지 마세요!', emoji: '🌱', encouragement: true },
  { id: 'wrong5', text: '거의 다 왔어요!', emoji: '🎯', encouragement: true },
  { id: 'wrong6', text: '다음엔 맞출 수 있어요!', emoji: '✊', encouragement: true },
  { id: 'wrong7', text: '오답도 공부예요!', emoji: '📝', encouragement: true },
  { id: 'wrong8', text: '조금만 더 생각해봐요!', emoji: '🤔', encouragement: true },
];

// ─────────────────────────────────────
// 칭찬 메시지 선택 함수
// ─────────────────────────────────────

interface PraiseContext {
  streak: number; // 현재 연속 정답 수
  answerTimeMs: number; // 답변까지 걸린 시간 (ms)
  isFirstAnswer: boolean; // 세션 첫 문제인가?
  isPerfectScore: boolean; // 만점인가?
}

/**
 * 컨텍스트에 맞는 칭찬 메시지 선택
 *
 * 우선순위:
 * 1. 조건부 메시지 (스트릭, 빠른 답변 등)
 * 2. 확률 기반 랜덤 메시지
 */
export function selectPraise(context: PraiseContext): PraiseVariant {
  const { streak, answerTimeMs, isFirstAnswer, isPerfectScore } = context;

  // 1. 만점 체크
  if (isPerfectScore) {
    return PRAISE_VARIANTS.find((p) => p.condition === 'perfect')!;
  }

  // 2. 스트릭 마일스톤 체크 (정확히 해당 숫자일 때만)
  if (streak === 10 || (streak > 10 && streak % 10 === 0)) {
    return PRAISE_VARIANTS.find((p) => p.condition === 'streak10')!;
  }
  if (streak === 5) {
    return PRAISE_VARIANTS.find((p) => p.condition === 'streak5')!;
  }
  if (streak === 3) {
    return PRAISE_VARIANTS.find((p) => p.condition === 'streak3')!;
  }

  // 3. 첫 정답 체크
  if (isFirstAnswer && streak === 1) {
    return PRAISE_VARIANTS.find((p) => p.condition === 'first')!;
  }

  // 4. 빠른 정답 체크 (3초 이내, 30% 확률)
  if (answerTimeMs < 3000 && Math.random() < 0.3) {
    const fastPraises = PRAISE_VARIANTS.filter((p) => p.condition === 'fast');
    return fastPraises[Math.floor(Math.random() * fastPraises.length)];
  }

  // 5. 일반 메시지 확률 기반 선택
  return selectByProbability();
}

/**
 * 확률 기반 랜덤 선택
 */
function selectByProbability(): PraiseVariant {
  const defaultPraises = PRAISE_VARIANTS.filter((p) => p.condition === 'default');
  const random = Math.random();
  let cumulative = 0;

  for (const praise of defaultPraises) {
    cumulative += praise.probability;
    if (random < cumulative) {
      return praise;
    }
  }

  // 폴백: 첫 번째 기본 칭찬
  return defaultPraises[0];
}

/**
 * 오답 메시지 랜덤 선택
 */
export function selectWrongMessage(): WrongVariant {
  const index = Math.floor(Math.random() * WRONG_VARIANTS.length);
  return WRONG_VARIANTS[index];
}

// ─────────────────────────────────────
// XP 계산 유틸리티
// ─────────────────────────────────────

interface XPCalculation {
  baseXP: number;
  comboMultiplier: number;
  bonusXP: number;
  totalXP: number;
}

/**
 * XP 계산
 *
 * @param baseXP 기본 XP (문제 타입별)
 * @param combo 현재 콤보 수
 * @param praise 선택된 칭찬 메시지 (보너스 XP 포함 가능)
 */
export function calculateXP(baseXP: number, combo: number, praise: PraiseVariant): XPCalculation {
  // 콤보 배수 계산
  let comboMultiplier = 1.0;
  if (combo >= 10) comboMultiplier = 2.0;
  else if (combo >= 5) comboMultiplier = 1.5;
  else if (combo >= 3) comboMultiplier = 1.2;

  // 보너스 XP
  const bonusXP = praise.bonusXP || 0;

  // 총 XP = (기본 * 콤보배수) + 보너스
  const totalXP = Math.round(baseXP * comboMultiplier) + bonusXP;

  return {
    baseXP,
    comboMultiplier,
    bonusXP,
    totalXP,
  };
}

// ─────────────────────────────────────
// 콤보 관련 상수
// ─────────────────────────────────────

export const COMBO_THRESHOLDS = {
  ON_FIRE: 3, // 🔥 시작
  BURNING: 5, // 🔥🔥
  LEGENDARY: 10, // 🔥🔥🔥
} as const;

export const COMBO_MULTIPLIERS = {
  [COMBO_THRESHOLDS.ON_FIRE]: 1.2,
  [COMBO_THRESHOLDS.BURNING]: 1.5,
  [COMBO_THRESHOLDS.LEGENDARY]: 2.0,
} as const;

export const COMBO_LABELS = {
  [COMBO_THRESHOLDS.ON_FIRE]: 'COMBO!',
  [COMBO_THRESHOLDS.BURNING]: 'ON FIRE!',
  [COMBO_THRESHOLDS.LEGENDARY]: 'LEGENDARY!',
} as const;

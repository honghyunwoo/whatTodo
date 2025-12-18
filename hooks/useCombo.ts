/**
 * useCombo Hook - Phase 0
 * 연속 정답 콤보 시스템
 *
 * 심리학 원리: Micro-wins + Variable Interval Reinforcement
 * 매 정답마다 작은 성취감, 마일스톤에서 큰 보상
 */

import { useCallback, useRef, useState } from 'react';
import { COMBO_THRESHOLDS, COMBO_MULTIPLIERS, COMBO_LABELS } from '@/constants/rewards';
import { feedbackService } from '@/services/feedbackService';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface ComboState {
  count: number;
  isOnFire: boolean; // 3+ 연속
  isBurning: boolean; // 5+ 연속
  isLegendary: boolean; // 10+ 연속
  multiplier: number; // XP 배수
  label: string | null; // 표시 라벨
}

export interface UseComboReturn {
  combo: ComboState;
  incrementCombo: () => ComboState;
  resetCombo: () => void;
  getXPMultiplier: () => number;
  isFirstAnswer: boolean;
}

// ─────────────────────────────────────
// Hook
// ─────────────────────────────────────

export function useCombo(): UseComboReturn {
  const [combo, setCombo] = useState<ComboState>({
    count: 0,
    isOnFire: false,
    isBurning: false,
    isLegendary: false,
    multiplier: 1,
    label: null,
  });

  const isFirstAnswerRef = useRef(true);
  const lastCorrectTimeRef = useRef<number>(Date.now());

  /**
   * 콤보 배수 계산
   */
  const calculateMultiplier = useCallback((count: number): number => {
    if (count >= COMBO_THRESHOLDS.LEGENDARY) {
      return COMBO_MULTIPLIERS[COMBO_THRESHOLDS.LEGENDARY];
    }
    if (count >= COMBO_THRESHOLDS.BURNING) {
      return COMBO_MULTIPLIERS[COMBO_THRESHOLDS.BURNING];
    }
    if (count >= COMBO_THRESHOLDS.ON_FIRE) {
      return COMBO_MULTIPLIERS[COMBO_THRESHOLDS.ON_FIRE];
    }
    return 1.0;
  }, []);

  /**
   * 콤보 라벨 결정
   */
  const getLabel = useCallback((count: number): string | null => {
    if (count >= COMBO_THRESHOLDS.LEGENDARY) {
      return COMBO_LABELS[COMBO_THRESHOLDS.LEGENDARY];
    }
    if (count >= COMBO_THRESHOLDS.BURNING) {
      return COMBO_LABELS[COMBO_THRESHOLDS.BURNING];
    }
    if (count >= COMBO_THRESHOLDS.ON_FIRE) {
      return COMBO_LABELS[COMBO_THRESHOLDS.ON_FIRE];
    }
    return null;
  }, []);

  /**
   * 콤보 증가 (정답 시 호출)
   */
  const incrementCombo = useCallback((): ComboState => {
    const newCount = combo.count + 1;

    const newState: ComboState = {
      count: newCount,
      isOnFire: newCount >= COMBO_THRESHOLDS.ON_FIRE,
      isBurning: newCount >= COMBO_THRESHOLDS.BURNING,
      isLegendary: newCount >= COMBO_THRESHOLDS.LEGENDARY,
      multiplier: calculateMultiplier(newCount),
      label: getLabel(newCount),
    };

    // 마일스톤 도달 시 특별 피드백
    if (newCount === COMBO_THRESHOLDS.ON_FIRE) {
      // 3연속: 불꽃 효과
      feedbackService.combo();
    } else if (newCount === COMBO_THRESHOLDS.BURNING) {
      // 5연속: 더 강한 효과
      feedbackService.levelUp();
    } else if (newCount === COMBO_THRESHOLDS.LEGENDARY) {
      // 10연속: 최고 효과
      feedbackService.badge();
    } else if (newCount > COMBO_THRESHOLDS.LEGENDARY && newCount % 10 === 0) {
      // 10의 배수: 계속되는 전설
      feedbackService.badge();
    }

    setCombo(newState);
    lastCorrectTimeRef.current = Date.now();

    // 첫 정답 이후로는 false
    if (isFirstAnswerRef.current) {
      isFirstAnswerRef.current = false;
    }

    return newState;
  }, [combo.count, calculateMultiplier, getLabel]);

  /**
   * 콤보 리셋 (오답 시 호출)
   */
  const resetCombo = useCallback(() => {
    setCombo({
      count: 0,
      isOnFire: false,
      isBurning: false,
      isLegendary: false,
      multiplier: 1,
      label: null,
    });
  }, []);

  /**
   * 현재 XP 배수 가져오기
   */
  const getXPMultiplier = useCallback(() => {
    return combo.multiplier;
  }, [combo.multiplier]);

  return {
    combo,
    incrementCombo,
    resetCombo,
    getXPMultiplier,
    isFirstAnswer: isFirstAnswerRef.current,
  };
}

export default useCombo;

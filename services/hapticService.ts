import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback service for consistent haptic patterns across the app
 */

// Check if haptics are available
const isHapticAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Light haptic feedback - for subtle interactions
 * Use for: button presses, toggles, selections
 */
export async function lightHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Medium haptic feedback - for standard interactions
 * Use for: swipe actions, drag operations, confirmations
 */
export async function mediumHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Heavy haptic feedback - for significant interactions
 * Use for: completing actions, game events, important state changes
 */
export async function heavyHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Success notification haptic
 * Use for: task completion, correct answers, achievements
 */
export async function successHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Warning notification haptic
 * Use for: validation errors, near limits, cautions
 */
export async function warningHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Error notification haptic
 * Use for: wrong answers, failed actions, critical errors
 */
export async function errorHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

/**
 * Selection haptic - very subtle
 * Use for: scrolling through options, picker changes
 */
export async function selectionHaptic(): Promise<void> {
  if (!isHapticAvailable) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.warn('Haptic feedback failed:', error);
  }
}

// Game-specific haptic patterns
export const gameHaptics = {
  /**
   * Haptic for tile movement in 2048
   */
  tileMove: async (): Promise<void> => {
    await lightHaptic();
  },

  /**
   * Haptic for tile merge in 2048
   */
  tileMerge: async (): Promise<void> => {
    await mediumHaptic();
  },

  /**
   * Haptic for high-value tile merge (512+)
   */
  highValueMerge: async (): Promise<void> => {
    await heavyHaptic();
  },

  /**
   * Haptic for game over
   */
  gameOver: async (): Promise<void> => {
    await errorHaptic();
  },

  /**
   * Haptic for winning (reaching 2048)
   */
  win: async (): Promise<void> => {
    await successHaptic();
  },

  /**
   * Haptic for new game start
   */
  newGame: async (): Promise<void> => {
    await mediumHaptic();
  },
};

// Learn-specific haptic patterns
export const learnHaptics = {
  /**
   * Haptic for correct answer
   */
  correct: async (): Promise<void> => {
    await successHaptic();
  },

  /**
   * Haptic for wrong answer
   */
  wrong: async (): Promise<void> => {
    await errorHaptic();
  },

  /**
   * Haptic for card flip
   */
  cardFlip: async (): Promise<void> => {
    await lightHaptic();
  },

  /**
   * Haptic for level up
   */
  levelUp: async (): Promise<void> => {
    // Double haptic for emphasis
    await successHaptic();
    setTimeout(() => successHaptic(), 200);
  },

  /**
   * Haptic for streak milestone
   */
  streakMilestone: async (): Promise<void> => {
    await heavyHaptic();
  },
};

// Todo-specific haptic patterns
export const todoHaptics = {
  /**
   * Haptic for task completion
   */
  complete: async (): Promise<void> => {
    await successHaptic();
  },

  /**
   * Haptic for task deletion
   */
  delete: async (): Promise<void> => {
    await mediumHaptic();
  },

  /**
   * Haptic for adding new task
   */
  add: async (): Promise<void> => {
    await lightHaptic();
  },

  /**
   * Haptic for swipe action trigger
   */
  swipeTrigger: async (): Promise<void> => {
    await mediumHaptic();
  },

  /**
   * Haptic for tab selection / light tap
   */
  tap: async (): Promise<void> => {
    await selectionHaptic();
  },
};

export default {
  light: lightHaptic,
  medium: mediumHaptic,
  heavy: heavyHaptic,
  success: successHaptic,
  warning: warningHaptic,
  error: errorHaptic,
  selection: selectionHaptic,
  game: gameHaptics,
  learn: learnHaptics,
  todo: todoHaptics,
};

/**
 * Animation Constants
 * Centralized animation timing and configuration values
 */

// Duration values in milliseconds
export const DURATION = {
  instant: 100,
  fast: 150,
  normal: 200,
  medium: 300,
  slow: 400,
  emphasis: 800,
  long: 1000,
  veryLong: 1200,
} as const;

// Delay values in milliseconds
export const DELAY = {
  none: 0,
  short: 100,
  medium: 200,
  long: 300,
  stagger: 100, // For staggered list animations
} as const;

// Common transition presets for Moti
export const TRANSITIONS = {
  instant: { type: 'timing' as const, duration: DURATION.instant },
  fast: { type: 'timing' as const, duration: DURATION.fast },
  normal: { type: 'timing' as const, duration: DURATION.normal },
  medium: { type: 'timing' as const, duration: DURATION.medium },
  slow: { type: 'timing' as const, duration: DURATION.slow },
  emphasis: { type: 'timing' as const, duration: DURATION.emphasis },
} as const;

// Spring animation configurations
export const SPRING = {
  gentle: {
    type: 'spring' as const,
    damping: 15,
    stiffness: 100,
  },
  bouncy: {
    type: 'spring' as const,
    damping: 10,
    stiffness: 180,
  },
  stiff: {
    type: 'spring' as const,
    damping: 20,
    stiffness: 300,
  },
} as const;

// Reanimated withTiming default config
export const TIMING_CONFIG = {
  fast: { duration: DURATION.fast },
  normal: { duration: DURATION.normal },
  medium: { duration: DURATION.medium },
  slow: { duration: DURATION.slow },
} as const;

// Focus delay for input elements (after keyboard shows)
export const FOCUS_DELAY = 300;

// Game-specific animation timings
export const GAME_TIMING = {
  tileSpawn: 100,
  tileMove: 150,
  tileMerge: 200,
  gameOver: 300,
} as const;

// Learning activity animation timings
export const LEARN_TIMING = {
  questionTransition: 300,
  feedbackReveal: 200,
  progressBar: 300,
  cardFlip: 400,
} as const;

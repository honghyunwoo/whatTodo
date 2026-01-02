import { Audio, AVPlaybackSource } from 'expo-av';

/**
 * Sound service for playing audio feedback throughout the app
 *
 * 사운드 파일이 없어도 앱이 작동하도록 graceful degradation 적용
 * 파일 추가 시 자동으로 활성화됨
 *
 * 필요한 파일:
 * - assets/sounds/correct.mp3
 * - assets/sounds/wrong.mp3
 * - assets/sounds/level-up.mp3
 * - assets/sounds/achievement.mp3
 * - assets/sounds/card-flip.mp3
 */

// Sound cache to avoid reloading
const soundCache: Map<string, Audio.Sound> = new Map();

// Track if audio is enabled
let isEnabled = true;

// Track if audio system is initialized
let isInitialized = false;

/**
 * Initialize audio session
 * Call this once at app startup
 */
export async function initializeAudio(): Promise<void> {
  if (isInitialized) return;

  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false, // Respect silent mode
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    isInitialized = true;
  } catch (error) {
    console.warn('Failed to initialize audio:', error);
  }
}

/**
 * Enable or disable sound effects
 */
export function setSoundEnabled(enabled: boolean): void {
  isEnabled = enabled;
}

/**
 * Check if sound is enabled
 */
export function isSoundEnabled(): boolean {
  return isEnabled;
}

/**
 * Load a sound file and cache it
 */
async function loadSound(source: AVPlaybackSource, key: string): Promise<Audio.Sound | null> {
  if (soundCache.has(key)) {
    return soundCache.get(key)!;
  }

  try {
    const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
    soundCache.set(key, sound);
    return sound;
  } catch {
    // Graceful degradation - sound files may not exist
    // This is expected during development
    return null;
  }
}

/**
 * Play a sound from cache or load it first
 * Gracefully fails if sound file doesn't exist
 */
async function playSound(source: AVPlaybackSource, key: string, volume = 1.0): Promise<void> {
  if (!isEnabled) return;

  try {
    const sound = await loadSound(source, key);
    if (sound) {
      await sound.setPositionAsync(0);
      await sound.setVolumeAsync(volume);
      await sound.playAsync();
    }
  } catch {
    // Graceful degradation - sound file may not exist
    // Haptic feedback will still work
  }
}

/**
 * Unload all cached sounds
 * Call this when app is closing or sounds need to be refreshed
 */
export async function unloadAllSounds(): Promise<void> {
  for (const sound of soundCache.values()) {
    try {
      await sound.unloadAsync();
    } catch {
      // Ignore unload errors
    }
  }
  soundCache.clear();
}

// ==========================================
// Sound Source Definitions
// Using try-catch pattern for optional sound files
// ==========================================

// Sound file mapping
// All sounds are CC0 licensed from OpenGameArt.org

const SOUND_FILES: Record<string, AVPlaybackSource> = {
  // Learn sounds
  correct: require('../assets/sounds/correct.wav'),
  wrong: require('../assets/sounds/wrong.wav'),
  'card-flip': require('../assets/sounds/card-flip.wav'),
  'level-up': require('../assets/sounds/level-up.wav'),
  achievement: require('../assets/sounds/achievement.wav'),

  // Game sounds (2048)
  'tile-move': require('../assets/sounds/tile-move.wav'),
  'tile-merge': require('../assets/sounds/tile-merge.wav'),
  'high-merge': require('../assets/sounds/high-merge.wav'),
  win: require('../assets/sounds/win.wav'),
  'game-over': require('../assets/sounds/game-over.wav'),

  // Todo sounds
  'task-complete': require('../assets/sounds/task-complete.wav'),
  delete: require('../assets/sounds/delete-sound.wav'),

  // UI sounds
  tap: require('../assets/sounds/tap.wav'),
  notification: require('../assets/sounds/notification.wav'),
};

/**
 * Get sound source by filename
 * Returns null if sound doesn't exist (graceful degradation)
 */
function getSoundSource(filename: string): AVPlaybackSource | null {
  return SOUND_FILES[filename] || null;
}

// ==========================================
// Game Sounds
// ==========================================

export const gameSounds = {
  /**
   * Play tile move sound
   */
  tileMove: async (): Promise<void> => {
    const source = getSoundSource('tile-move');
    if (source) await playSound(source, 'tile-move', 0.3);
  },

  /**
   * Play tile merge sound
   */
  tileMerge: async (): Promise<void> => {
    const source = getSoundSource('tile-merge');
    if (source) await playSound(source, 'tile-merge', 0.5);
  },

  /**
   * Play high value merge sound (512+)
   */
  highValueMerge: async (): Promise<void> => {
    const source = getSoundSource('high-merge');
    if (source) await playSound(source, 'high-merge', 0.6);
  },

  /**
   * Play game over sound
   */
  gameOver: async (): Promise<void> => {
    const source = getSoundSource('game-over');
    if (source) await playSound(source, 'game-over', 0.7);
  },

  /**
   * Play win sound
   */
  win: async (): Promise<void> => {
    const source = getSoundSource('win');
    if (source) await playSound(source, 'win', 0.8);
  },
};

// ==========================================
// Learn Sounds
// ==========================================

export const learnSounds = {
  /**
   * Play correct answer sound
   */
  correct: async (): Promise<void> => {
    const source = getSoundSource('correct');
    if (source) await playSound(source, 'correct', 0.5);
  },

  /**
   * Play wrong answer sound
   */
  wrong: async (): Promise<void> => {
    const source = getSoundSource('wrong');
    if (source) await playSound(source, 'wrong', 0.4);
  },

  /**
   * Play card flip sound
   */
  cardFlip: async (): Promise<void> => {
    const source = getSoundSource('card-flip');
    if (source) await playSound(source, 'card-flip', 0.3);
  },

  /**
   * Play level up sound
   */
  levelUp: async (): Promise<void> => {
    const source = getSoundSource('level-up');
    if (source) await playSound(source, 'level-up', 0.7);
  },

  /**
   * Play achievement sound
   */
  achievement: async (): Promise<void> => {
    const source = getSoundSource('achievement');
    if (source) await playSound(source, 'achievement', 0.6);
  },
};

// ==========================================
// Todo Sounds
// ==========================================

export const todoSounds = {
  /**
   * Play task complete sound
   */
  complete: async (): Promise<void> => {
    const source = getSoundSource('task-complete');
    if (source) await playSound(source, 'task-complete', 0.4);
  },

  /**
   * Play task delete sound
   */
  delete: async (): Promise<void> => {
    const source = getSoundSource('delete');
    if (source) await playSound(source, 'delete', 0.3);
  },
};

// ==========================================
// UI Sounds
// ==========================================

export const uiSounds = {
  /**
   * Play button tap sound
   */
  tap: async (): Promise<void> => {
    const source = getSoundSource('tap');
    if (source) await playSound(source, 'tap', 0.2);
  },

  /**
   * Play notification sound
   */
  notification: async (): Promise<void> => {
    const source = getSoundSource('notification');
    if (source) await playSound(source, 'notification', 0.5);
  },
};

export default {
  initialize: initializeAudio,
  setEnabled: setSoundEnabled,
  isEnabled: isSoundEnabled,
  unloadAll: unloadAllSounds,
  game: gameSounds,
  learn: learnSounds,
  todo: todoSounds,
  ui: uiSounds,
};

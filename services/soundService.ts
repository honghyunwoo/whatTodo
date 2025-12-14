import { Audio, AVPlaybackSource } from 'expo-av';
import { Platform } from 'react-native';

/**
 * Sound service for playing audio feedback throughout the app
 * Note: Sound files need to be added to assets/sounds/
 */

// Sound cache to avoid reloading
const soundCache: Map<string, Audio.Sound> = new Map();

// Track if audio is enabled
let isEnabled = true;

/**
 * Initialize audio session
 * Call this once at app startup
 */
export async function initializeAudio(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false, // Respect silent mode
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
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
  } catch (error) {
    console.warn(`Failed to load sound: ${key}`, error);
    return null;
  }
}

/**
 * Play a sound from cache or load it first
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
  } catch (error) {
    console.warn(`Failed to play sound: ${key}`, error);
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
    } catch (error) {
      // Ignore unload errors
    }
  }
  soundCache.clear();
}

// ==========================================
// Placeholder Sound Functions
// These functions are ready to use once sound files are added
// ==========================================

// Game sounds - add actual sound files to enable
export const gameSounds = {
  /**
   * Play tile move sound
   * Add: assets/sounds/tile-move.mp3
   */
  tileMove: async (): Promise<void> => {
    // Uncomment when sound file is added:
    // await playSound(require('@/assets/sounds/tile-move.mp3'), 'tile-move', 0.3);
  },

  /**
   * Play tile merge sound
   * Add: assets/sounds/tile-merge.mp3
   */
  tileMerge: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/tile-merge.mp3'), 'tile-merge', 0.5);
  },

  /**
   * Play high value merge sound (512+)
   * Add: assets/sounds/high-merge.mp3
   */
  highValueMerge: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/high-merge.mp3'), 'high-merge', 0.6);
  },

  /**
   * Play game over sound
   * Add: assets/sounds/game-over.mp3
   */
  gameOver: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/game-over.mp3'), 'game-over', 0.7);
  },

  /**
   * Play win sound
   * Add: assets/sounds/win.mp3
   */
  win: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/win.mp3'), 'win', 0.8);
  },
};

// Learn sounds
export const learnSounds = {
  /**
   * Play correct answer sound
   * Add: assets/sounds/correct.mp3
   */
  correct: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/correct.mp3'), 'correct', 0.5);
  },

  /**
   * Play wrong answer sound
   * Add: assets/sounds/wrong.mp3
   */
  wrong: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/wrong.mp3'), 'wrong', 0.4);
  },

  /**
   * Play card flip sound
   * Add: assets/sounds/card-flip.mp3
   */
  cardFlip: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/card-flip.mp3'), 'card-flip', 0.3);
  },

  /**
   * Play level up sound
   * Add: assets/sounds/level-up.mp3
   */
  levelUp: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/level-up.mp3'), 'level-up', 0.7);
  },

  /**
   * Play achievement sound
   * Add: assets/sounds/achievement.mp3
   */
  achievement: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/achievement.mp3'), 'achievement', 0.6);
  },
};

// Todo sounds
export const todoSounds = {
  /**
   * Play task complete sound
   * Add: assets/sounds/task-complete.mp3
   */
  complete: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/task-complete.mp3'), 'task-complete', 0.4);
  },

  /**
   * Play task delete sound
   * Add: assets/sounds/delete.mp3
   */
  delete: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/delete.mp3'), 'delete', 0.3);
  },
};

// UI sounds
export const uiSounds = {
  /**
   * Play button tap sound
   * Add: assets/sounds/tap.mp3
   */
  tap: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/tap.mp3'), 'tap', 0.2);
  },

  /**
   * Play notification sound
   * Add: assets/sounds/notification.mp3
   */
  notification: async (): Promise<void> => {
    // await playSound(require('@/assets/sounds/notification.mp3'), 'notification', 0.5);
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

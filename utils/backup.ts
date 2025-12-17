import AsyncStorage from '@react-native-async-storage/async-storage';

import { STORAGE_KEYS } from '@/constants/storage';

export const BACKUP_KEYS = [
  STORAGE_KEYS.TASKS,
  STORAGE_KEYS.SETTINGS,
  `${STORAGE_KEYS.SETTINGS}/game`,
  STORAGE_KEYS.LEARN_PROGRESS,
  STORAGE_KEYS.THEME,
  STORAGE_KEYS.REWARDS,
  `${STORAGE_KEYS.REWARDS}_user`,
  STORAGE_KEYS.GAME_THEMES,
  STORAGE_KEYS.SRS,
  STORAGE_KEYS.JOURNAL,
] as const;

export type BackupPayload = Record<string, string | null>;

export async function createBackup(): Promise<BackupPayload> {
  const entries = await AsyncStorage.multiGet(BACKUP_KEYS);

  return entries.reduce<BackupPayload>((result, [key, value]) => {
    result[key] = value ?? null;
    return result;
  }, {});
}

export async function restoreBackup(payload: BackupPayload): Promise<void> {
  const toSet: [string, string][] = [];
  const toRemove: string[] = [];

  Object.entries(payload).forEach(([key, value]) => {
    if (value === null || value === undefined) {
      toRemove.push(key);
      return;
    }

    toSet.push([key, value]);
  });

  if (toSet.length) {
    await AsyncStorage.multiSet(toSet);
  }

  if (toRemove.length) {
    await AsyncStorage.multiRemove(toRemove);
  }
}

export async function clearBackupTargets(): Promise<void> {
  await AsyncStorage.multiRemove(BACKUP_KEYS);
}

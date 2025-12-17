import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

import { STORAGE_KEYS } from '@/constants/storage';
import { useGameStore } from '@/store/gameStore';
import { useJournalStore } from '@/store/journalStore';
import { useLearnStore } from '@/store/learnStore';
import { useRewardStore } from '@/store/rewardStore';
import { useSrsStore } from '@/store/srsStore';
import { useStreakStore } from '@/store/streakStore';
import { useTaskStore } from '@/store/taskStore';
import { useUserStore } from '@/store/userStore';

const BACKUP_KEYS = [
  STORAGE_KEYS.TASKS,
  STORAGE_KEYS.LEARN_PROGRESS,
  STORAGE_KEYS.REWARDS,
  `${STORAGE_KEYS.REWARDS}_streak`,
  `${STORAGE_KEYS.REWARDS}_user`,
  STORAGE_KEYS.SRS || 'srs-storage',
  STORAGE_KEYS.JOURNAL,
  `${STORAGE_KEYS.SETTINGS}/game`,
];

const PERSISTED_STORES = [
  useTaskStore,
  useLearnStore,
  useRewardStore,
  useStreakStore,
  useSrsStore,
  useJournalStore,
  useUserStore,
  useGameStore,
];

export type BackupSnapshot = Record<string, string>;

export async function exportBackup(): Promise<BackupSnapshot> {
  const entries = await AsyncStorage.multiGet(BACKUP_KEYS);
  const snapshotEntries = entries
    .filter(([, value]) => value !== null)
    .map(([key, value]) => [key, value ?? '']);

  return Object.fromEntries(snapshotEntries);
}

export async function importBackup(snapshot: BackupSnapshot) {
  const entries = Object.entries(snapshot);

  if (entries.length === 0) {
    Alert.alert('복원 완료', '앱 재시작 없이 즉시 반영');
    return;
  }

  await AsyncStorage.multiSet(entries);
  await rehydratePersistedStores();
  Alert.alert('복원 완료', '앱 재시작 없이 즉시 반영');
}

export async function rehydratePersistedStores() {
  const rehydratePromises = PERSISTED_STORES.map((store) => store.persist?.rehydrate?.()).filter(
    (promise): promise is Promise<void> => Boolean(promise),
  );

  await Promise.all(rehydratePromises);
}

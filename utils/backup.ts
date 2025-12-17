import AsyncStorage from '@react-native-async-storage/async-storage';

import appConfig from '@/app.json';
import { STORAGE_KEYS } from '@/constants/storage';
import { useJournalStore } from '@/store/journalStore';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useTaskStore } from '@/store/taskStore';

const BACKUP_KEYS = [
  STORAGE_KEYS.JOURNAL,
  STORAGE_KEYS.TASKS,
  STORAGE_KEYS.LEARN_PROGRESS,
  STORAGE_KEYS.SRS,
  STORAGE_KEYS.SETTINGS,
] as const;

export const BACKUP_SCHEMA_VERSION = 1;

export type BackupMetadata = {
  appVersion: string;
  timestamp: string;
  schemaVersion: number;
};

export type BackupPayload = {
  metadata: BackupMetadata;
  data: Record<string, string | null>;
};

const getAppVersion = () => appConfig.expo?.version ?? 'unknown';

export async function exportBackup(): Promise<BackupPayload> {
  const entries = await AsyncStorage.multiGet(BACKUP_KEYS as unknown as string[]);
  const data: Record<string, string | null> = {};

  entries.forEach(([key, value]) => {
    data[key] = value ?? null;
  });

  return {
    metadata: {
      appVersion: getAppVersion(),
      timestamp: new Date().toISOString(),
      schemaVersion: BACKUP_SCHEMA_VERSION,
    },
    data,
  };
}

function isBackupPayload(payload: any): payload is BackupPayload {
  return (
    payload &&
    typeof payload === 'object' &&
    payload.metadata &&
    typeof payload.metadata.appVersion === 'string' &&
    typeof payload.metadata.timestamp === 'string' &&
    typeof payload.metadata.schemaVersion === 'number' &&
    payload.data &&
    typeof payload.data === 'object'
  );
}

function ensureValidBackup(payload: BackupPayload) {
  if (payload.metadata.schemaVersion !== BACKUP_SCHEMA_VERSION) {
    throw new Error('호환되지 않는 백업 버전입니다. 최신 버전으로 다시 백업해주세요.');
  }
}

export async function restoreBackup(input: string | BackupPayload): Promise<void> {
  const parsed: BackupPayload = typeof input === 'string' ? JSON.parse(input) : input;

  if (!isBackupPayload(parsed)) {
    throw new Error('백업 형식이 올바르지 않습니다.');
  }

  ensureValidBackup(parsed);

  const entries = Object.entries(parsed.data).filter(([key]) =>
    (BACKUP_KEYS as unknown as string[]).includes(key)
  );

  await Promise.all(
    entries.map(async ([key, value]) => {
      if (value === null) {
        await AsyncStorage.removeItem(key);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    })
  );

  await rehydratePersistedStores();
}

export async function rehydratePersistedStores(): Promise<void> {
  await Promise.all([
    useJournalStore.persist?.rehydrate?.(),
    useTaskStore.persist?.rehydrate?.(),
    useLearnStore.persist?.rehydrate?.(),
    useSrsStore.persist?.rehydrate?.(),
  ]);
}

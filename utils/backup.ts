import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import appConfig from '@/app.json';
import { STORAGE_KEYS } from '@/constants/storage';
import { useJournalStore } from '@/store/journalStore';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useTaskStore } from '@/store/taskStore';
import { BackupError } from '@/utils/errorHandler';

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

/**
 * 백업 파일을 파일로 저장하고 공유
 *
 * @returns 저장된 파일 경로
 */
export async function saveBackupToFile(): Promise<string> {
  try {
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);

    const date = new Date().toISOString().split('T')[0];
    const filename = `whatTodo-백업-${date}.json`;

    // 새로운 API: Paths.document를 사용
    const file = new File(Paths.document, filename);
    await file.write(json);

    const uri = file.uri;

    // 공유 가능 여부 확인
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: 'whatTodo 백업 파일 저장',
        UTI: 'public.json',
      });
    }

    return uri;
  } catch (error) {
    if (error instanceof BackupError) {
      throw error;
    }
    throw new BackupError('백업 파일 저장에 실패했습니다.', { originalError: error });
  }
}

/**
 * 파일에서 백업 불러오기
 *
 * @returns 백업 데이터 (사용자가 취소하면 null)
 */
export async function loadBackupFromFile(): Promise<BackupPayload | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null; // 사용자가 취소
    }

    if (!result.assets || result.assets.length === 0) {
      throw new BackupError('파일을 선택하지 않았습니다.');
    }

    const fileUri = result.assets[0].uri;

    // 새로운 API: File 클래스 사용
    const file = new File(fileUri);
    const content = await file.text();

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseError) {
      throw new BackupError('백업 파일 형식이 올바르지 않습니다.\nJSON 형식을 확인해주세요.', {
        originalError: parseError,
      });
    }

    if (!isBackupPayload(parsed)) {
      throw new BackupError(
        '백업 파일 구조가 올바르지 않습니다.\nwhatTodo 백업 파일인지 확인해주세요.'
      );
    }

    return parsed;
  } catch (error) {
    if (error instanceof BackupError) {
      throw error;
    }
    throw new BackupError('백업 파일을 불러오는데 실패했습니다.', { originalError: error });
  }
}

/**
 * 파일에서 백업을 불러와 복원
 */
export async function restoreBackupFromFile(): Promise<boolean> {
  const backup = await loadBackupFromFile();

  if (!backup) {
    return false; // 사용자가 취소
  }

  await restoreBackup(backup);
  return true;
}

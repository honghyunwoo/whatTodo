import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import appConfig from '@/app.json';
import { STORAGE_KEYS } from '@/constants/storage';
import { useDiaryStore } from '@/store/diaryStore';
import { useJournalStore } from '@/store/journalStore';
import { useLearnStore } from '@/store/learnStore';
import { useSrsStore } from '@/store/srsStore';
import { useTaskStore } from '@/store/taskStore';
import { useUserStore, USER_STORE_STORAGE_KEY } from '@/store/userStore';
import { onBackupFailed, onBackupSuccess } from '@/store/backupStore';
import { BackupError } from '@/utils/errorHandler';

const BACKUP_KEYS = [
  STORAGE_KEYS.JOURNAL,
  STORAGE_KEYS.DIARY,
  STORAGE_KEYS.TASKS,
  STORAGE_KEYS.LEARN_PROGRESS,
  STORAGE_KEYS.SRS,
  USER_STORE_STORAGE_KEY,
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

/**
 * 자동 백업 설정
 */
export type AutoBackupSettings = {
  enabled: boolean;
  intervalHours: number; // 자동 백업 주기 (시간 단위)
  maxBackups: number; // 최대 백업 파일 개수
};

/**
 * 기본 자동 백업 설정
 */
export const DEFAULT_AUTO_BACKUP_SETTINGS: AutoBackupSettings = {
  enabled: true,
  intervalHours: 24, // 1일 1회
  maxBackups: 7, // 최근 7개 보관
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
    useDiaryStore.persist?.rehydrate?.(),
    useTaskStore.persist?.rehydrate?.(),
    useLearnStore.persist?.rehydrate?.(),
    useSrsStore.persist?.rehydrate?.(),
    useUserStore.persist?.rehydrate?.(),
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

// ============================================================================
// 자동 백업 기능
// ============================================================================

/**
 * 자동 백업 설정 로드
 */
export async function getAutoBackupSettings(): Promise<AutoBackupSettings> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_BACKUP_SETTINGS);
    if (!stored) {
      return DEFAULT_AUTO_BACKUP_SETTINGS;
    }
    return JSON.parse(stored);
  } catch (error) {
    console.warn('자동 백업 설정 로드 실패, 기본값 사용:', error);
    return DEFAULT_AUTO_BACKUP_SETTINGS;
  }
}

/**
 * 자동 백업 설정 저장
 */
export async function saveAutoBackupSettings(settings: AutoBackupSettings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTO_BACKUP_SETTINGS, JSON.stringify(settings));
}

/**
 * 마지막 백업 시간 가져오기
 */
export async function getLastBackupTime(): Promise<Date | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.LAST_BACKUP_TIME);
    return stored ? new Date(stored) : null;
  } catch (error) {
    console.warn('마지막 백업 시간 로드 실패:', error);
    return null;
  }
}

/**
 * 마지막 백업 시간 저장
 */
export async function setLastBackupTime(time: Date): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.LAST_BACKUP_TIME, time.toISOString());
}

/**
 * 자동 백업이 필요한지 확인
 */
export async function shouldAutoBackup(): Promise<boolean> {
  const settings = await getAutoBackupSettings();

  if (!settings.enabled) {
    return false;
  }

  const lastBackupTime = await getLastBackupTime();

  if (!lastBackupTime) {
    return true; // 한 번도 백업하지 않았으면 백업 필요
  }

  const now = new Date();
  const hoursSinceLastBackup = (now.getTime() - lastBackupTime.getTime()) / (1000 * 60 * 60);

  return hoursSinceLastBackup >= settings.intervalHours;
}

/**
 * 자동 백업 실행 (백그라운드, 사용자 개입 없음)
 */
export async function performAutoBackup(): Promise<void> {
  try {
    const backup = await exportBackup();
    const json = JSON.stringify(backup, null, 2);

    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, -5); // 2025-12-24T12-30-45
    const filename = `whatTodo-auto-${timestamp}.json`;

    // 자동 백업은 캐시 디렉토리에 저장 (공유 안 함)
    const file = new File(Paths.cache, filename);
    await file.write(json);

    // 마지막 백업 시간 업데이트
    await setLastBackupTime(now);

    // 오래된 백업 파일 정리
    await cleanupOldBackups();

    // 백업 성공 알림 (UI에 표시하지 않고 상태만 업데이트)
    onBackupSuccess();
  } catch (error) {
    console.error('자동 백업 실패:', error);

    // 백업 실패 알림 (사용자에게 알림)
    onBackupFailed(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * 오래된 자동 백업 파일 삭제
 */
async function cleanupOldBackups(): Promise<void> {
  try {
    const settings = await getAutoBackupSettings();
    const cacheDir = Paths.cache;

    // 캐시 디렉토리의 모든 파일 목록 가져오기
    const files = await cacheDir.list();

    // 자동 백업 파일만 필터링 (whatTodo-auto-*.json)
    const backupFiles = files
      .filter((file) => {
        if (file instanceof File) {
          return file.name.startsWith('whatTodo-auto-') && file.name.endsWith('.json');
        }
        return false;
      })
      .map((file) => file as File);

    // 파일이 maxBackups보다 많으면 오래된 것부터 삭제
    if (backupFiles.length > settings.maxBackups) {
      // 파일명으로 정렬 (타임스탬프가 파일명에 포함되어 있음)
      backupFiles.sort((a, b) => a.name.localeCompare(b.name));

      const filesToDelete = backupFiles.slice(0, backupFiles.length - settings.maxBackups);

      await Promise.all(filesToDelete.map((file) => file.delete()));
    }
  } catch (error) {
    console.warn('오래된 백업 파일 정리 실패:', error);
    // 정리 실패는 조용히 처리
  }
}

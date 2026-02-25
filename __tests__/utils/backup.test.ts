/**
 * Backup/Restore Tests
 *
 * @created 2025-12-24 - Phase 1.2: Critical Path 테스트 작성
 *
 * CRITICAL: 백업/복원 실패 시 사용자 데이터 손실!
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { exportBackup, restoreBackup, BACKUP_SCHEMA_VERSION, BackupPayload } from '@/utils/backup';
import { STORAGE_KEYS } from '@/constants/storage';

const USER_STORE_KEY = STORAGE_KEYS.REWARDS + '_user';

// Mock stores
jest.mock('@/store/journalStore', () => ({
  useJournalStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
}));

jest.mock('@/store/taskStore', () => ({
  useTaskStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
}));

jest.mock('@/store/diaryStore', () => ({
  useDiaryStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
}));

jest.mock('@/store/userStore', () => ({
  useUserStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
  USER_STORE_STORAGE_KEY: '@whatTodo:rewards_user',
}));

jest.mock('@/store/learnStore', () => ({
  useLearnStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
}));

jest.mock('@/store/srsStore', () => ({
  useSrsStore: {
    persist: {
      rehydrate: jest.fn(),
    },
  },
}));

describe('백업 시스템', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    AsyncStorage.clear();
  });

  describe('exportBackup', () => {
    it('metadata를 포함한 백업 데이터 생성', async () => {
      // Setup: 일부 데이터 저장
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify({ tasks: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify({ entries: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify({ entries: [] }));
      await AsyncStorage.setItem(USER_STORE_KEY, JSON.stringify({ weddingDate: '2026-12-12' }));

      const backup = await exportBackup();

      // metadata 확인
      expect(backup.metadata).toBeDefined();
      expect(backup.metadata.appVersion).toBeDefined();
      expect(backup.metadata.timestamp).toBeDefined();
      expect(backup.metadata.schemaVersion).toBe(BACKUP_SCHEMA_VERSION);

      // data 확인
      expect(backup.data).toBeDefined();
      expect(typeof backup.data).toBe('object');
    });

    it('모든 BACKUP_KEYS에 해당하는 데이터 export', async () => {
      // Setup
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify({ tasks: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify({ entries: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify({ entries: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.LEARN_PROGRESS, JSON.stringify({ progress: [] }));
      await AsyncStorage.setItem(STORAGE_KEYS.SRS, JSON.stringify({ words: [] }));
      await AsyncStorage.setItem(USER_STORE_KEY, JSON.stringify({ weddingDate: '2026-12-12' }));
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ theme: 'light' }));

      const backup = await exportBackup();

      // 모든 키가 포함되어 있는지 확인
      expect(backup.data[STORAGE_KEYS.TASKS]).toBeDefined();
      expect(backup.data[STORAGE_KEYS.JOURNAL]).toBeDefined();
      expect(backup.data[STORAGE_KEYS.DIARY]).toBeDefined();
      expect(backup.data[STORAGE_KEYS.LEARN_PROGRESS]).toBeDefined();
      expect(backup.data[STORAGE_KEYS.SRS]).toBeDefined();
      expect(backup.data[USER_STORE_KEY]).toBeDefined();
      expect(backup.data[STORAGE_KEYS.SETTINGS]).toBeDefined();
    });

    it('데이터가 없으면 null 값 포함', async () => {
      // 빈 AsyncStorage
      const backup = await exportBackup();

      // 모든 데이터가 null이어야 함
      expect(backup.data[STORAGE_KEYS.TASKS]).toBeNull();
      expect(backup.data[STORAGE_KEYS.JOURNAL]).toBeNull();
      expect(backup.data[STORAGE_KEYS.DIARY]).toBeNull();
      expect(backup.data[USER_STORE_KEY]).toBeNull();
    });

    it('timestamp는 ISO 8601 형식', async () => {
      const backup = await exportBackup();

      const timestamp = new Date(backup.metadata.timestamp);
      expect(timestamp.toISOString()).toBe(backup.metadata.timestamp);
    });
  });

  describe('restoreBackup', () => {
    it('유효한 백업 payload 복원 성공', async () => {
      const validBackup: BackupPayload = {
        metadata: {
          appVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: {
          [STORAGE_KEYS.TASKS]: JSON.stringify({ tasks: [{ id: '1', title: 'Test' }] }),
          [STORAGE_KEYS.JOURNAL]: JSON.stringify({ entries: [] }),
          [STORAGE_KEYS.DIARY]: JSON.stringify({ entries: [] }),
          [STORAGE_KEYS.LEARN_PROGRESS]: null,
          [STORAGE_KEYS.SRS]: null,
          [USER_STORE_KEY]: JSON.stringify({ weddingDate: '2026-12-12' }),
          [STORAGE_KEYS.SETTINGS]: null,
        },
      };

      await restoreBackup(validBackup);

      // AsyncStorage에 저장되었는지 확인
      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      expect(tasks).toBe(validBackup.data[STORAGE_KEYS.TASKS]);

      const journal = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL);
      expect(journal).toBe(validBackup.data[STORAGE_KEYS.JOURNAL]);
    });

    it('JSON 문자열로 전달된 백업도 복원 가능', async () => {
      const validBackup: BackupPayload = {
        metadata: {
          appVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: {
          [STORAGE_KEYS.TASKS]: JSON.stringify({ tasks: [] }),
          [STORAGE_KEYS.JOURNAL]: null,
          [STORAGE_KEYS.DIARY]: null,
          [STORAGE_KEYS.LEARN_PROGRESS]: null,
          [STORAGE_KEYS.SRS]: null,
          [USER_STORE_KEY]: null,
          [STORAGE_KEYS.SETTINGS]: null,
        },
      };

      const backupString = JSON.stringify(validBackup);

      await restoreBackup(backupString);

      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      expect(tasks).toBe(validBackup.data[STORAGE_KEYS.TASKS]);
    });

    it('null 값은 AsyncStorage에서 제거', async () => {
      // 먼저 데이터 저장
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify({ tasks: [] }));

      const backupWithNull: BackupPayload = {
        metadata: {
          appVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          schemaVersion: BACKUP_SCHEMA_VERSION,
        },
        data: {
          [STORAGE_KEYS.TASKS]: null, // null로 복원
          [STORAGE_KEYS.JOURNAL]: null,
          [STORAGE_KEYS.DIARY]: null,
          [STORAGE_KEYS.LEARN_PROGRESS]: null,
          [STORAGE_KEYS.SRS]: null,
          [USER_STORE_KEY]: null,
          [STORAGE_KEYS.SETTINGS]: null,
        },
      };

      await restoreBackup(backupWithNull);

      const tasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      expect(tasks).toBeNull();
    });

    it('잘못된 형식의 백업 거부', async () => {
      const invalidBackup = {
        invalid: 'data',
      };

      await expect(restoreBackup(invalidBackup as any)).rejects.toThrow(
        '백업 형식이 올바르지 않습니다'
      );
    });

    it('metadata 없는 백업 거부', async () => {
      const invalidBackup = {
        data: {
          [STORAGE_KEYS.TASKS]: JSON.stringify({ tasks: [] }),
        },
      };

      await expect(restoreBackup(invalidBackup as any)).rejects.toThrow();
    });

    it('잘못된 schemaVersion 거부', async () => {
      const invalidVersionBackup: BackupPayload = {
        metadata: {
          appVersion: '1.0.0',
          timestamp: new Date().toISOString(),
          schemaVersion: 999, // 잘못된 버전
        },
        data: {
          [STORAGE_KEYS.TASKS]: JSON.stringify({ tasks: [] }),
          [STORAGE_KEYS.JOURNAL]: null,
          [STORAGE_KEYS.DIARY]: null,
          [STORAGE_KEYS.LEARN_PROGRESS]: null,
          [STORAGE_KEYS.SRS]: null,
          [USER_STORE_KEY]: null,
          [STORAGE_KEYS.SETTINGS]: null,
        },
      };

      await expect(restoreBackup(invalidVersionBackup)).rejects.toThrow('호환되지 않는 백업 버전');
    });

    it('잘못된 JSON 문자열 거부', async () => {
      const invalidJson = '{ invalid json }';

      await expect(restoreBackup(invalidJson)).rejects.toThrow();
    });

    it('빈 문자열 거부', async () => {
      await expect(restoreBackup('')).rejects.toThrow();
    });
  });

  describe('백업 & 복원 통합 테스트', () => {
    it('export 후 restore하면 동일한 데이터', async () => {
      // 1. 초기 데이터 저장
      const originalTasks = { tasks: [{ id: '1', title: 'Original Task' }] };
      const originalJournal = { entries: [{ id: '1', content: 'Original Entry' }] };

      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(originalTasks));
      await AsyncStorage.setItem(STORAGE_KEYS.JOURNAL, JSON.stringify(originalJournal));

      // 2. Export
      const backup = await exportBackup();

      // 3. 데이터 삭제
      await AsyncStorage.clear();

      // 4. Restore
      await restoreBackup(backup);

      // 5. 복원된 데이터 확인
      const restoredTasks = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      const restoredJournal = await AsyncStorage.getItem(STORAGE_KEYS.JOURNAL);

      expect(JSON.parse(restoredTasks!)).toEqual(originalTasks);
      expect(JSON.parse(restoredJournal!)).toEqual(originalJournal);
    });

    it('다이어리 사진 메타데이터 backup/restore roundtrip 유지', async () => {
      const originalDiary = {
        state: {
          entries: [
            {
              id: 'd1',
              date: '2026-02-24',
              title: '사진 일기',
              content: '테스트',
              photos: [
                {
                  id: 'p1',
                  uri: 'content://media/external/images/media/1',
                  fileName: 'sample.jpg',
                  mimeType: 'image/jpeg',
                  size: 1024,
                  addedAt: new Date().toISOString(),
                },
              ],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          tags: [],
          streak: 0,
          longestStreak: 0,
          lastEntryDate: null,
        },
        version: 0,
      };

      await AsyncStorage.setItem(STORAGE_KEYS.DIARY, JSON.stringify(originalDiary));
      const backup = await exportBackup();
      await AsyncStorage.clear();
      await restoreBackup(backup);

      const restoredDiary = await AsyncStorage.getItem(STORAGE_KEYS.DIARY);
      expect(JSON.parse(restoredDiary!)).toEqual(originalDiary);
    });

    it('export -> JSON.stringify -> parse -> restore 순환', async () => {
      // 실제 사용 시나리오: 사용자가 JSON을 복사/붙여넣기
      const originalData = { tasks: [{ id: '1', title: 'Test' }] };
      await AsyncStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(originalData));

      // Export
      const backup = await exportBackup();

      // JSON으로 변환 (사용자가 복사)
      const backupString = JSON.stringify(backup, null, 2);

      // 데이터 삭제
      await AsyncStorage.clear();

      // Parse 후 restore (사용자가 붙여넣기)
      const parsed = JSON.parse(backupString);
      await restoreBackup(parsed);

      // 확인
      const restored = await AsyncStorage.getItem(STORAGE_KEYS.TASKS);
      expect(JSON.parse(restored!)).toEqual(originalData);
    });
  });
});

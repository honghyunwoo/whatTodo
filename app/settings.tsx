import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';

import {
  AutoBackupSettings,
  DEFAULT_AUTO_BACKUP_SETTINGS,
  exportBackup,
  getAutoBackupSettings,
  getLastBackupTime,
  restoreBackup,
  restoreBackupFromFile,
  saveAutoBackupSettings,
  saveBackupToFile,
} from '@/utils/backup';
import { showUserFriendlyError } from '@/utils/errorHandler';
import { resetOnboarding } from '@/utils/onboarding';

export default function SettingsScreen() {
  const [backupText, setBackupText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [autoBackupSettings, setAutoBackupSettings] = useState<AutoBackupSettings>(
    DEFAULT_AUTO_BACKUP_SETTINGS
  );
  const [lastBackupTime, setLastBackupTime] = useState<Date | null>(null);
  const router = useRouter();

  // 자동 백업 설정 로드
  useEffect(() => {
    loadAutoBackupSettings();
  }, []);

  const loadAutoBackupSettings = async () => {
    try {
      const settings = await getAutoBackupSettings();
      setAutoBackupSettings(settings);

      const lastTime = await getLastBackupTime();
      setLastBackupTime(lastTime);
    } catch (error) {
      console.error('자동 백업 설정 로드 실패:', error);
    }
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const backup = await exportBackup();
      const serialized = JSON.stringify(backup, null, 2);
      setBackupText(serialized);

      await Share.share({
        message: serialized,
        title: 'whatTodo 백업',
      });

      Alert.alert('백업 완료', 'JSON을 안전한 곳에 저장해주세요.');
    } catch (error) {
      showUserFriendlyError(error, '백업 내보내기');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async () => {
    if (!backupText.trim()) {
      Alert.alert('백업 없음', '붙여넣은 백업 JSON을 확인해주세요.');
      return;
    }

    try {
      setIsImporting(true);
      await restoreBackup(backupText);
      Alert.alert('복원 완료', '앱을 다시 실행하거나 탭을 전환하면 새 데이터가 적용됩니다.');
      router.back();
    } catch (error) {
      showUserFriendlyError(error, '백업 복원');
    } finally {
      setIsImporting(false);
    }
  };

  const handleSaveFile = async () => {
    try {
      setIsSavingFile(true);
      const filePath = await saveBackupToFile();
      Alert.alert(
        '✅ 백업 저장 완료',
        `백업 파일이 저장되었습니다.\n\n${filePath.split('/').pop()}\n\n공유 화면에서 원하는 위치에 저장하세요.`
      );
    } catch (error) {
      showUserFriendlyError(error, '백업 파일 저장');
    } finally {
      setIsSavingFile(false);
    }
  };

  const handleLoadFile = async () => {
    try {
      setIsLoadingFile(true);
      const success = await restoreBackupFromFile();

      if (success) {
        Alert.alert(
          '✅ 복원 완료',
          '백업이 복원되었습니다.\n앱을 다시 실행하거나 탭을 전환하면 새 데이터가 적용됩니다.'
        );
        router.back();
      }
      // success가 false면 사용자가 취소한 것이므로 아무것도 하지 않음
    } catch (error) {
      showUserFriendlyError(error, '백업 파일 불러오기');
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleToggleAutoBackup = async (enabled: boolean) => {
    try {
      const newSettings = { ...autoBackupSettings, enabled };
      await saveAutoBackupSettings(newSettings);
      setAutoBackupSettings(newSettings);

      Alert.alert(
        enabled ? '자동 백업 활성화' : '자동 백업 비활성화',
        enabled
          ? `앱 시작 시 자동으로 백업이 생성됩니다.\n주기: ${autoBackupSettings.intervalHours}시간마다`
          : '자동 백업이 비활성화되었습니다.'
      );
    } catch (error) {
      showUserFriendlyError(error, '자동 백업 설정');
    }
  };

  const formatLastBackupTime = () => {
    if (!lastBackupTime) return '없음';

    const now = new Date();
    const diff = now.getTime() - lastBackupTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}일 전`;
    } else if (hours > 0) {
      return `${hours}시간 전`;
    } else {
      return '방금 전';
    }
  };

  const handleResetOnboarding = async () => {
    Alert.alert(
      '온보딩 재설정',
      '온보딩 화면을 다시 보시겠습니까?\n앱을 재시작하면 온보딩이 다시 표시됩니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '재설정',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetOnboarding();
              Alert.alert('완료', '온보딩이 재설정되었습니다.\n앱을 재시작해주세요.');
            } catch (error) {
              showUserFriendlyError(error, '온보딩 재설정');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>백업 & 복원</Text>
      <Text style={styles.subtitle}>데이터를 안전하게 백업하고 복원할 수 있습니다.</Text>

      {/* 자동 백업 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ 자동 백업 설정</Text>
        <Text style={styles.hint}>
          앱 시작 시 자동으로 백업을 생성합니다. (최근 {autoBackupSettings.maxBackups}개 보관)
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>자동 백업 활성화</Text>
            <Text style={styles.settingHint}>
              {autoBackupSettings.intervalHours}시간마다 자동 백업
            </Text>
          </View>
          <Switch
            value={autoBackupSettings.enabled}
            onValueChange={handleToggleAutoBackup}
            trackColor={{ false: '#ccc', true: '#4CAF50' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>마지막 백업:</Text>
          <Text style={styles.infoValue}>{formatLastBackupTime()}</Text>
        </View>
      </View>

      {/* 파일로 백업/복원 (권장) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📁 파일로 저장/불러오기 (권장)</Text>
        <Text style={styles.hint}>가장 편리하고 안전한 방법입니다.</Text>

        <Button
          title={isSavingFile ? '저장 중...' : '💾 파일로 백업 저장'}
          onPress={handleSaveFile}
          disabled={isSavingFile || isLoadingFile}
          color="#4CAF50"
        />

        <View style={styles.buttonSpacing} />

        <Button
          title={isLoadingFile ? '불러오는 중...' : '📂 파일에서 복원'}
          onPress={handleLoadFile}
          disabled={isSavingFile || isLoadingFile}
          color="#2196F3"
        />
      </View>

      {/* JSON 텍스트로 백업/복원 (고급) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 JSON 텍스트 (고급 사용자용)</Text>

        <Button
          title={isExporting ? '내보내는 중...' : '백업 내보내기'}
          onPress={handleExport}
          disabled={isExporting || isImporting}
        />
        <Text style={styles.hint}>JSON을 복사해서 안전한 곳에 저장하세요.</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>백업 JSON 붙여넣기</Text>
        <TextInput
          multiline
          value={backupText}
          onChangeText={setBackupText}
          style={styles.input}
          placeholder="여기에 백업 JSON을 붙여주세요"
          textAlignVertical="top"
        />
        <Button
          title={isImporting ? '복원 중...' : '백업 불러오기'}
          onPress={handleImport}
          disabled={isImporting}
        />
        <Text style={styles.hint}>
          복원 후에는 앱을 재시작하거나 탭을 전환해 새 상태를 불러옵니다.
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>💡 백업에 포함되는 데이터</Text>
        <Text style={styles.infoText}>• 학습 기록 (일지, 진도)</Text>
        <Text style={styles.infoText}>• 할 일 목록</Text>
        <Text style={styles.infoText}>• SRS 단어 복습 데이터</Text>
        <Text style={styles.infoText}>• 설정</Text>
      </View>

      {/* 기타 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 기타</Text>
        <Button title="온보딩 다시 보기" onPress={handleResetOnboarding} color="#FF9800" />
        <Text style={styles.hint}>앱을 재시작하면 온보딩 화면이 다시 표시됩니다.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  section: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
  },
  input: {
    minHeight: 160,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  buttonSpacing: {
    height: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 12,
  },
  infoBox: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1565C0',
    lineHeight: 20,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingHint: {
    fontSize: 12,
    color: '#666',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});

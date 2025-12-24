import React, { useState } from 'react';
import { Alert, Button, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import {
  exportBackup,
  restoreBackup,
  restoreBackupFromFile,
  saveBackupToFile,
} from '@/utils/backup';
import { showUserFriendlyError } from '@/utils/errorHandler';

export default function SettingsScreen() {
  const [backupText, setBackupText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isSavingFile, setIsSavingFile] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const router = useRouter();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>백업 & 복원</Text>
      <Text style={styles.subtitle}>데이터를 안전하게 백업하고 복원할 수 있습니다.</Text>

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
});

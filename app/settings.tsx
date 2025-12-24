import React, { useState } from 'react';
import { Alert, Button, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';

import { exportBackup, restoreBackup } from '@/utils/backup';
import { showUserFriendlyError } from '@/utils/errorHandler';

export default function SettingsScreen() {
  const [backupText, setBackupText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>백업 & 복원</Text>
      <Text style={styles.subtitle}>
        오프라인에서도 JSON으로 상태를 보관하고 필요할 때 붙여넣어 복원할 수 있습니다.
      </Text>

      <View style={styles.section}>
        <Button
          title={isExporting ? '내보내는 중...' : '백업 내보내기'}
          onPress={handleExport}
          disabled={isExporting || isImporting}
        />
        <Text style={styles.hint}>다이어리, 할 일, 학습, SRS, 설정 키가 모두 포함됩니다.</Text>
      </View>

      <View style={styles.section}>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  section: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f5f5f5',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
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
});

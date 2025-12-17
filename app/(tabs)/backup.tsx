import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { BACKUP_KEYS, clearBackupTargets, createBackup, restoreBackup } from '@/utils/backup';

export default function BackupScreen() {
  const { isDark } = useTheme();
  const [backupJson, setBackupJson] = useState('');
  const [status, setStatus] = useState('백업/복원 전 백업 데이터를 확인해주세요.');
  const [isProcessing, setIsProcessing] = useState(false);

  const hintText = useMemo(
    () =>
      [
        'Todo/학습 진행도/보상/저널/테마/게임 테마',
        '사용자 설정 및 게임 설정까지 함께 백업·복원됩니다.',
        '백업 파일은 안전한 곳에 보관하세요.',
      ].join('\n'),
    []
  );

  const handleBackup = async () => {
    setIsProcessing(true);
    try {
      const payload = await createBackup();
      setBackupJson(JSON.stringify(payload, null, 2));
      setStatus('백업이 완료되었습니다. 아래 JSON을 안전한 위치에 저장하세요.');
    } catch (error) {
      setStatus('백업 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const parsed = JSON.parse(backupJson);
      await restoreBackup(parsed);
      setStatus('백업 데이터로 복원되었습니다. 필요한 설정이 적용되었는지 확인하세요.');
    } catch (error) {
      setStatus('백업 JSON을 확인 후 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await clearBackupTargets();
      setStatus('백업 대상 데이터가 초기화되었습니다. 복원 기능으로 되돌릴 수 있습니다.');
    } catch (error) {
      setStatus('초기화 중 오류가 발생했습니다.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? COLORS.dark.background : COLORS.background }]}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.title}>데이터 백업 · 복원</Text>
      <Text style={styles.subtitle}>앱 데이터를 백업하고 필요할 때 복원할 수 있습니다.</Text>

      <View style={[styles.hintBox, { backgroundColor: isDark ? COLORS.dark.surface : COLORS.surface }]}>
        <Text style={styles.hintTitle}>백업/복원 안내</Text>
        <Text style={styles.hintText}>{hintText}</Text>
        <Text style={styles.hintKeysTitle}>대상 키 ({BACKUP_KEYS.length}개)</Text>
        <Text style={styles.hintText}>{BACKUP_KEYS.join('\n')}</Text>
      </View>

      <View style={styles.buttonRow}>
        <Button mode="contained" onPress={handleBackup} loading={isProcessing} disabled={isProcessing}>
          백업
        </Button>
        <Button mode="outlined" onPress={handleReset} disabled={isProcessing}>
          초기화
        </Button>
        <Button mode="contained-tonal" onPress={handleRestore} loading={isProcessing} disabled={isProcessing}>
          복원
        </Button>
      </View>

      <TextInput
        mode="outlined"
        label="백업 JSON"
        multiline
        value={backupJson}
        onChangeText={setBackupJson}
        placeholder="백업 버튼을 눌러 데이터를 생성하거나 붙여넣기 후 복원하세요."
        style={styles.input}
        underlineColor="transparent"
      />

      <Text style={styles.status}>{status}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  title: {
    fontSize: SIZES.fontSizes.xl,
    fontWeight: '700',
  },
  subtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSizes.md,
  },
  hintBox: {
    borderColor: COLORS.border,
    borderRadius: SIZES.radius.lg,
    borderWidth: 1,
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  hintTitle: {
    fontSize: SIZES.fontSizes.lg,
    fontWeight: '700',
  },
  hintText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSizes.md,
    lineHeight: 20,
  },
  hintKeysTitle: {
    fontSize: SIZES.fontSizes.md,
    fontWeight: '600',
    marginTop: SIZES.spacing.sm,
  },
  buttonRow: {
    columnGap: SIZES.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  input: {
    minHeight: 200,
  },
  status: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSizes.sm,
  },
});

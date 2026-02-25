import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { exportBackup, restoreBackup } from '@/utils/backup';
import { formatDateDot, getDdayLabel } from '@/utils/dday';
import { SIZES } from '@/constants/sizes';

type ThemeMode = 'light' | 'dark' | 'system';
const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

export default function SettingsScreen() {
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  // User settings
  const {
    dailyGoal,
    setDailyGoal,
    preferredLevel,
    setPreferredLevel,
    soundEnabled,
    toggleSound,
    hapticEnabled,
    toggleHaptic,
    weddingDate,
    setWeddingDate,
    reminderSettings,
    setReminderSettings,
  } = useUserStore();

  // Backup state
  const [backupText, setBackupText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showBackupInput, setShowBackupInput] = useState(false);

  // Time picker state
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showWeddingDatePicker, setShowWeddingDatePicker] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const backup = await exportBackup();
      const serialized = JSON.stringify(backup, null, 2);
      setBackupText(serialized);

      await Share.share({
        message: serialized,
        title: 'WhatTodo 백업',
      });

      Alert.alert('백업 완료', 'JSON을 안전한 곳에 저장해주세요.');
    } catch (error) {
      Alert.alert('백업 실패', (error as Error).message);
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
      Alert.alert('복원 완료', '앱을 다시 실행하면 새 데이터가 적용됩니다.');
      setBackupText('');
      setShowBackupInput(false);
    } catch (error) {
      Alert.alert('복원 실패', (error as Error).message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleTimeChange = (_: unknown, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      setReminderSettings({
        ...reminderSettings,
        hour: selectedDate.getHours(),
        minute: selectedDate.getMinutes(),
      });
    }
  };

  const formatDateToStorage = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseStorageDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleWeddingDateChange = (_: unknown, selectedDate?: Date) => {
    setShowWeddingDatePicker(false);
    if (selectedDate) {
      setWeddingDate(formatDateToStorage(selectedDate));
    }
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const ampm = hour >= 12 ? '오후' : '오전';
    return `${ampm} ${h}:${minute.toString().padStart(2, '0')}`;
  };

  const styles = createStyles(colors, isDark);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* 테마 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>테마</Text>
        <View style={styles.themeButtons}>
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.themeButton, themeMode === mode && styles.themeButtonActive]}
              onPress={() => setThemeMode(mode)}
            >
              <Ionicons
                name={mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'phone-portrait'}
                size={20}
                color={themeMode === mode ? '#fff' : colors.text}
              />
              <Text
                style={[styles.themeButtonText, themeMode === mode && styles.themeButtonTextActive]}
              >
                {mode === 'light' ? '라이트' : mode === 'dark' ? '다크' : '시스템'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* 학습 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>학습 설정</Text>

        {/* 일일 목표 */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="flag-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>일일 목표</Text>
          </View>
          <View style={styles.stepper}>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setDailyGoal(dailyGoal - 1)}
              disabled={dailyGoal <= 1}
            >
              <Ionicons
                name="remove"
                size={20}
                color={dailyGoal <= 1 ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.stepperValue}>{dailyGoal} 레슨</Text>
            <TouchableOpacity
              style={styles.stepperButton}
              onPress={() => setDailyGoal(dailyGoal + 1)}
              disabled={dailyGoal >= 20}
            >
              <Ionicons
                name="add"
                size={20}
                color={dailyGoal >= 20 ? colors.textSecondary : colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* 레벨 선택 */}
        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="school-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>학습 레벨</Text>
          </View>
          <View style={styles.levelButtons}>
            {LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.levelButton, preferredLevel === level && styles.levelButtonActive]}
                onPress={() => setPreferredLevel(level)}
              >
                <Text
                  style={[
                    styles.levelButtonText,
                    preferredLevel === level && styles.levelButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* 중요한 날짜 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>중요한 날짜</Text>

        <TouchableOpacity style={styles.row} onPress={() => setShowWeddingDatePicker(true)}>
          <View style={styles.rowLeft}>
            <Ionicons name="heart-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>결혼 날짜</Text>
          </View>
          <Text style={[styles.rowValue, !weddingDate && styles.rowValueMuted]}>
            {weddingDate
              ? `${formatDateDot(weddingDate)} · ${getDdayLabel(weddingDate)}`
              : '아직 설정되지 않았어요'}
          </Text>
        </TouchableOpacity>

        {weddingDate && (
          <TouchableOpacity style={styles.clearDateButton} onPress={() => setWeddingDate(null)}>
            <Ionicons name="close-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.clearDateButtonText}>결혼 날짜 지우기</Text>
          </TouchableOpacity>
        )}

        {showWeddingDatePicker && (
          <DateTimePicker
            value={weddingDate ? parseStorageDate(weddingDate) : new Date()}
            mode="date"
            onChange={handleWeddingDateChange}
          />
        )}
      </View>

      {/* 알림 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>알림</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="notifications-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>학습 리마인더</Text>
          </View>
          <Switch
            value={reminderSettings.enabled}
            onValueChange={(value) => setReminderSettings({ ...reminderSettings, enabled: value })}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        {reminderSettings.enabled && (
          <TouchableOpacity style={styles.row} onPress={() => setShowTimePicker(true)}>
            <View style={styles.rowLeft}>
              <Ionicons name="time-outline" size={22} color={colors.primary} />
              <Text style={styles.rowLabel}>알림 시간</Text>
            </View>
            <Text style={styles.rowValue}>
              {formatTime(reminderSettings.hour, reminderSettings.minute)}
            </Text>
          </TouchableOpacity>
        )}

        {showTimePicker && (
          <DateTimePicker
            value={new Date(2024, 0, 1, reminderSettings.hour, reminderSettings.minute)}
            mode="time"
            is24Hour={false}
            onChange={handleTimeChange}
          />
        )}
      </View>

      {/* 피드백 설정 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>피드백</Text>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="volume-high-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>사운드</Text>
          </View>
          <Switch
            value={soundEnabled}
            onValueChange={toggleSound}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.row}>
          <View style={styles.rowLeft}>
            <Ionicons name="phone-portrait-outline" size={22} color={colors.primary} />
            <Text style={styles.rowLabel}>진동 (햅틱)</Text>
          </View>
          <Switch
            value={hapticEnabled}
            onValueChange={toggleHaptic}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>
      </View>

      {/* 백업 & 복원 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>백업 & 복원</Text>
        <Text style={styles.sectionSubtitle}>
          오프라인에서도 JSON으로 데이터를 보관하고 복원할 수 있습니다.
        </Text>

        <TouchableOpacity
          style={[styles.button, isExporting && styles.buttonDisabled]}
          onPress={handleExport}
          disabled={isExporting || isImporting}
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>{isExporting ? '내보내는 중...' : '백업 내보내기'}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => setShowBackupInput(!showBackupInput)}
        >
          <Ionicons name="cloud-download-outline" size={20} color={colors.primary} />
          <Text style={[styles.buttonText, styles.buttonTextSecondary]}>백업 불러오기</Text>
        </TouchableOpacity>

        {showBackupInput && (
          <View style={styles.backupInputContainer}>
            <TextInput
              multiline
              value={backupText}
              onChangeText={setBackupText}
              style={styles.input}
              placeholder="여기에 백업 JSON을 붙여주세요"
              placeholderTextColor={colors.textSecondary}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.button, isImporting && styles.buttonDisabled]}
              onPress={handleImport}
              disabled={isImporting}
            >
              <Text style={styles.buttonText}>{isImporting ? '복원 중...' : '복원하기'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 미니게임 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>미니게임</Text>
        <TouchableOpacity style={styles.gameRow} onPress={() => router.push('/game')}>
          <View style={styles.rowLeft}>
            <Ionicons name="game-controller-outline" size={22} color={colors.primary} />
            <View>
              <Text style={styles.rowLabel}>2048</Text>
              <Text style={styles.gameSubtitle}>숫자를 합쳐 2048을 만들어보세요!</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 앱 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>앱 정보</Text>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>버전</Text>
          <Text style={styles.rowValue}>1.0.0</Text>
        </View>
      </View>

      <View style={styles.footer} />
    </ScrollView>
  );
}

const createStyles = (
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
  },
  isDark: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: SIZES.spacing.md,
      gap: SIZES.spacing.lg,
    },
    section: {
      backgroundColor: colors.surface,
      borderRadius: SIZES.borderRadius.lg,
      padding: SIZES.spacing.md,
      gap: SIZES.spacing.sm,
    },
    sectionTitle: {
      fontSize: SIZES.fontSize.lg,
      fontWeight: '600',
      color: colors.text,
      marginBottom: SIZES.spacing.xs,
    },
    sectionSubtitle: {
      fontSize: SIZES.fontSize.sm,
      color: colors.textSecondary,
      marginBottom: SIZES.spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#38383A' : '#f0f0f0',
    },
    gameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: SIZES.spacing.md,
    },
    gameSubtitle: {
      fontSize: SIZES.fontSize.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    rowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SIZES.spacing.sm,
    },
    rowLabel: {
      fontSize: SIZES.fontSize.md,
      color: colors.text,
    },
    rowValue: {
      fontSize: SIZES.fontSize.md,
      color: colors.primary,
      fontWeight: '500',
    },
    rowValueMuted: {
      color: colors.textSecondary,
      fontWeight: '400',
    },
    clearDateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      gap: SIZES.spacing.xs,
      paddingVertical: SIZES.spacing.xs,
      paddingHorizontal: SIZES.spacing.sm,
    },
    clearDateButtonText: {
      fontSize: SIZES.fontSize.sm,
      color: colors.textSecondary,
    },
    themeButtons: {
      flexDirection: 'row',
      gap: SIZES.spacing.sm,
    },
    themeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SIZES.spacing.xs,
      paddingVertical: SIZES.spacing.sm,
      paddingHorizontal: SIZES.spacing.md,
      borderRadius: SIZES.borderRadius.md,
      backgroundColor: isDark ? '#38383A' : '#f0f0f0',
    },
    themeButtonActive: {
      backgroundColor: colors.primary,
    },
    themeButtonText: {
      fontSize: SIZES.fontSize.sm,
      color: colors.text,
    },
    themeButtonTextActive: {
      color: '#fff',
    },
    stepper: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: SIZES.spacing.sm,
    },
    stepperButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#38383A' : '#f0f0f0',
      alignItems: 'center',
      justifyContent: 'center',
    },
    stepperValue: {
      fontSize: SIZES.fontSize.md,
      color: colors.text,
      fontWeight: '500',
      minWidth: 60,
      textAlign: 'center',
    },
    levelButtons: {
      flexDirection: 'row',
      gap: 4,
    },
    levelButton: {
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: SIZES.borderRadius.sm,
      backgroundColor: isDark ? '#38383A' : '#f0f0f0',
    },
    levelButtonActive: {
      backgroundColor: colors.primary,
    },
    levelButtonText: {
      fontSize: SIZES.fontSize.sm,
      color: colors.text,
      fontWeight: '500',
    },
    levelButtonTextActive: {
      color: '#fff',
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: SIZES.spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: SIZES.spacing.md,
      borderRadius: SIZES.borderRadius.md,
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.primary,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      fontSize: SIZES.fontSize.md,
      fontWeight: '600',
      color: '#fff',
    },
    buttonTextSecondary: {
      color: colors.primary,
    },
    backupInputContainer: {
      gap: SIZES.spacing.sm,
      marginTop: SIZES.spacing.sm,
    },
    input: {
      minHeight: 120,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: SIZES.borderRadius.md,
      padding: SIZES.spacing.md,
      fontSize: SIZES.fontSize.sm,
      backgroundColor: isDark ? '#1C1C1E' : '#fff',
      color: colors.text,
    },
    footer: {
      height: 40,
    },
  });

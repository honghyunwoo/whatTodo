import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useDiaryStore, MoodType } from '@/store/diaryStore';
import { todoHaptics } from '@/services/hapticService';

const MOOD_CONFIG: { type: MoodType; emoji: string; label: string }[] = [
  { type: 'happy', emoji: '😊', label: '행복' },
  { type: 'sad', emoji: '😢', label: '슬픔' },
  { type: 'angry', emoji: '😠', label: '화남' },
  { type: 'tired', emoji: '😴', label: '피곤' },
  { type: 'neutral', emoji: '😐', label: '보통' },
];

function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });
}

export default function DiaryScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getEntryByDate, addEntry, updateEntry, deleteEntry } = useDiaryStore();

  const existingEntry = date ? getEntryByDate(date) : undefined;
  const isEditMode = !!existingEntry;

  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [mood, setMood] = useState<MoodType | undefined>(existingEntry?.mood);

  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setContent(existingEntry.content);
      setMood(existingEntry.mood);
    }
  }, [existingEntry]);

  const handleSave = useCallback(async () => {
    if (!date) return;
    if (!title.trim()) {
      Alert.alert('알림', '제목을 입력해주세요.');
      return;
    }

    await todoHaptics.complete();

    if (isEditMode && existingEntry) {
      updateEntry(existingEntry.id, {
        title: title.trim(),
        content: content.trim(),
        mood,
      });
    } else {
      addEntry({
        date,
        title: title.trim(),
        content: content.trim(),
        mood,
      });
    }
    router.back();
  }, [date, title, content, mood, isEditMode, existingEntry, addEntry, updateEntry, router]);

  const handleDelete = useCallback(async () => {
    if (!existingEntry) return;

    Alert.alert('다이어리 삭제', '이 다이어리를 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await todoHaptics.delete();
          deleteEntry(existingEntry.id);
          router.back();
        },
      },
    ]);
  }, [existingEntry, deleteEntry, router]);

  if (!date) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text} />
          <Text style={[styles.errorText, { color: colors.text }]}>날짜 정보가 없습니다</Text>
          <Button mode="contained" onPress={() => router.back()}>
            돌아가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
          <IconButton
            icon={() => <Ionicons name="chevron-back" size={24} color={colors.text} />}
            onPress={() => router.back()}
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {isEditMode ? '다이어리 수정' : '다이어리 작성'}
          </Text>
          <Button mode="contained" compact onPress={handleSave} buttonColor={COLORS.primary}>
            저장
          </Button>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {formatDateDisplay(date)}
          </Text>

          <View
            style={[
              styles.inputCard,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              !isDark && SHADOWS.sm,
            ]}
          >
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="오늘의 제목"
              placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
              style={[styles.titleInput, { color: colors.text }]}
              maxLength={50}
            />
          </View>

          <View style={styles.moodSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>오늘의 기분</Text>
            <View style={styles.moodContainer}>
              {MOOD_CONFIG.map((item) => (
                <Pressable
                  key={item.type}
                  style={[
                    styles.moodButton,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                    mood === item.type && styles.selectedMoodButton,
                    mood === item.type && { borderColor: COLORS.primary },
                  ]}
                  onPress={() => setMood(mood === item.type ? undefined : item.type)}
                >
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      { color: mood === item.type ? COLORS.primary : colors.textSecondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View
            style={[
              styles.contentCard,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              !isDark && SHADOWS.sm,
            ]}
          >
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="오늘 하루는 어땠나요?"
              placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
              style={[styles.contentInput, { color: colors.text }]}
              multiline
              textAlignVertical="top"
            />
          </View>

          {isEditMode && (
            <View style={styles.deleteContainer}>
              <Button
                mode="outlined"
                onPress={handleDelete}
                textColor="#FF3B30"
                style={styles.deleteButton}
                icon={() => <Ionicons name="trash-outline" size={18} color="#FF3B30" />}
              >
                삭제
              </Button>
            </View>
          )}

          {existingEntry && (
            <View style={styles.metadata}>
              <Text style={[styles.metadataText, { color: isDark ? '#6B6B6B' : '#A0A0A0' }]}>
                생성: {new Date(existingEntry.createdAt).toLocaleString('ko-KR')}
              </Text>
              <Text style={[styles.metadataText, { color: isDark ? '#6B6B6B' : '#A0A0A0' }]}>
                수정: {new Date(existingEntry.updatedAt).toLocaleString('ko-KR')}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  contentCard: {
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.md,
    minHeight: 200,
    padding: SIZES.spacing.md,
  },
  contentInput: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
    minHeight: 180,
  },
  dateText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  deleteContainer: {
    alignItems: 'center',
    marginTop: SIZES.spacing.lg,
    paddingHorizontal: SIZES.spacing.xl,
  },
  errorContainer: {
    alignItems: 'center',
    flex: 1,
    gap: SIZES.spacing.md,
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  errorText: {
    fontSize: SIZES.fontSize.lg,
    marginTop: SIZES.spacing.md,
  },
  flex: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.xs,
  },
  headerTitle: {
    flex: 1,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputCard: {
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  metadata: {
    marginTop: SIZES.spacing.xl,
    paddingBottom: SIZES.spacing.xxl,
  },
  metadataText: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.xs,
    textAlign: 'center',
  },
  moodButton: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontSize: SIZES.fontSize.xs,
    marginTop: 4,
  },
  moodSection: {
    marginBottom: SIZES.spacing.md,
  },
  sectionLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  selectedMoodButton: {
    borderWidth: 2,
  },
  titleInput: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
  },
});

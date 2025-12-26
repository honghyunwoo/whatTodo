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
import { Text, Button, IconButton, Chip } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { useDiaryStore, MoodType, MOOD_CONFIG, getTodayPrompt } from '@/store/diaryStore';
import { todoHaptics } from '@/services/hapticService';

const MOOD_TYPES: MoodType[] = ['happy', 'excited', 'peaceful', 'neutral', 'tired', 'sad', 'anxious', 'angry'];

const COMMON_TAGS = ['일상', '운동', '여행', '맛집', '독서', '영화', '공부', '친구', '가족', '취미'];

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
  const { getEntryByDate, addEntry, updateEntry, deleteEntry, tags: allTags } = useDiaryStore();

  const existingEntry = date ? getEntryByDate(date) : undefined;
  const isEditMode = !!existingEntry;

  const [title, setTitle] = useState(existingEntry?.title || '');
  const [content, setContent] = useState(existingEntry?.content || '');
  const [mood, setMood] = useState<MoodType | undefined>(existingEntry?.mood);
  const [tags, setTags] = useState<string[]>(existingEntry?.tags || []);
  const [newTag, setNewTag] = useState('');
  const [showPrompt, setShowPrompt] = useState(!isEditMode && !content);

  const dailyPrompt = getTodayPrompt();

  useEffect(() => {
    if (existingEntry) {
      setTitle(existingEntry.title);
      setContent(existingEntry.content);
      setMood(existingEntry.mood);
      setTags(existingEntry.tags || []);
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
        tags: tags.length > 0 ? tags : undefined,
      });
    } else {
      addEntry({
        date,
        title: title.trim(),
        content: content.trim(),
        mood,
        tags: tags.length > 0 ? tags : undefined,
      });
    }
    router.back();
  }, [date, title, content, mood, tags, isEditMode, existingEntry, addEntry, updateEntry, router]);

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

  const handleUsePrompt = useCallback(() => {
    setContent(dailyPrompt + '\n\n');
    setShowPrompt(false);
  }, [dailyPrompt]);

  const handleAddTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setNewTag('');
  }, [tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  }, [tags]);

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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.moodContainer}>
                {MOOD_TYPES.map((type) => {
                  const config = MOOD_CONFIG[type];
                  const isSelected = mood === type;
                  return (
                    <Pressable
                      key={type}
                      style={[
                        styles.moodButton,
                        { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                        isSelected && { borderColor: config.color, backgroundColor: config.color + '20' },
                      ]}
                      onPress={() => setMood(mood === type ? undefined : type)}
                    >
                      <Text style={styles.moodEmoji}>{config.emoji}</Text>
                      <Text
                        style={[
                          styles.moodLabel,
                          { color: isSelected ? config.color : colors.textSecondary },
                        ]}
                      >
                        {config.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>

          {showPrompt && (
            <Pressable
              style={[
                styles.promptCard,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFF8E1' },
              ]}
              onPress={handleUsePrompt}
            >
              <View style={styles.promptHeader}>
                <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
                <Text style={styles.promptLabel}>오늘의 질문</Text>
              </View>
              <Text style={[styles.promptText, { color: colors.text }]}>{dailyPrompt}</Text>
              <Text style={styles.promptHint}>탭하여 사용하기</Text>
            </Pressable>
          )}

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

          <View style={styles.tagSection}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>태그</Text>
            
            <View style={styles.tagInputRow}>
              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="태그 추가..."
                placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
                style={[
                  styles.tagInput,
                  { 
                    backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    color: colors.text 
                  },
                ]}
                onSubmitEditing={() => handleAddTag(newTag)}
                returnKeyType="done"
              />
              <IconButton
                icon="plus"
                size={20}
                onPress={() => handleAddTag(newTag)}
                disabled={!newTag.trim()}
              />
            </View>

            {tags.length > 0 && (
              <View style={styles.selectedTags}>
                {tags.map((tag) => (
                  <Chip
                    key={tag}
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tagChip}
                    textStyle={styles.tagChipText}
                  >
                    #{tag}
                  </Chip>
                ))}
              </View>
            )}

            <View style={styles.suggestedTags}>
              {COMMON_TAGS.filter((t) => !tags.includes(t)).slice(0, 5).map((tag) => (
                <Chip
                  key={tag}
                  onPress={() => handleAddTag(tag)}
                  style={styles.suggestedChip}
                  textStyle={styles.suggestedChipText}
                >
                  #{tag}
                </Chip>
              ))}
            </View>
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
    marginRight: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    minWidth: 70,
  },
  moodContainer: {
    flexDirection: 'row',
    paddingRight: SIZES.spacing.md,
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
  promptCard: {
    borderRadius: SIZES.borderRadius.lg,
    marginBottom: SIZES.spacing.md,
    padding: SIZES.spacing.md,
  },
  promptHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  promptHint: {
    color: '#F59E0B',
    fontSize: SIZES.fontSize.sm,
    marginTop: SIZES.spacing.sm,
    textAlign: 'right',
  },
  promptLabel: {
    color: '#F59E0B',
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
  promptText: {
    fontSize: SIZES.fontSize.md,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  sectionLabel: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.sm,
  },
  selectedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  suggestedChip: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  suggestedChipText: {
    fontSize: SIZES.fontSize.sm,
  },
  suggestedTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
  },
  tagChip: {
    backgroundColor: COLORS.primary + '20',
  },
  tagChipText: {
    fontSize: SIZES.fontSize.sm,
  },
  tagInput: {
    borderRadius: SIZES.borderRadius.md,
    flex: 1,
    fontSize: SIZES.fontSize.md,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  tagInputRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SIZES.spacing.sm,
  },
  tagSection: {
    marginBottom: SIZES.spacing.md,
  },
  titleInput: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
  },
});

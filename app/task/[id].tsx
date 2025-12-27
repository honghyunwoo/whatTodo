import React, { useCallback, useMemo, useState } from 'react';
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
import { Text, Button, Chip, IconButton, Portal, Modal } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useTheme } from '@/contexts/ThemeContext';
import { COLORS, withAlpha } from '@/constants/colors';
import { SIZES, SHADOWS } from '@/constants/sizes';
import { TYPOGRAPHY } from '@/constants/typography';
import { useTaskStore } from '@/store/taskStore';
import { TaskPriority, TaskCategory } from '@/types/task';
import { SubTaskList } from '@/components/todo/subtask';
import { todoHaptics } from '@/services/hapticService';

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; icon: string }> = {
  low: { label: '낮음', color: COLORS.priority.low, icon: 'flag-outline' },
  medium: { label: '보통', color: COLORS.priority.medium, icon: 'flag' },
  high: { label: '높음', color: COLORS.priority.high, icon: 'flag' },
  urgent: { label: '긴급', color: COLORS.priority.urgent, icon: 'alert-circle' },
};

const CATEGORY_CONFIG: Record<TaskCategory, { label: string; icon: string }> = {
  work: { label: '업무', icon: 'briefcase-outline' },
  personal: { label: '개인', icon: 'person-outline' },
  health: { label: '건강', icon: 'fitness-outline' },
  learning: { label: '학습', icon: 'book-outline' },
  other: { label: '기타', icon: 'ellipsis-horizontal-outline' },
};

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { getTaskById, updateTask, deleteTask, toggleComplete } = useTaskStore();

  const task = getTaskById(id);

  // Local state for editing
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'personal');
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : null
  );
  const [dueTime, setDueTime] = useState<string | undefined>(task?.dueTime);

  // Modal states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Track if changes were made
  const hasChanges = useMemo(() => {
    if (!task) return false;
    return (
      title !== task.title ||
      description !== (task.description || '') ||
      priority !== task.priority ||
      category !== task.category ||
      (dueDate?.toISOString().split('T')[0] || null) !== (task.dueDate || null) ||
      dueTime !== task.dueTime
    );
  }, [task, title, description, priority, category, dueDate, dueTime]);

  const handleSave = useCallback(async () => {
    if (!task || !title.trim()) return;

    await todoHaptics.tap();
    updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate?.toISOString().split('T')[0],
      dueTime,
    });
    router.back();
  }, [task, title, description, priority, category, dueDate, dueTime, updateTask, router]);

  const handleDelete = useCallback(async () => {
    if (!task) return;

    Alert.alert('할 일 삭제', '이 할 일을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          await todoHaptics.delete();
          deleteTask(task.id);
          router.back();
        },
      },
    ]);
  }, [task, deleteTask, router]);

  const handleToggleComplete = useCallback(async () => {
    if (!task) return;
    await todoHaptics.complete();
    toggleComplete(task.id);
  }, [task, toggleComplete]);

  const handleDateChange = useCallback((event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDueDate(selectedDate);
    }
  }, []);

  const handleTimeChange = useCallback((event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setDueTime(`${hours}:${minutes}`);
    }
  }, []);

  const clearDueDate = useCallback(() => {
    setDueDate(null);
    setDueTime(undefined);
  }, []);

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.text} />
          <Text style={[styles.errorText, { color: colors.text }]}>할 일을 찾을 수 없습니다</Text>
          <Button mode="contained" onPress={() => router.back()}>
            돌아가기
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  const priorityConfig = PRIORITY_CONFIG[priority];
  const categoryConfig = CATEGORY_CONFIG[category];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
          <IconButton
            icon={() => <Ionicons name="chevron-back" size={24} color={colors.text} />}
            onPress={() => router.back()}
          />
          <Text style={[styles.headerTitle, { color: colors.text }]}>상세</Text>
          <View style={styles.headerActions}>
            <IconButton
              icon={() => (
                <Ionicons
                  name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                  size={24}
                  color={task.completed ? '#34C759' : colors.text}
                />
              )}
              onPress={handleToggleComplete}
            />
            {hasChanges && (
              <Button mode="contained" compact onPress={handleSave} buttonColor={COLORS.primary}>
                저장
              </Button>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <Animated.View entering={FadeInUp.duration(300)}>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="할 일 제목"
              placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
              style={[
                styles.titleInput,
                {
                  color: colors.text,
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
                task.completed && styles.completedTitle,
              ]}
              multiline
            />
          </Animated.View>

          {/* Properties */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(50)}
            style={[
              styles.propertiesCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              },
              !isDark && SHADOWS.sm,
            ]}
          >
            {/* Priority */}
            <Pressable style={styles.propertyRow} onPress={() => setShowPriorityModal(true)}>
              <View style={styles.propertyLeft}>
                <Ionicons
                  name={priorityConfig.icon as any}
                  size={20}
                  color={priorityConfig.color}
                />
                <Text style={[styles.propertyLabel, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                  우선순위
                </Text>
              </View>
              <View style={styles.propertyRight}>
                <Text style={[styles.propertyValue, { color: priorityConfig.color }]}>
                  {priorityConfig.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#8E8E93' : '#A0A0A0'} />
              </View>
            </Pressable>

            {/* Category */}
            <Pressable style={styles.propertyRow} onPress={() => setShowCategoryModal(true)}>
              <View style={styles.propertyLeft}>
                <Ionicons
                  name={categoryConfig.icon as any}
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B6B6B'}
                />
                <Text style={[styles.propertyLabel, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                  카테고리
                </Text>
              </View>
              <View style={styles.propertyRight}>
                <Text style={[styles.propertyValue, { color: colors.text }]}>
                  {categoryConfig.label}
                </Text>
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#8E8E93' : '#A0A0A0'} />
              </View>
            </Pressable>

            {/* Due Date */}
            <Pressable style={styles.propertyRow} onPress={() => setShowDatePicker(true)}>
              <View style={styles.propertyLeft}>
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color={isDark ? '#8E8E93' : '#6B6B6B'}
                />
                <Text style={[styles.propertyLabel, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                  마감일
                </Text>
              </View>
              <View style={styles.propertyRight}>
                {dueDate ? (
                  <View style={styles.dateValue}>
                    <Text style={[styles.propertyValue, { color: colors.text }]}>
                      {dueDate.toLocaleDateString('ko-KR')}
                    </Text>
                    <IconButton
                      icon={() => <Ionicons name="close-circle" size={16} color="#FF3B30" />}
                      size={16}
                      onPress={clearDueDate}
                    />
                  </View>
                ) : (
                  <Text style={[styles.propertyValue, { color: isDark ? '#6B6B6B' : '#A0A0A0' }]}>
                    설정 안됨
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={isDark ? '#8E8E93' : '#A0A0A0'} />
              </View>
            </Pressable>

            {/* Due Time */}
            {dueDate && (
              <Pressable style={styles.propertyRow} onPress={() => setShowTimePicker(true)}>
                <View style={styles.propertyLeft}>
                  <Ionicons name="time-outline" size={20} color={isDark ? '#8E8E93' : '#6B6B6B'} />
                  <Text style={[styles.propertyLabel, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                    시간
                  </Text>
                </View>
                <View style={styles.propertyRight}>
                  <Text
                    style={[
                      styles.propertyValue,
                      { color: dueTime ? colors.text : isDark ? '#6B6B6B' : '#A0A0A0' },
                    ]}
                  >
                    {dueTime || '설정 안됨'}
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={isDark ? '#8E8E93' : '#A0A0A0'}
                  />
                </View>
              </Pressable>
            )}
          </Animated.View>

          {/* Description */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(100)}
            style={[
              styles.descriptionCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              },
              !isDark && SHADOWS.sm,
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color={isDark ? '#8E8E93' : '#6B6B6B'}
              />
              <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                메모
              </Text>
            </View>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="메모를 추가하세요..."
              placeholderTextColor={isDark ? '#6B6B6B' : '#A0A0A0'}
              style={[styles.descriptionInput, { color: colors.text }]}
              multiline
              numberOfLines={4}
            />
          </Animated.View>

          {/* Subtasks */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(150)}
            style={[
              styles.subtasksCard,
              {
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
              },
              !isDark && SHADOWS.sm,
            ]}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={18} color={isDark ? '#8E8E93' : '#6B6B6B'} />
              <Text style={[styles.sectionTitle, { color: isDark ? '#8E8E93' : '#6B6B6B' }]}>
                세부 항목
              </Text>
            </View>
            <SubTaskList taskId={task.id} subtasks={task.subtasks || []} />
          </Animated.View>

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <Animated.View
              entering={FadeInUp.duration(300).delay(200)}
              style={styles.tagsContainer}
            >
              {task.tags.map((tag) => (
                <Chip
                  key={tag}
                  mode="flat"
                  style={[styles.tagChip, { backgroundColor: withAlpha(COLORS.primary, 0.1) }]}
                  textStyle={{ color: COLORS.primary }}
                >
                  #{tag}
                </Chip>
              ))}
            </Animated.View>
          )}

          {/* Delete Button */}
          <Animated.View
            entering={FadeInUp.duration(300).delay(250)}
            style={styles.deleteContainer}
          >
            <Button
              mode="outlined"
              onPress={handleDelete}
              textColor="#FF3B30"
              style={styles.deleteButton}
              icon={() => <Ionicons name="trash-outline" size={18} color="#FF3B30" />}
            >
              삭제
            </Button>
          </Animated.View>

          {/* Metadata */}
          <View style={styles.metadata}>
            <Text style={[styles.metadataText, { color: isDark ? '#6B6B6B' : '#A0A0A0' }]}>
              생성: {new Date(task.createdAt).toLocaleString('ko-KR')}
            </Text>
            <Text style={[styles.metadataText, { color: isDark ? '#6B6B6B' : '#A0A0A0' }]}>
              수정: {new Date(task.updatedAt).toLocaleString('ko-KR')}
            </Text>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={dueDate || new Date()}
            mode="date"
            display="spinner"
            onChange={handleDateChange}
            locale="ko-KR"
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={dueTime ? new Date(`2000-01-01T${dueTime}:00`) : new Date()}
            mode="time"
            display="spinner"
            onChange={handleTimeChange}
            locale="ko-KR"
          />
        )}

        {/* Priority Modal */}
        <Portal>
          <Modal
            visible={showPriorityModal}
            onDismiss={() => setShowPriorityModal(false)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>우선순위</Text>
            <View style={styles.priorityOptions}>
              {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, typeof priorityConfig][]).map(
                ([key, config]) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.priorityOption,
                      priority === key && {
                        backgroundColor: withAlpha(config.color, 0.1),
                        borderColor: config.color,
                      },
                    ]}
                    onPress={() => {
                      setPriority(key);
                      setShowPriorityModal(false);
                    }}
                  >
                    <Ionicons name={config.icon as any} size={24} color={config.color} />
                    <Text style={[styles.priorityLabel, { color: config.color }]}>
                      {config.label}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </Modal>
        </Portal>

        {/* Category Modal */}
        <Portal>
          <Modal
            visible={showCategoryModal}
            onDismiss={() => setShowCategoryModal(false)}
            contentContainerStyle={[
              styles.modal,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>카테고리</Text>
            <View style={styles.categoryOptions}>
              {(Object.entries(CATEGORY_CONFIG) as [TaskCategory, typeof categoryConfig][]).map(
                ([key, config]) => (
                  <Pressable
                    key={key}
                    style={[
                      styles.categoryOption,
                      category === key && {
                        backgroundColor: withAlpha(COLORS.primary, 0.1),
                        borderColor: COLORS.primary,
                      },
                    ]}
                    onPress={() => {
                      setCategory(key);
                      setShowCategoryModal(false);
                    }}
                  >
                    <Ionicons
                      name={config.icon as any}
                      size={20}
                      color={category === key ? COLORS.primary : isDark ? '#8E8E93' : '#6B6B6B'}
                    />
                    <Text
                      style={[
                        styles.categoryLabel,
                        { color: category === key ? COLORS.primary : colors.text },
                      ]}
                    >
                      {config.label}
                    </Text>
                  </Pressable>
                )
              )}
            </View>
          </Modal>
        </Portal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.xs,
    paddingVertical: SIZES.spacing.xs,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...TYPOGRAPHY.h3,
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  content: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  titleInput: {
    ...TYPOGRAPHY.h2,
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  propertiesCard: {
    borderRadius: SIZES.radius.md,
    marginBottom: SIZES.spacing.md,
    overflow: 'hidden',
  },
  propertyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  propertyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  propertyLabel: {
    ...TYPOGRAPHY.body,
  },
  propertyRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  propertyValue: {
    ...TYPOGRAPHY.body,
  },
  dateValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  descriptionCard: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.sm,
  },
  sectionTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
  },
  descriptionInput: {
    ...TYPOGRAPHY.body,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  subtasksCard: {
    borderRadius: SIZES.radius.md,
    padding: SIZES.spacing.md,
    marginBottom: SIZES.spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.md,
  },
  tagChip: {
    height: 28,
  },
  deleteContainer: {
    marginTop: SIZES.spacing.lg,
    marginBottom: SIZES.spacing.md,
  },
  deleteButton: {
    borderColor: '#FF3B30',
  },
  metadata: {
    alignItems: 'center',
    paddingVertical: SIZES.spacing.lg,
    gap: SIZES.spacing.xs,
  },
  metadataText: {
    ...TYPOGRAPHY.caption,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SIZES.spacing.md,
  },
  errorText: {
    ...TYPOGRAPHY.body,
  },
  modal: {
    margin: SIZES.spacing.lg,
    borderRadius: SIZES.radius.lg,
    padding: SIZES.spacing.lg,
  },
  modalTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SIZES.spacing.md,
    textAlign: 'center',
  },
  priorityOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    justifyContent: 'center',
  },
  priorityOption: {
    alignItems: 'center',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 70,
  },
  priorityLabel: {
    ...TYPOGRAPHY.caption,
    marginTop: SIZES.spacing.xs,
    fontWeight: '600',
  },
  categoryOptions: {
    gap: SIZES.spacing.sm,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
    borderRadius: SIZES.radius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryLabel: {
    ...TYPOGRAPHY.body,
  },
});

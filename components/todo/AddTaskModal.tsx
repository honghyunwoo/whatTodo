import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Modal, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { TaskCategory, TaskFormData, TaskPriority } from '@/types/task';

interface AddTaskModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const CATEGORY_OPTIONS: { label: string; value: TaskCategory }[] = [
  { label: '업무', value: 'work' },
  { label: '개인', value: 'personal' },
  { label: '건강', value: 'health' },
  { label: '학습', value: 'learning' },
  { label: '기타', value: 'other' },
];

const PRIORITY_OPTIONS: { label: string; value: TaskPriority }[] = [
  { label: '낮음', value: 'low' },
  { label: '보통', value: 'medium' },
  { label: '높음', value: 'high' },
  { label: '긴급', value: 'urgent' },
];

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium',
  dueDate: undefined,
};

export function AddTaskModal({ visible, onDismiss }: AddTaskModalProps) {
  const addTask = useTaskStore((state) => state.addTask);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setErrors({});
  }, []);

  const handleDismiss = useCallback(() => {
    resetForm();
    onDismiss();
  }, [onDismiss, resetForm]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { title?: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (formData.title.trim().length < 2) {
      newErrors.title = '제목은 2자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.title]);

  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;

    addTask({
      ...formData,
      title: formData.title.trim(),
      description: formData.description?.trim() || undefined,
    });

    handleDismiss();
  }, [addTask, formData, handleDismiss, validateForm]);

  const updateField = useCallback(
    <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (field === 'title' && errors.title) {
        setErrors({});
      }
    },
    [errors.title]
  );

  return (
    <Portal>
      <Modal visible={visible} onDismiss={handleDismiss} contentContainerStyle={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>새 할 일</Text>

          {/* 제목 입력 */}
          <TextInput
            label="제목 *"
            value={formData.title}
            onChangeText={(text) => updateField('title', text)}
            mode="outlined"
            style={styles.input}
            error={!!errors.title}
            maxLength={100}
          />
          {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

          {/* 설명 입력 */}
          <TextInput
            label="설명 (선택)"
            value={formData.description}
            onChangeText={(text) => updateField('description', text)}
            mode="outlined"
            style={styles.input}
            multiline
            numberOfLines={3}
            maxLength={500}
          />

          {/* 카테고리 선택 */}
          <Text style={styles.sectionLabel}>카테고리</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <SegmentedButtons
              value={formData.category}
              onValueChange={(value) => updateField('category', value as TaskCategory)}
              buttons={CATEGORY_OPTIONS}
              style={styles.segmentedButtons}
            />
          </ScrollView>

          {/* 우선순위 선택 */}
          <Text style={styles.sectionLabel}>우선순위</Text>
          <SegmentedButtons
            value={formData.priority}
            onValueChange={(value) => updateField('priority', value as TaskPriority)}
            buttons={PRIORITY_OPTIONS}
            style={styles.segmentedButtons}
          />

          {/* 버튼 그룹 */}
          <View style={styles.buttonGroup}>
            <Button mode="outlined" onPress={handleDismiss} style={styles.button}>
              취소
            </Button>
            <Button mode="contained" onPress={handleSubmit} style={styles.button}>
              추가
            </Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    marginHorizontal: SIZES.spacing.xs,
  },
  buttonGroup: {
    flexDirection: 'row',
    marginTop: SIZES.spacing.lg,
  },
  container: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.borderRadius.xl,
    borderTopRightRadius: SIZES.borderRadius.xl,
    bottom: 0,
    left: 0,
    maxHeight: '80%',
    padding: SIZES.spacing.lg,
    position: 'absolute',
    right: 0,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
    marginTop: -SIZES.spacing.xs,
  },
  input: {
    marginBottom: SIZES.spacing.md,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  segmentedButtons: {
    marginBottom: SIZES.spacing.md,
  },
  title: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
});

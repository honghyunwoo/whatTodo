import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { useTheme } from '@/contexts/ThemeContext';
import { TaskCategory, TaskFormData, TaskPriority } from '@/types/task';
import { ParsePreview } from '@/types/naturalLanguage';
import { BlurModal } from '@/components/common';
import { todoHaptics } from '@/services/hapticService';
import { parseNaturalLanguage, getParsePreview } from '@/utils/naturalLanguageParser';
import { ParsePreviewBadges } from './ParsePreviewBadges';

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

// 우선순위 매핑 (파싱된 값 -> TaskPriority)
const PRIORITY_MAP: Record<string, TaskPriority> = {
  high: 'high',
  medium: 'medium',
  low: 'low',
};

const initialFormData: TaskFormData = {
  title: '',
  description: '',
  category: 'personal',
  priority: 'medium',
  dueDate: undefined,
};

export function AddTaskModal({ visible, onDismiss }: AddTaskModalProps) {
  const { colors, isDark } = useTheme();
  const addTask = useTaskStore((state) => state.addTask);
  const [formData, setFormData] = useState<TaskFormData>(initialFormData);
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [rawInput, setRawInput] = useState('');
  const [preview, setPreview] = useState<ParsePreview | null>(null);
  const parseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (visible) {
      setRawInput('');
      setPreview(null);
      setFormData(initialFormData);
      setErrors({});
    }
  }, [visible]);

  // 디바운스된 파싱
  const debouncedParse = useCallback((text: string) => {
    if (parseTimeoutRef.current) {
      clearTimeout(parseTimeoutRef.current);
    }

    parseTimeoutRef.current = setTimeout(() => {
      if (text.trim().length > 0) {
        const newPreview = getParsePreview(text);
        setPreview(newPreview);
      } else {
        setPreview(null);
      }
    }, 300);
  }, []);

  // 입력 핸들러
  const handleTitleChange = useCallback(
    (text: string) => {
      setRawInput(text);
      debouncedParse(text);

      if (errors.title) {
        setErrors({});
      }
    },
    [debouncedParse, errors.title]
  );

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setRawInput('');
    setPreview(null);
    setErrors({});
  }, []);

  const handleDismiss = useCallback(() => {
    resetForm();
    onDismiss();
  }, [onDismiss, resetForm]);

  const validateForm = useCallback((): boolean => {
    const newErrors: { title?: string } = {};

    if (!rawInput.trim()) {
      newErrors.title = '제목을 입력해주세요';
    } else if (rawInput.trim().length < 2) {
      newErrors.title = '제목은 2자 이상 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [rawInput]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    await todoHaptics.add();

    // 자연어 파싱
    const parsed = parseNaturalLanguage(rawInput);

    // 파싱된 값과 폼 데이터 병합
    const taskData: TaskFormData = {
      title: parsed.title || rawInput.trim(),
      description: formData.description?.trim() || undefined,
      category: formData.category,
      priority: parsed.priority
        ? PRIORITY_MAP[parsed.priority] || formData.priority
        : formData.priority,
      dueDate: parsed.dueDate || formData.dueDate,
      tags: parsed.tags,
    };

    addTask(taskData);
    handleDismiss();
  }, [addTask, formData, handleDismiss, rawInput, validateForm]);

  const updateField = useCallback(
    <K extends keyof TaskFormData>(field: K, value: TaskFormData[K]) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  return (
    <BlurModal visible={visible} onDismiss={handleDismiss} position="bottom">
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: colors.text }]}>새 할 일</Text>

        {/* 자연어 입력 */}
        <TextInput
          label="할 일 입력"
          placeholder="예: 내일 3시 팀 회의 #업무 중요"
          value={rawInput}
          onChangeText={handleTitleChange}
          mode="outlined"
          style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F8F8F8' }]}
          error={!!errors.title}
          maxLength={100}
          textColor={colors.text}
          autoFocus
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

        {/* 파싱 미리보기 */}
        {preview && <ParsePreviewBadges preview={preview} />}

        {/* 힌트 텍스트 */}
        <Text style={[styles.hintText, { color: isDark ? '#8E8E93' : '#6B7280' }]}>
          날짜(내일, 금요일), 시간(3시, 오후 2시), 태그(#업무), 우선순위(중요)를 자동 인식합니다
        </Text>

        {/* 설명 입력 */}
        <TextInput
          label="설명 (선택)"
          value={formData.description}
          onChangeText={(text) => updateField('description', text)}
          mode="outlined"
          style={[styles.input, { backgroundColor: isDark ? '#2C2C2E' : '#F8F8F8' }]}
          multiline
          numberOfLines={2}
          maxLength={500}
          textColor={colors.text}
        />

        {/* 카테고리 선택 */}
        <Text style={[styles.sectionLabel, { color: colors.text }]}>카테고리</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <SegmentedButtons
            value={formData.category}
            onValueChange={(value) => updateField('category', value as TaskCategory)}
            buttons={CATEGORY_OPTIONS}
            style={styles.segmentedButtons}
          />
        </ScrollView>

        {/* 우선순위 선택 (파싱되지 않았을 때만 수동 선택) */}
        {!preview?.hasPriority && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>우선순위</Text>
            <SegmentedButtons
              value={formData.priority}
              onValueChange={(value) => updateField('priority', value as TaskPriority)}
              buttons={PRIORITY_OPTIONS}
              style={styles.segmentedButtons}
            />
          </>
        )}

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
    </BlurModal>
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
    paddingBottom: SIZES.spacing.md,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: SIZES.fontSize.sm,
    marginBottom: SIZES.spacing.sm,
    marginTop: -SIZES.spacing.xs,
  },
  hintText: {
    fontSize: SIZES.fontSize.xs,
    marginBottom: SIZES.spacing.md,
    marginTop: SIZES.spacing.xs,
    paddingHorizontal: 4,
  },
  input: {
    marginBottom: SIZES.spacing.md,
  },
  sectionLabel: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
    marginBottom: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  segmentedButtons: {
    marginBottom: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '600',
    marginBottom: SIZES.spacing.lg,
    textAlign: 'center',
  },
});

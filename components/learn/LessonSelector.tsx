/**
 * 레슨 선택 컴포넌트
 * 유닛 내 레슨 목록을 표시하고 선택할 수 있습니다.
 */

import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import type { LessonCardData } from '@/types/lesson';

interface LessonSelectorProps {
  lessons: LessonCardData[];
  selectedLessonId: string | null;
  onSelectLesson: (lessonId: string) => void;
  onTakeTest?: (lessonId: string) => void;
}

export function LessonSelector({
  lessons,
  selectedLessonId,
  onSelectLesson,
  onTakeTest,
}: LessonSelectorProps) {
  const renderLessonItem = useCallback(
    (lesson: LessonCardData, index: number) => {
      const isSelected = lesson.id === selectedLessonId;
      const isCompleted = lesson.status === 'completed';
      const isInProgress = lesson.status === 'in_progress';
      const isLocked = lesson.status === 'locked';
      const canTakeTest = isCompleted && onTakeTest;

      return (
        <Pressable
          key={lesson.id}
          style={({ pressed }) => [
            styles.lessonItem,
            isSelected && styles.selectedLessonItem,
            isCompleted && !isSelected && styles.completedLessonItem,
            isLocked && styles.lockedLessonItem,
            pressed && !isLocked && styles.pressed,
          ]}
          onPress={() => !isLocked && onSelectLesson(lesson.id)}
          disabled={isLocked}
        >
          <View style={styles.lessonLeft}>
            <View
              style={[
                styles.lessonNumber,
                isSelected && styles.selectedLessonNumber,
                isCompleted && !isSelected && styles.completedLessonNumber,
                isLocked && styles.lockedLessonNumber,
              ]}
            >
              {isCompleted ? (
                <Text style={styles.checkIcon}>✓</Text>
              ) : isLocked ? (
                <Text style={styles.lockIcon}>🔒</Text>
              ) : (
                <Text
                  style={[styles.lessonNumberText, isSelected && styles.selectedLessonNumberText]}
                >
                  {index + 1}
                </Text>
              )}
            </View>

            <View style={styles.lessonInfo}>
              <Text
                style={[
                  styles.lessonTitle,
                  isSelected && styles.selectedLessonTitle,
                  isLocked && styles.lockedText,
                ]}
                numberOfLines={1}
              >
                {lesson.title}
              </Text>
              <Text
                style={[
                  styles.lessonSubtitle,
                  isSelected && styles.selectedLessonSubtitle,
                  isLocked && styles.lockedText,
                ]}
                numberOfLines={1}
              >
                {lesson.subtitle}
              </Text>
            </View>
          </View>

          <View style={styles.lessonRight}>
            {isCompleted ? (
              <>
                <View style={styles.scoreContainer}>
                  <Text style={[styles.scoreText, isSelected && styles.selectedScoreText]}>
                    {lesson.score}점
                  </Text>
                </View>
                {canTakeTest && (
                  <Pressable
                    style={({ pressed }) => [
                      styles.testButton,
                      isSelected && styles.selectedTestButton,
                      pressed && styles.testButtonPressed,
                    ]}
                    onPress={(e) => {
                      e.stopPropagation();
                      onTakeTest(lesson.id);
                    }}
                  >
                    <Text
                      style={[styles.testButtonText, isSelected && styles.selectedTestButtonText]}
                    >
                      테스트
                    </Text>
                  </Pressable>
                )}
              </>
            ) : isInProgress ? (
              <View style={styles.progressContainer}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBar,
                      { width: `${lesson.progress}%` },
                      isSelected && styles.selectedProgressBar,
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, isSelected && styles.selectedProgressText]}>
                  {lesson.progress}%
                </Text>
              </View>
            ) : !isLocked ? (
              <View style={styles.durationContainer}>
                <Text style={[styles.durationText, isSelected && styles.selectedDurationText]}>
                  {lesson.estimatedMinutes}분
                </Text>
              </View>
            ) : null}

            <Text style={[styles.arrow, isLocked && styles.lockedText]}>›</Text>
          </View>
        </Pressable>
      );
    },
    [selectedLessonId, onSelectLesson, onTakeTest]
  );

  return <View style={styles.container}>{lessons.map(renderLessonItem)}</View>;
}

const styles = StyleSheet.create({
  arrow: {
    color: COLORS.textSecondary,
    fontSize: 20,
    marginLeft: SIZES.spacing.sm,
  },
  checkIcon: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  completedLessonItem: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success + '40',
  },
  completedLessonNumber: {
    backgroundColor: COLORS.success,
  },
  container: {
    gap: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
  },
  durationContainer: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  durationText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.xs,
  },
  lessonInfo: {
    flex: 1,
  },
  lessonItem: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
  },
  lessonLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SIZES.spacing.md,
  },
  lessonNumber: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  lessonNumberText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  lessonRight: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  lessonSubtitle: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  lessonTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  lockIcon: {
    fontSize: 14,
  },
  lockedLessonItem: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    opacity: 0.6,
  },
  lockedLessonNumber: {
    backgroundColor: COLORS.border,
  },
  lockedText: {
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.99 }],
  },
  progressBar: {
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    height: '100%',
  },
  progressBarBg: {
    backgroundColor: COLORS.border,
    borderRadius: 2,
    height: 4,
    marginBottom: 2,
    overflow: 'hidden',
    width: 50,
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: 10,
  },
  scoreContainer: {
    backgroundColor: COLORS.success + '20',
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  scoreText: {
    color: COLORS.success,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  selectedDurationText: {
    color: COLORS.surface + 'CC',
  },
  selectedLessonItem: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectedLessonNumber: {
    backgroundColor: COLORS.surface,
  },
  selectedLessonNumberText: {
    color: COLORS.primary,
  },
  selectedLessonSubtitle: {
    color: COLORS.surface + 'CC',
  },
  selectedLessonTitle: {
    color: COLORS.surface,
  },
  selectedProgressBar: {
    backgroundColor: COLORS.surface,
  },
  selectedProgressText: {
    color: COLORS.surface + 'CC',
  },
  selectedScoreText: {
    color: COLORS.surface,
  },
  selectedTestButton: {
    backgroundColor: COLORS.surface,
  },
  selectedTestButtonText: {
    color: COLORS.primary,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.sm,
    marginLeft: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  testButtonPressed: {
    opacity: 0.8,
  },
  testButtonText: {
    color: COLORS.surface,
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
});

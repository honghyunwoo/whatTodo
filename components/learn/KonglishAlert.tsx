/**
 * Konglish Alert Component
 * 콩글리시 경고 표시 컴포넌트
 *
 * 한국인이 흔히 쓰는 콩글리시(Konglish)를 감지하고
 * 올바른 영어 표현을 알려주는 컴포넌트
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export interface KonglishItem {
  id: string;
  konglish: string; // Korean-style English (콩글리시)
  correct: string; // Correct English expression
  explanation: string; // Korean explanation
  example: {
    wrong: string;
    right: string;
  };
  category: 'word' | 'phrase' | 'pronunciation' | 'grammar';
  severity: 'common' | 'warning' | 'critical';
}

interface KonglishAlertProps {
  item: KonglishItem;
  onDismiss?: () => void;
  showDismiss?: boolean;
  compact?: boolean;
}

// ─────────────────────────────────────
// Konglish Database (Sample data for reference)
// ─────────────────────────────────────

export const KONGLISH_DATABASE: KonglishItem[] = [
  {
    id: 'k1',
    konglish: '파이팅',
    correct: 'Go for it! / You can do it!',
    explanation: '"Fighting"은 영어권에서 "싸움"을 의미합니다. 응원할 때는 다른 표현을 써요.',
    example: {
      wrong: 'Fighting! You can pass the exam!',
      right: 'Go for it! You can pass the exam!',
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k2',
    konglish: '핸드폰',
    correct: 'cell phone / mobile phone',
    explanation: '"Hand phone"은 영어권에서 사용하지 않는 표현입니다.',
    example: {
      wrong: 'I lost my hand phone.',
      right: 'I lost my cell phone.',
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k3',
    konglish: '노트북',
    correct: 'laptop',
    explanation: '"Notebook"은 공책을 의미합니다. 휴대용 컴퓨터는 "laptop"이라고 해요.',
    example: {
      wrong: 'I bought a new notebook for work.',
      right: 'I bought a new laptop for work.',
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k4',
    konglish: '아르바이트',
    correct: 'part-time job',
    explanation: '"Arbeit"는 독일어입니다. 영어로는 "part-time job"이라고 해요.',
    example: {
      wrong: 'I have an arbeit at the cafe.',
      right: 'I have a part-time job at the cafe.',
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k5',
    konglish: '원샷',
    correct: 'bottoms up / down it',
    explanation:
      '"One shot"은 영어권에서 "한 번의 기회"를 의미합니다. 건배할 때는 다른 표현을 써요.',
    example: {
      wrong: 'One shot!',
      right: 'Bottoms up!',
    },
    category: 'phrase',
    severity: 'warning',
  },
  {
    id: 'k6',
    konglish: '셀카',
    correct: 'selfie',
    explanation: '"Self camera"의 줄임말이지만, 영어로는 "selfie"라고 해요.',
    example: {
      wrong: "Let's take a selca!",
      right: "Let's take a selfie!",
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k7',
    konglish: '서비스',
    correct: 'on the house / complimentary',
    explanation:
      '"Service"는 영어에서 서비스 업종을 의미합니다. 무료로 주는 것은 다른 표현을 써요.',
    example: {
      wrong: 'This drink is service.',
      right: 'This drink is on the house.',
    },
    category: 'word',
    severity: 'warning',
  },
  {
    id: 'k8',
    konglish: '컨닝',
    correct: 'cheating',
    explanation: '"Cunning"은 "교활한"이라는 형용사입니다. 시험에서 부정행위는 "cheating"이에요.',
    example: {
      wrong: 'He was cunning during the exam.',
      right: 'He was cheating during the exam.',
    },
    category: 'word',
    severity: 'critical',
  },
  {
    id: 'k9',
    konglish: '에어컨',
    correct: 'air conditioner / AC',
    explanation: '"Aircon"은 비표준 축약형입니다. "air conditioner" 또는 "AC"라고 해요.',
    example: {
      wrong: 'Please turn on the aircon.',
      right: 'Please turn on the AC.',
    },
    category: 'word',
    severity: 'common',
  },
  {
    id: 'k10',
    konglish: '미팅',
    correct: 'blind date / group date',
    explanation: '"Meeting"은 영어에서 회의를 의미합니다. 소개팅은 "blind date"라고 해요.',
    example: {
      wrong: 'I have a meeting tonight.',
      right: 'I have a blind date tonight.',
    },
    category: 'word',
    severity: 'critical',
  },
];

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function KonglishAlert({
  item,
  onDismiss,
  showDismiss = true,
  compact = false,
}: KonglishAlertProps) {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(!compact);

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Get severity color
  const getSeverityColor = () => {
    switch (item.severity) {
      case 'critical':
        return '#ef4444';
      case 'warning':
        return '#f59e0b';
      case 'common':
      default:
        return '#3b82f6';
    }
  };

  // Get severity icon
  const getSeverityIcon = () => {
    switch (item.severity) {
      case 'critical':
        return 'alert-octagon';
      case 'warning':
        return 'alert';
      case 'common':
      default:
        return 'information';
    }
  };

  // Get severity label
  const getSeverityLabel = () => {
    switch (item.severity) {
      case 'critical':
        return '주의 필요';
      case 'warning':
        return '오해 소지';
      case 'common':
      default:
        return '흔한 실수';
    }
  };

  // Get category icon
  const getCategoryIcon = () => {
    switch (item.category) {
      case 'pronunciation':
        return 'microphone';
      case 'grammar':
        return 'format-text';
      case 'phrase':
        return 'chat';
      case 'word':
      default:
        return 'alphabetical';
    }
  };

  const severityColor = getSeverityColor();

  return (
    <Animated.View entering={FadeInUp.duration(300)}>
      <Card
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
            borderLeftColor: severityColor,
          },
        ]}
      >
        <Card.Content style={styles.content}>
          {/* Header */}
          <Pressable style={styles.header} onPress={handleToggle}>
            <View style={styles.headerLeft}>
              <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
                <MaterialCommunityIcons name={getSeverityIcon()} size={16} color={severityColor} />
                <Text style={[styles.severityText, { color: severityColor }]}>
                  {getSeverityLabel()}
                </Text>
              </View>
              <View style={styles.categoryBadge}>
                <MaterialCommunityIcons
                  name={getCategoryIcon()}
                  size={14}
                  color={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.headerRight}>
              {showDismiss && onDismiss && (
                <Pressable onPress={onDismiss} style={styles.dismissButton}>
                  <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
                </Pressable>
              )}
              {compact && (
                <MaterialCommunityIcons
                  name={expanded ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textSecondary}
                />
              )}
            </View>
          </Pressable>

          {/* Konglish vs Correct */}
          <View style={styles.comparisonRow}>
            <View style={styles.wrongSection}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#ef4444" />
                <Text style={styles.wrongLabel}>콩글리시</Text>
              </View>
              <Text style={[styles.konglishText, { color: '#ef4444' }]}>{item.konglish}</Text>
            </View>

            <MaterialCommunityIcons name="arrow-right" size={20} color={colors.textSecondary} />

            <View style={styles.correctSection}>
              <View style={styles.labelRow}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#22c55e" />
                <Text style={styles.correctLabel}>올바른 표현</Text>
              </View>
              <Text style={[styles.correctText, { color: '#22c55e' }]}>{item.correct}</Text>
            </View>
          </View>

          {/* Expanded Content */}
          {expanded && (
            <Animated.View entering={FadeInUp.duration(200)}>
              {/* Explanation */}
              <View style={styles.explanationSection}>
                <MaterialCommunityIcons name="lightbulb-on" size={18} color="#f59e0b" />
                <Text style={[styles.explanationText, { color: colors.text }]}>
                  {item.explanation}
                </Text>
              </View>

              {/* Example */}
              <View style={styles.exampleSection}>
                <Text style={[styles.exampleTitle, { color: colors.textSecondary }]}>
                  예문 비교
                </Text>

                <View style={styles.exampleRow}>
                  <MaterialCommunityIcons name="close" size={14} color="#ef4444" />
                  <Text style={[styles.exampleText, styles.wrongExample]}>
                    {item.example.wrong}
                  </Text>
                </View>

                <View style={styles.exampleRow}>
                  <MaterialCommunityIcons name="check" size={14} color="#22c55e" />
                  <Text style={[styles.exampleText, styles.rightExample]}>
                    {item.example.right}
                  </Text>
                </View>
              </View>
            </Animated.View>
          )}
        </Card.Content>
      </Card>
    </Animated.View>
  );
}

// ─────────────────────────────────────
// Konglish Banner Component (for vocabulary cards)
// ─────────────────────────────────────

interface KonglishBannerProps {
  konglish: string;
  correct: string;
  onPress?: () => void;
}

export function KonglishBanner({ konglish, correct, onPress }: KonglishBannerProps) {
  const { colors, isDark } = useTheme();

  return (
    <Pressable
      style={[
        styles.banner,
        { backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)' },
      ]}
      onPress={onPress}
    >
      <MaterialCommunityIcons name="alert" size={16} color="#ef4444" />
      <View style={styles.bannerContent}>
        <Text style={styles.bannerKonglish}>
          <Text style={{ color: '#ef4444' }}>{konglish}</Text>
          <Text style={{ color: colors.textSecondary }}> (X) → </Text>
          <Text style={{ color: '#22c55e' }}>{correct}</Text>
          <Text style={{ color: colors.textSecondary }}> (O)</Text>
        </Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textSecondary} />
    </Pressable>
  );
}

// ─────────────────────────────────────
// Konglish Quiz Component
// ─────────────────────────────────────

interface KonglishQuizProps {
  items: KonglishItem[];
  onComplete: (score: number, total: number) => void;
}

export function KonglishQuiz({ items, onComplete }: KonglishQuizProps) {
  const { colors, isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentItem = items[currentIndex];
  const isLastQuestion = currentIndex === items.length - 1;
  const progress = ((currentIndex + 1) / items.length) * 100;

  // Generate options (correct + 2 random wrong answers)
  const options = React.useMemo(() => {
    const correctAnswer = currentItem.correct;
    const wrongAnswers = items
      .filter((item) => item.id !== currentItem.id)
      .map((item) => item.correct)
      .slice(0, 2);

    return [correctAnswer, ...wrongAnswers].sort(() => Math.random() - 0.5);
  }, [currentItem, items]);

  const handleSelect = useCallback(
    (answer: string) => {
      if (isAnswered) return;

      setSelectedAnswer(answer);
      setIsAnswered(true);

      if (answer === currentItem.correct) {
        setScore((prev) => prev + 1);
      }
    },
    [isAnswered, currentItem.correct]
  );

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      const finalScore = selectedAnswer === currentItem.correct ? score + 1 : score;
      onComplete(finalScore, items.length);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    }
  }, [isLastQuestion, selectedAnswer, currentItem.correct, score, items.length, onComplete]);

  return (
    <View style={[styles.quizContainer, { backgroundColor: colors.background }]}>
      {/* Progress */}
      <View
        style={[styles.progressContainer, { backgroundColor: isDark ? '#38383A' : COLORS.border }]}
      >
        <View style={[styles.progressBar, { width: `${progress}%` }]} />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {currentIndex + 1} / {items.length}
      </Text>

      {/* Question */}
      <Card style={[styles.quizCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
        <Card.Content>
          <Text style={[styles.quizQuestion, { color: colors.textSecondary }]}>
            다음 콩글리시의 올바른 영어 표현은?
          </Text>
          <Text style={[styles.quizKonglish, { color: '#ef4444' }]}>
            &quot;{currentItem.konglish}&quot;
          </Text>
        </Card.Content>
      </Card>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isCorrect = option === currentItem.correct;
          const isSelected = option === selectedAnswer;

          let backgroundColor = isDark ? '#2C2C2E' : COLORS.surface;
          let borderColor: string = COLORS.border;

          if (isAnswered) {
            if (isCorrect) {
              backgroundColor = 'rgba(34, 197, 94, 0.15)';
              borderColor = '#22c55e';
            } else if (isSelected) {
              backgroundColor = 'rgba(239, 68, 68, 0.15)';
              borderColor = '#ef4444';
            }
          } else if (isSelected) {
            borderColor = COLORS.primary;
          }

          return (
            <Pressable
              key={index}
              style={[styles.optionButton, { backgroundColor, borderColor }]}
              onPress={() => handleSelect(option)}
              disabled={isAnswered}
            >
              <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
              {isAnswered && isCorrect && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#22c55e" />
              )}
              {isAnswered && isSelected && !isCorrect && (
                <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Explanation (after answering) */}
      {isAnswered && (
        <Animated.View entering={FadeInUp.duration(300)}>
          <View style={styles.quizExplanation}>
            <MaterialCommunityIcons name="lightbulb-on" size={18} color="#f59e0b" />
            <Text style={[styles.quizExplanationText, { color: colors.text }]}>
              {currentItem.explanation}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Next Button */}
      {isAnswered && (
        <Pressable
          style={[styles.quizNextButton, { backgroundColor: COLORS.primary }]}
          onPress={handleNext}
        >
          <Text style={styles.quizNextButtonText}>
            {isLastQuestion ? '결과 보기' : '다음 문제'}
          </Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    marginBottom: SIZES.spacing.md,
  },
  content: {
    gap: SIZES.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
  },
  severityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 2,
    borderRadius: SIZES.borderRadius.sm,
  },
  severityText: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '600',
  },
  categoryBadge: {
    padding: 4,
  },
  dismissButton: {
    padding: 4,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SIZES.spacing.sm,
  },
  wrongSection: {
    flex: 1,
  },
  correctSection: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  wrongLabel: {
    fontSize: SIZES.fontSize.xs,
    color: '#ef4444',
    fontWeight: '500',
  },
  correctLabel: {
    fontSize: SIZES.fontSize.xs,
    color: '#22c55e',
    fontWeight: '500',
  },
  konglishText: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  correctText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  explanationSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.md,
    padding: SIZES.spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
  },
  explanationText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 22,
  },
  exampleSection: {
    marginTop: SIZES.spacing.md,
    gap: SIZES.spacing.sm,
  },
  exampleTitle: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
    marginBottom: SIZES.spacing.xs,
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
  },
  exampleText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
  },
  wrongExample: {
    color: '#ef4444',
    textDecorationLine: 'line-through',
  },
  rightExample: {
    color: '#22c55e',
  },

  // Banner styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
    marginVertical: SIZES.spacing.xs,
  },
  bannerContent: {
    flex: 1,
  },
  bannerKonglish: {
    fontSize: SIZES.fontSize.sm,
  },

  // Quiz styles
  quizContainer: {
    flex: 1,
    padding: SIZES.spacing.md,
  },
  progressContainer: {
    height: 8,
    borderRadius: SIZES.borderRadius.full,
    overflow: 'hidden',
    marginBottom: SIZES.spacing.xs,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius.full,
  },
  progressText: {
    fontSize: SIZES.fontSize.sm,
    textAlign: 'right',
    marginBottom: SIZES.spacing.md,
  },
  quizCard: {
    marginBottom: SIZES.spacing.lg,
  },
  quizQuestion: {
    fontSize: SIZES.fontSize.md,
    marginBottom: SIZES.spacing.md,
  },
  quizKonglish: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: SIZES.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 2,
  },
  optionText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  quizExplanation: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.lg,
    padding: SIZES.spacing.md,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: SIZES.borderRadius.md,
  },
  quizExplanationText: {
    flex: 1,
    fontSize: SIZES.fontSize.sm,
    lineHeight: 22,
  },
  quizNextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.lg,
  },
  quizNextButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default KonglishAlert;

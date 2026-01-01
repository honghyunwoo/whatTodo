/**
 * QuickStartCard - 30초 퀵 학습 시작 카드
 * 홈 화면 상단에서 바로 학습을 시작할 수 있는 CTA 카드
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useStreakStore } from '@/store/streakStore';
import { useLearnStore } from '@/store/learnStore';

/**
 * QuickStartCard: 홈 화면 최상단 퀵 학습 시작 카드
 * - 그라디언트 배경
 * - 스트릭 경고 표시
 * - 30초 세션 바로 시작
 */
export function QuickStartCard() {
  const router = useRouter();

  // Store 구독
  const { currentStreak, lastStudyDate } = useStreakStore();
  const currentLevel = useLearnStore((state) => state.currentLevel);
  const weekProgress = useLearnStore((state) => state.weekProgress);

  // 오늘 학습 여부 확인
  const didLearnToday = useMemo(() => {
    if (!lastStudyDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return lastStudyDate === today;
  }, [lastStudyDate]);

  // 현재 진행 상태 계산
  const progress = useMemo(() => {
    if (!weekProgress || weekProgress.length === 0) return 0;
    const currentWeekProgress = weekProgress[weekProgress.length - 1];
    return currentWeekProgress?.activitiesCompleted?.length || 0;
  }, [weekProgress]);

  // 스트릭 위험 상태
  const streakAtRisk = currentStreak > 0 && !didLearnToday;

  const handlePress = () => {
    // 학습 탭으로 이동하여 세션 시작
    router.push('/(tabs)/learn');
  };

  // 메시지 결정
  const getMessage = () => {
    if (!didLearnToday) {
      if (currentStreak > 0) {
        return {
          title: '오늘 아직 학습 안 했어요!',
          subtitle: `${currentStreak}일 스트릭을 유지하세요`,
          icon: 'flame' as const,
          urgent: true,
        };
      }
      return {
        title: '오늘의 학습 시작하기',
        subtitle: '30초면 충분해요',
        icon: 'play-circle' as const,
        urgent: false,
      };
    }
    return {
      title: '잘 하고 있어요! 한 번 더?',
      subtitle: `오늘 ${progress}개 활동 완료`,
      icon: 'sparkles' as const,
      urgent: false,
    };
  };

  const message = getMessage();

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      <LinearGradient
        colors={
          streakAtRisk ? ['#FF6B6B', '#EE5A5A', '#DD4949'] : ['#667eea', '#764ba2', '#6B66EA']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* 배경 장식 */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        {/* 콘텐츠 */}
        <View style={styles.content}>
          {/* 아이콘 */}
          <View style={styles.iconContainer}>
            <Ionicons
              name={message.icon}
              size={32}
              color={message.urgent ? '#FFE066' : '#FFFFFF'}
            />
          </View>

          {/* 텍스트 */}
          <View style={styles.textContainer}>
            <Text style={styles.title}>{message.title}</Text>
            <Text style={styles.subtitle}>{message.subtitle}</Text>
          </View>

          {/* 화살표 */}
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward-circle" size={36} color="#FFFFFF" />
          </View>
        </View>

        {/* 레벨 배지 */}
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{currentLevel}</Text>
        </View>

        {/* 스트릭 표시 */}
        {currentStreak > 0 && (
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FFE066" />
            <Text style={styles.streakText}>{currentStreak}</Text>
          </View>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    marginBottom: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.xl,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    padding: SIZES.spacing.lg,
  },
  decorCircle1: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 100,
    height: 120,
    position: 'absolute',
    right: -30,
    top: -30,
    width: 120,
  },
  decorCircle2: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 80,
    bottom: -40,
    height: 100,
    left: -20,
    position: 'absolute',
    width: 100,
  },
  gradient: {
    minHeight: 100,
    overflow: 'hidden',
    position: 'relative',
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SIZES.borderRadius.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  levelBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: SIZES.borderRadius.sm,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
    right: SIZES.spacing.md,
    top: SIZES.spacing.md,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '700',
  },
  streakBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: SIZES.borderRadius.full,
    bottom: SIZES.spacing.md,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: 4,
    position: 'absolute',
    right: SIZES.spacing.md,
  },
  streakText: {
    color: '#FFE066',
    fontSize: SIZES.fontSize.xs,
    fontWeight: '700',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
});

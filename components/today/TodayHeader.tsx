/**
 * TodayHeader - 오늘 탭 헤더 (리디자인)
 *
 * Soft Brutalism + 한지 스타일:
 * - 대담한 날짜 타이포그래피
 * - 인장(印章) 스타일 스트릭 배지
 * - 부드러운 그라데이션 배경
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

import { PALETTE, TYPOGRAPHY, SPACE, RADIUS, SHADOW, withOpacity } from '@/constants/design';
import { useStreakStore } from '@/store/streakStore';

// 요일 한글
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEKDAY_COLORS = ['#C73E3A', '#333', '#333', '#333', '#333', '#333', '#2E5A88'];

export function TodayHeader() {
  const router = useRouter();
  const { currentStreak } = useStreakStore();

  // 오늘 날짜 포맷
  const dateInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const dayOfWeek = now.getDay();
    const weekday = WEEKDAYS[dayOfWeek];
    const weekdayColor = WEEKDAY_COLORS[dayOfWeek];

    return {
      year,
      month,
      day,
      weekday,
      weekdayColor,
      greeting: getGreeting(),
      monthStr: String(month).padStart(2, '0'),
      dayStr: String(day).padStart(2, '0'),
    };
  }, []);

  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '고요한 새벽';
    if (hour < 12) return '상쾌한 아침';
    if (hour < 14) return '활기찬 점심';
    if (hour < 18) return '따뜻한 오후';
    if (hour < 21) return '포근한 저녁';
    return '평화로운 밤';
  }

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  return (
    <LinearGradient
      colors={[PALETTE.paper.cream, PALETTE.paper.warm]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.container}
    >
      {/* 상단: 인사 + 액션 버튼 */}
      <View style={styles.topRow}>
        <Animated.View entering={FadeInDown.delay(100).duration(500)}>
          <Text style={styles.greeting}>{dateInfo.greeting}</Text>
        </Animated.View>

        <View style={styles.actions}>
          {/* 스트릭 배지 - 인장 스타일 */}
          {currentStreak > 0 && (
            <Animated.View
              entering={FadeInRight.delay(200).duration(400)}
              style={styles.streakBadge}
            >
              <View style={styles.streakInner}>
                <Text style={styles.streakFire}>
                  {currentStreak >= 7 ? '🔥' : currentStreak >= 3 ? '✨' : '🌱'}
                </Text>
                <Text style={styles.streakCount}>{currentStreak}</Text>
                <Text style={styles.streakLabel}>연속</Text>
              </View>
            </Animated.View>
          )}

          <Pressable
            style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
            onPress={handleOpenSettings}
          >
            <Ionicons name="cog-outline" size={24} color={PALETTE.ink.medium} />
          </Pressable>
        </View>
      </View>

      {/* 메인: 날짜 디스플레이 - 대담한 타이포그래피 */}
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.dateContainer}>
        {/* 연도 - 작게 */}
        <Text style={styles.year}>{dateInfo.year}</Text>

        {/* 월.일 - 크게 */}
        <View style={styles.dateMain}>
          <Text style={styles.dateNumber}>{dateInfo.monthStr}</Text>
          <Text style={styles.dateDot}>.</Text>
          <Text style={styles.dateNumber}>{dateInfo.dayStr}</Text>
        </View>

        {/* 요일 - 인장 스타일 */}
        <View
          style={[
            styles.weekdayBadge,
            { backgroundColor: withOpacity(dateInfo.weekdayColor, 0.1) },
          ]}
        >
          <Text style={[styles.weekdayText, { color: dateInfo.weekdayColor }]}>
            {dateInfo.weekday}요일
          </Text>
        </View>
      </Animated.View>

      {/* 하단 장식선 */}
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <View style={styles.dividerDiamond} />
        <View style={styles.dividerLine} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: SPACE.lg,
    paddingBottom: SPACE.md,
    paddingHorizontal: SPACE.lg,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACE.md,
  },
  greeting: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.medium,
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.sm,
  },
  streakBadge: {
    backgroundColor: '#FFFAF0',
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: PALETTE.seal.vermilion,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  streakInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.sm,
    gap: 4,
  },
  streakFire: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: TYPOGRAPHY.size.lg,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: PALETTE.seal.vermilion,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.size.xs,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.seal.vermilion,
    opacity: 0.8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: withOpacity(PALETTE.ink.black, 0.05),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  dateContainer: {
    alignItems: 'center',
    marginVertical: SPACE.md,
  },
  year: {
    fontSize: TYPOGRAPHY.size.sm,
    fontWeight: TYPOGRAPHY.weight.medium,
    color: PALETTE.ink.light,
    letterSpacing: 2,
    marginBottom: SPACE.xxs,
  },
  dateMain: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  dateNumber: {
    fontSize: 64,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: PALETTE.ink.black,
    letterSpacing: -2,
    lineHeight: 72,
  },
  dateDot: {
    fontSize: 48,
    fontWeight: TYPOGRAPHY.weight.heavy,
    color: PALETTE.seal.red,
    marginHorizontal: 2,
    lineHeight: 72,
  },
  weekdayBadge: {
    marginTop: SPACE.sm,
    paddingVertical: SPACE.xs,
    paddingHorizontal: SPACE.lg,
    borderRadius: RADIUS.full,
  },
  weekdayText: {
    fontSize: TYPOGRAPHY.size.md,
    fontWeight: TYPOGRAPHY.weight.semibold,
    letterSpacing: 1,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACE.lg,
    gap: SPACE.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: PALETTE.paper.aged,
  },
  dividerDiamond: {
    width: 8,
    height: 8,
    backgroundColor: PALETTE.seal.red,
    transform: [{ rotate: '45deg' }],
  },
});

export default TodayHeader;

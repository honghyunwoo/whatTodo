/**
 * TodayHeader - 오늘 탭 헤더
 *
 * 표시:
 * - 오늘 날짜 (한국어 포맷)
 * - 스트릭 표시
 */

import React, { useMemo } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { useStreakStore } from '@/store/streakStore';

// 요일 한글
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function TodayHeader() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // 스트릭 정보
  const { currentStreak, getStreakDisplayInfo } = useStreakStore();
  const streakInfo = getStreakDisplayInfo();

  // 오늘 날짜 포맷
  const dateInfo = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekday = WEEKDAYS[now.getDay()];

    return {
      full: `${year}년 ${month}월 ${day}일`,
      weekday: `${weekday}요일`,
      greeting: getGreeting(),
    };
  }, []);

  // 시간대별 인사
  function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 6) return '새벽이에요';
    if (hour < 12) return '좋은 아침이에요';
    if (hour < 18) return '좋은 오후에요';
    if (hour < 22) return '좋은 저녁이에요';
    return '오늘도 수고했어요';
  }

  // 설정 열기
  const handleOpenSettings = () => {
    router.push('/settings');
  };

  return (
    <View style={[styles.container, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5E7' }]}>
      {/* 왼쪽: 날짜 + 인사 */}
      <View style={styles.left}>
        <Text style={[styles.greeting, { color: colors.textSecondary }]}>{dateInfo.greeting}</Text>
        <View style={styles.dateRow}>
          <Text style={[styles.date, { color: colors.text }]}>{dateInfo.full}</Text>
          <Text style={[styles.weekday, { color: colors.primary }]}>{dateInfo.weekday}</Text>
        </View>
      </View>

      {/* 오른쪽: 스트릭 + 설정 */}
      <View style={styles.right}>
        {currentStreak > 0 && (
          <View style={[styles.streakBadge, { backgroundColor: isDark ? '#2C2C2E' : '#FFF3E0' }]}>
            <Text style={styles.streakFire}>{streakInfo.fire || '🔥'}</Text>
            <Text style={[styles.streakCount, { color: '#FF6B35' }]}>{currentStreak}</Text>
          </View>
        )}
        <Pressable
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}
          onPress={handleOpenSettings}
        >
          <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    borderBottomWidth: 1,
  },
  left: {
    flex: 1,
  },
  greeting: {
    fontSize: SIZES.fontSize.sm,
    marginBottom: 2,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  date: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  weekday: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.full,
    gap: 4,
  },
  streakFire: {
    fontSize: 16,
  },
  streakCount: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  settingsButton: {
    padding: SIZES.spacing.xs,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default TodayHeader;

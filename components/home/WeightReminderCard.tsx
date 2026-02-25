import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { formatDateToString } from '@/utils/day';
import { getWeightLogByDate } from '@/utils/weight';
import { SIZES } from '@/constants/sizes';

export function WeightReminderCard() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const weightLogs = useUserStore((state) => state.weightLogs);

  const todayDate = formatDateToString(new Date());
  const hasTodayWeight = useMemo(
    () => Boolean(getWeightLogByDate(weightLogs, todayDate)),
    [weightLogs, todayDate]
  );

  if (hasTodayWeight) {
    return null;
  }

  return (
    <Animated.View entering={FadeInDown.delay(100).duration(250)} style={styles.container}>
      <Pressable
        style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        onPress={() => router.push('/(tabs)/settings')}
      >
        <View style={styles.iconWrap}>
          <Ionicons name="fitness-outline" size={18} color={colors.primary} />
        </View>
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>오늘 체중 기록</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            아직 입력 전이에요. 10초만에 기록할 수 있어요.
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
  },
  card: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.12)',
    borderRadius: 999,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
});

export default WeightReminderCard;

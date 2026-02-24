import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';

import { SIZES, SHADOWS } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

function RoutineIslandCardComponent() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? '#3A3A3C' : '#E9E3D9',
        },
      ]}
      onPress={() => router.push('/routine-island')}
      activeOpacity={0.85}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${colors.primary}1A` }]}>
        <Ionicons name="leaf-outline" size={22} color={colors.primary} />
      </View>

      <View style={styles.textWrap}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>루틴 섬 정산</Text>
          <View style={[styles.badge, { backgroundColor: `${colors.primary}20` }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>BETA</Text>
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          정산 받고 오늘의 Next1으로 바로 복귀하세요
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  container: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.md,
    ...SHADOWS.sm,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.full,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  subtitle: {
    fontSize: SIZES.fontSize.sm,
    marginTop: 2,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '700',
  },
  titleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
});

export const RoutineIslandCard = memo(RoutineIslandCardComponent);

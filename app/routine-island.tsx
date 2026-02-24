import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { IslandBuildingType, IslandFocusType, useIslandStore } from '@/store/islandStore';
import { useTaskStore } from '@/store/taskStore';
import { TaskPriority } from '@/types';

const FOCUS_OPTIONS: { id: IslandFocusType; label: string; helper: string }[] = [
  { id: 'plan', label: '계획', helper: '씨앗 +20%' },
  { id: 'reflect', label: '회고', helper: '물 +20%' },
  { id: 'learn', label: '학습', helper: '햇빛 +20%' },
];

const BUILDING_OPTIONS: { id: IslandBuildingType; label: string; helper: string }[] = [
  { id: 'greenhouse', label: '온실', helper: '작물 성장 가속' },
  { id: 'well', label: '우물', helper: '물 생산 효율' },
  { id: 'library', label: '도서관', helper: '학습 효율' },
];

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const formatDuration = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours <= 0) return `${minutes}분`;
  return `${hours}시간 ${minutes}분`;
};

const formatHours = (seconds: number) => `${(seconds / 3600).toFixed(1)}h`;

export default function RoutineIslandScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [lastClaimSummary, setLastClaimSummary] = useState<string | null>(null);

  const resources = useIslandStore((state) => state.resources);
  const buildings = useIslandStore((state) => state.buildings);
  const focus = useIslandStore((state) => state.focus);
  const getSettlementPreview = useIslandStore((state) => state.getSettlementPreview);
  const claimSettlement = useIslandStore((state) => state.claimSettlement);
  const chooseDailyFocus = useIslandStore((state) => state.chooseDailyFocus);
  const getUpgradeCost = useIslandStore((state) => state.getUpgradeCost);
  const upgradeBuilding = useIslandStore((state) => state.upgradeBuilding);
  const markNext1Started = useIslandStore((state) => state.markNext1Started);

  const tasks = useTaskStore((state) => state.tasks);
  const nextTaskId = useMemo(() => {
    const nextTask = tasks
      .filter((task) => !task.completed)
      .sort((a, b) => {
        const priorityGap = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
        if (priorityGap !== 0) return priorityGap;

        const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        if (aDue !== bDue) return aDue - bDue;

        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      })[0];
    return nextTask?.id ?? null;
  }, [tasks]);

  const settlementPreview = getSettlementPreview();

  const handleClaim = useCallback(() => {
    try {
      const result = claimSettlement();
      setLastClaimSummary(
        `코인 +${result.gains.coin} / 씨앗 +${result.gains.seed} / 물 +${result.gains.water} / 햇빛 +${result.gains.sunlight}`
      );
    } catch (error) {
      console.error('[RoutineIsland] claim failed:', error);
      Alert.alert('정산 실패', '정산에 실패했어요. 다시 시도해주세요.');
    }
  }, [claimSettlement]);

  const handleChooseFocus = useCallback(
    (type: IslandFocusType) => {
      const changed = chooseDailyFocus(type);
      if (!changed) {
        Alert.alert('오늘 포커스 고정', '오늘의 포커스는 이미 선택했어요.');
      }
    },
    [chooseDailyFocus]
  );

  const handleUpgradeBuilding = useCallback(
    (building: IslandBuildingType) => {
      if (!upgradeBuilding(building)) {
        Alert.alert('코인 부족', '정산을 먼저 받거나 낮은 단계 건물부터 올려주세요.');
      }
    },
    [upgradeBuilding]
  );

  const handleStartNext1 = useCallback(() => {
    markNext1Started();
    if (nextTaskId) {
      router.push({ pathname: '/task/[id]', params: { id: nextTaskId } });
      return;
    }
    router.push('/(tabs)');
  }, [markNext1Started, nextTaskId, router]);

  return (
    <>
      <Stack.Screen options={{ title: '루틴 섬', headerShown: true }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
      >
        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>지난 접속 후 성장</Text>
          <Text style={[styles.helper, { color: colors.textSecondary }]}>
            경과 {formatDuration(settlementPreview.elapsedSeconds)} / 유효{' '}
            {formatHours(settlementPreview.effectiveSeconds)}
          </Text>
          <View style={styles.resourceGrid}>
            <ResourcePill label="코인" value={settlementPreview.gains.coin} color="#B9814B" />
            <ResourcePill label="씨앗" value={settlementPreview.gains.seed} color="#5D9B3B" />
            <ResourcePill label="물" value={settlementPreview.gains.water} color="#3E8ED6" />
            <ResourcePill label="햇빛" value={settlementPreview.gains.sunlight} color="#E7A82E" />
          </View>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleClaim}
          >
            <Text style={styles.primaryButtonText}>정산 받기</Text>
          </Pressable>
          {lastClaimSummary ? (
            <Text style={[styles.helper, { color: colors.textSecondary }]}>{lastClaimSummary}</Text>
          ) : null}
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>오늘의 포커스</Text>
          <View style={styles.focusGrid}>
            {FOCUS_OPTIONS.map((option) => {
              const selected = focus.date === getTodayKey() && focus.type === option.id;
              return (
                <Pressable
                  key={option.id}
                  style={[
                    styles.focusCard,
                    {
                      backgroundColor: selected ? colors.primary : isDark ? '#2C2C2E' : '#F6F2EA',
                    },
                  ]}
                  onPress={() => handleChooseFocus(option.id)}
                >
                  <Text style={[styles.focusTitle, { color: selected ? '#fff' : colors.text }]}>
                    {option.label}
                  </Text>
                  <Text
                    style={[
                      styles.focusHelper,
                      { color: selected ? '#fff' : colors.textSecondary },
                    ]}
                  >
                    {option.helper}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>건물 업그레이드</Text>
          {BUILDING_OPTIONS.map((building) => {
            const level = buildings[building.id];
            const cost = getUpgradeCost(building.id);
            const disabled = resources.coin < cost;

            return (
              <View key={building.id} style={styles.buildingRow}>
                <View style={styles.buildingInfo}>
                  <Text style={[styles.buildingTitle, { color: colors.text }]}>
                    {building.label} Lv.{level}
                  </Text>
                  <Text style={[styles.helper, { color: colors.textSecondary }]}>
                    {building.helper} / 업그레이드 {cost} 코인
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.upgradeButton,
                    { backgroundColor: disabled ? '#C8C8CC' : colors.primary },
                  ]}
                  onPress={() => handleUpgradeBuilding(building.id)}
                  disabled={disabled}
                >
                  <Text style={styles.upgradeText}>투자</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: colors.primary }]}
          onPress={handleStartNext1}
        >
          <Text style={styles.primaryButtonText}>Next1 시작</Text>
        </Pressable>
      </ScrollView>
    </>
  );
}

function ResourcePill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View
      style={[styles.resourcePill, { borderColor: `${color}30`, backgroundColor: `${color}14` }]}
    >
      <Text style={[styles.resourceLabel, { color }]}>{label}</Text>
      <Text style={[styles.resourceValue, { color }]}>{`+${value}`}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  buildingInfo: { flex: 1, gap: 2 },
  buildingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SIZES.spacing.sm,
    justifyContent: 'space-between',
    paddingVertical: SIZES.spacing.xs,
  },
  buildingTitle: { fontSize: SIZES.fontSize.md, fontWeight: '700' },
  card: {
    borderRadius: SIZES.borderRadius.lg,
    borderWidth: 1,
    gap: SIZES.spacing.sm,
    padding: SIZES.spacing.md,
  },
  container: { flex: 1 },
  content: { gap: SIZES.spacing.md, padding: SIZES.spacing.md, paddingBottom: SIZES.spacing.xl },
  focusCard: {
    borderRadius: SIZES.borderRadius.md,
    flex: 1,
    gap: 2,
    minWidth: 92,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
  },
  focusGrid: { flexDirection: 'row', gap: SIZES.spacing.sm },
  focusHelper: { fontSize: SIZES.fontSize.xs },
  focusTitle: { fontSize: SIZES.fontSize.sm, fontWeight: '700' },
  helper: { fontSize: SIZES.fontSize.sm },
  primaryButton: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: SIZES.spacing.md,
  },
  primaryButtonText: { color: '#fff', fontSize: SIZES.fontSize.md, fontWeight: '700' },
  resourceGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SIZES.spacing.xs },
  resourceLabel: { fontSize: SIZES.fontSize.xs, fontWeight: '700' },
  resourcePill: {
    borderRadius: SIZES.borderRadius.md,
    borderWidth: 1,
    minWidth: '48%',
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  resourceValue: { fontSize: SIZES.fontSize.md, fontWeight: '800', marginTop: 1 },
  sectionTitle: { fontSize: SIZES.fontSize.md, fontWeight: '700' },
  title: { fontSize: SIZES.fontSize.lg, fontWeight: '800' },
  upgradeButton: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 72,
    paddingHorizontal: SIZES.spacing.sm,
  },
  upgradeText: { color: '#fff', fontSize: SIZES.fontSize.sm, fontWeight: '700' },
});

import React, { memo, useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { useTheme } from '@/contexts/ThemeContext';
import { SIZES } from '@/constants/sizes';
import { useTaskStore } from '@/store/taskStore';
import { SmartListType, SmartListConfig } from '@/types/task';
import { todoHaptics } from '@/services/hapticService';

// 스마트 리스트 설정
const SMART_LISTS: SmartListConfig[] = [
  {
    id: 'today',
    name: '오늘',
    icon: 'calendar-outline',
    color: '#10B981', // 초록색
  },
  {
    id: 'upcoming',
    name: '예정',
    icon: 'calendar',
    color: '#3B82F6', // 파란색
  },
  {
    id: 'anytime',
    name: '언제든',
    icon: 'layers-outline',
    color: '#8B5CF6', // 보라색
  },
  {
    id: 'completed',
    name: '완료',
    icon: 'checkmark-circle-outline',
    color: '#6B7280', // 회색
  },
];

interface SmartListTabProps {
  config: SmartListConfig;
  isActive: boolean;
  count: number;
  onPress: () => void;
}

const SmartListTab = memo(function SmartListTab({
  config,
  isActive,
  count,
  onPress,
}: SmartListTabProps) {
  const { isDark } = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.tabWrapper}>
      <MotiView
        animate={{
          backgroundColor: isActive
            ? isDark
              ? `${config.color}20`
              : `${config.color}15`
            : 'transparent',
          scale: isActive ? 1 : 0.95,
        }}
        transition={{ type: 'timing', duration: 200 }}
        style={[styles.tab, isActive && { borderColor: config.color, borderWidth: 1.5 }]}
      >
        <Ionicons
          name={config.icon as keyof typeof Ionicons.glyphMap}
          size={20}
          color={isActive ? config.color : isDark ? '#8E8E93' : '#6B7280'}
        />
        <Text
          style={[
            styles.tabLabel,
            {
              color: isActive ? config.color : isDark ? '#8E8E93' : '#6B7280',
              fontWeight: isActive ? '600' : '400',
            },
          ]}
        >
          {config.name}
        </Text>
        {count > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isActive ? config.color : isDark ? '#3A3A3C' : '#E5E5EA',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                { color: isActive ? '#FFFFFF' : isDark ? '#8E8E93' : '#6B7280' },
              ]}
            >
              {count > 99 ? '99+' : count}
            </Text>
          </View>
        )}
      </MotiView>
    </Pressable>
  );
});

function SmartListTabsComponent() {
  const smartList = useTaskStore((state) => state.smartList);
  const setSmartList = useTaskStore((state) => state.setSmartList);
  const getSmartListCount = useTaskStore((state) => state.getSmartListCount);

  const handleTabPress = useCallback(
    async (listType: SmartListType) => {
      if (listType !== smartList) {
        await todoHaptics.tap();
        setSmartList(listType);
      }
    },
    [smartList, setSmartList]
  );

  return (
    <View style={styles.container}>
      {SMART_LISTS.map((config) => (
        <SmartListTab
          key={config.id}
          config={config}
          isActive={smartList === config.id}
          count={getSmartListCount(config.id)}
          onPress={() => handleTabPress(config.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    gap: SIZES.spacing.xs,
  },
  tabWrapper: {
    flex: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.xs,
    borderRadius: SIZES.radius.md,
    gap: 4,
  },
  tabLabel: {
    fontSize: SIZES.fontSize.sm,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export const SmartListTabs = memo(SmartListTabsComponent);

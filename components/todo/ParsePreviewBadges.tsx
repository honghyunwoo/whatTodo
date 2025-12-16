import React, { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { MotiView } from 'moti';

import { ParsePreview } from '@/types/naturalLanguage';
import { useTheme } from '@/contexts/ThemeContext';
import { SIZES } from '@/constants/sizes';

interface Props {
  preview: ParsePreview;
}

function ParsePreviewBadgesComponent({ preview }: Props) {
  const { isDark } = useTheme();

  // 아무것도 파싱되지 않았으면 렌더링하지 않음
  if (
    !preview.hasDate &&
    !preview.hasTime &&
    !preview.hasPriority &&
    !preview.hasTags &&
    !preview.hasRecurrence
  ) {
    return null;
  }

  const chipStyle = (color: string) => [
    styles.chip,
    {
      backgroundColor: isDark ? `${color}30` : `${color}15`,
    },
  ];

  const textStyle = (color: string) => ({
    color,
    fontSize: 12,
  });

  return (
    <MotiView
      from={{ opacity: 0, translateY: -10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 200 }}
      style={styles.container}
    >
      {preview.hasDate && (
        <Chip
          icon={() => <Ionicons name="calendar-outline" size={14} color="#10B981" />}
          style={chipStyle('#10B981')}
          textStyle={textStyle('#10B981')}
          compact
        >
          {preview.dateDisplay}
        </Chip>
      )}

      {preview.hasTime && (
        <Chip
          icon={() => <Ionicons name="time-outline" size={14} color="#3B82F6" />}
          style={chipStyle('#3B82F6')}
          textStyle={textStyle('#3B82F6')}
          compact
        >
          {preview.timeDisplay}
        </Chip>
      )}

      {preview.hasPriority && (
        <Chip
          icon={() => <Ionicons name="flag-outline" size={14} color="#EF4444" />}
          style={chipStyle('#EF4444')}
          textStyle={textStyle('#EF4444')}
          compact
        >
          {preview.priorityDisplay}
        </Chip>
      )}

      {preview.hasRecurrence && (
        <Chip
          icon={() => <Ionicons name="repeat-outline" size={14} color="#F59E0B" />}
          style={chipStyle('#F59E0B')}
          textStyle={textStyle('#F59E0B')}
          compact
        >
          {preview.recurrenceDisplay}
        </Chip>
      )}

      {preview.hasTags &&
        preview.tagsDisplay?.map((tag, i) => (
          <Chip
            key={i}
            icon={() => <Ionicons name="pricetag-outline" size={14} color="#8B5CF6" />}
            style={chipStyle('#8B5CF6')}
            textStyle={textStyle('#8B5CF6')}
            compact
          >
            {tag}
          </Chip>
        ))}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SIZES.spacing.sm,
    paddingHorizontal: 4,
  },
  chip: {
    height: 28,
  },
});

export const ParsePreviewBadges = memo(ParsePreviewBadgesComponent);

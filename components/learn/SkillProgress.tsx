/**
 * SkillProgress Component
 * Hexagonal radar chart for 6-skill visualization
 * Uses SVG - NO EMOJI
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Line, Path, Polygon } from 'react-native-svg';

import { SkillProgress as SkillProgressType } from '@/types/journal';

// Skill definitions with colors and icons
const SKILLS = [
  { key: 'vocabulary', label: 'Vocabulary', color: '#ec4899', icon: 'book-open-variant' },
  { key: 'grammar', label: 'Grammar', color: '#6366f1', icon: 'format-text' },
  { key: 'listening', label: 'Listening', color: '#3b82f6', icon: 'headphones' },
  { key: 'reading', label: 'Reading', color: '#a855f7', icon: 'book-open-page-variant' },
  { key: 'speaking', label: 'Speaking', color: '#22c55e', icon: 'microphone' },
  { key: 'writing', label: 'Writing', color: '#f97316', icon: 'fountain-pen-tip' },
] as const;

interface SkillProgressProps {
  progress: SkillProgressType;
  size?: number;
  showLabels?: boolean;
  showIcons?: boolean;
  showValues?: boolean;
}

export const SkillProgress: React.FC<SkillProgressProps> = ({
  progress,
  size = 200,
  showLabels = true,
  showIcons = true,
  showValues = true,
}) => {
  const center = size / 2;
  const maxRadius = size * 0.35; // Max radius for chart
  const labelRadius = size * 0.48; // Radius for labels/icons

  // Calculate polygon points for the radar chart
  const getPolygonPoints = useMemo(() => {
    const points: string[] = [];
    const angleStep = (Math.PI * 2) / 6;

    SKILLS.forEach((skill, index) => {
      const value = progress[skill.key as keyof SkillProgressType] as number || 0;
      const normalizedValue = Math.min(100, Math.max(0, value)) / 100;
      const radius = maxRadius * normalizedValue;
      // Start from top (-90 degrees)
      const angle = angleStep * index - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      points.push(`${x},${y}`);
    });

    return points.join(' ');
  }, [progress, center, maxRadius]);

  // Calculate positions for grid lines
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const angleStep = (Math.PI * 2) / 6;

  // Calculate label positions
  const getLabelPosition = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + labelRadius * Math.cos(angle),
      y: center + labelRadius * Math.sin(angle),
    };
  };

  // Calculate axis endpoints
  const getAxisEndpoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    return {
      x: center + maxRadius * Math.cos(angle),
      y: center + maxRadius * Math.sin(angle),
    };
  };

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background grid circles */}
        {gridLevels.map((level, i) => (
          <Circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={maxRadius * level}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={1}
            strokeDasharray="4,4"
          />
        ))}

        {/* Axis lines from center */}
        {SKILLS.map((_, index) => {
          const endpoint = getAxisEndpoint(index);
          return (
            <Line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={endpoint.x}
              y2={endpoint.y}
              stroke="#d1d5db"
              strokeWidth={1}
            />
          );
        })}

        {/* Colored dots at axis endpoints */}
        {SKILLS.map((skill, index) => {
          const endpoint = getAxisEndpoint(index);
          return (
            <Circle
              key={`dot-${index}`}
              cx={endpoint.x}
              cy={endpoint.y}
              r={4}
              fill={skill.color}
            />
          );
        })}

        {/* Progress polygon */}
        <Polygon
          points={getPolygonPoints}
          fill="rgba(99, 102, 241, 0.2)"
          stroke="#6366f1"
          strokeWidth={2}
        />

        {/* Center dot */}
        <Circle cx={center} cy={center} r={3} fill="#6366f1" />
      </Svg>

      {/* Labels and icons around the chart */}
      {SKILLS.map((skill, index) => {
        const pos = getLabelPosition(index);
        const value = progress[skill.key as keyof SkillProgressType] as number || 0;

        return (
          <View
            key={skill.key}
            style={[
              styles.labelContainer,
              {
                left: pos.x - 30,
                top: pos.y - 25,
              },
            ]}
          >
            {showIcons && (
              <MaterialCommunityIcons
                name={skill.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={18}
                color={skill.color}
              />
            )}
            {showLabels && (
              <Text style={[styles.labelText, { color: skill.color }]} numberOfLines={1}>
                {skill.label.slice(0, 4)}
              </Text>
            )}
            {showValues && (
              <Text style={styles.valueText}>{Math.round(value)}%</Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// Compact horizontal bar version for smaller spaces
interface SkillBarsProps {
  progress: SkillProgressType;
  compact?: boolean;
}

export const SkillBars: React.FC<SkillBarsProps> = ({ progress, compact = false }) => {
  return (
    <View style={styles.barsContainer}>
      {SKILLS.map((skill) => {
        const value = progress[skill.key as keyof SkillProgressType] as number || 0;
        const normalizedValue = Math.min(100, Math.max(0, value));

        return (
          <View key={skill.key} style={styles.barRow}>
            <View style={styles.barLabelContainer}>
              <MaterialCommunityIcons
                name={skill.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                size={compact ? 14 : 18}
                color={skill.color}
              />
              {!compact && (
                <Text style={[styles.barLabel, { color: skill.color }]}>
                  {skill.label}
                </Text>
              )}
            </View>
            <View style={styles.barBackground}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${normalizedValue}%`,
                    backgroundColor: skill.color,
                  },
                ]}
              />
            </View>
            <Text style={styles.barValue}>{Math.round(value)}%</Text>
          </View>
        );
      })}
    </View>
  );
};

// Mini skill indicators (just icons with color intensity)
interface SkillIndicatorsProps {
  progress: SkillProgressType;
  size?: number;
}

export const SkillIndicators: React.FC<SkillIndicatorsProps> = ({ progress, size = 24 }) => {
  return (
    <View style={styles.indicatorsContainer}>
      {SKILLS.map((skill) => {
        const value = progress[skill.key as keyof SkillProgressType] as number || 0;
        const opacity = 0.3 + (value / 100) * 0.7; // 30% to 100% opacity

        return (
          <View
            key={skill.key}
            style={[
              styles.indicator,
              {
                backgroundColor: skill.color + Math.round(opacity * 255).toString(16).padStart(2, '0'),
              },
            ]}
          >
            <MaterialCommunityIcons
              name={skill.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={size * 0.6}
              color="#fff"
            />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    width: 60,
    alignItems: 'center',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  valueText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Bar styles
  barsContainer: {
    width: '100%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    gap: 6,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  barBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 11,
    color: '#6b7280',
    fontWeight: '500',
    width: 35,
    textAlign: 'right',
  },
  // Indicator styles
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SkillProgress;

/**
 * JournalView Component
 * Learning journal with calendar heatmap and statistics
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { useJournalStore } from '@/store/journalStore';
import { JournalEntry, Mood, MonthlyStats } from '@/types/journal';

// ─────────────────────────────────────
// Mood Configuration (icons instead of emoji)
// ─────────────────────────────────────

const MOOD_CONFIG: Record<Mood, { icon: keyof typeof MaterialCommunityIcons.glyphMap; color: string; label: string }> = {
  great: { icon: 'emoticon-excited', color: '#22c55e', label: 'Great' },
  good: { icon: 'emoticon-happy', color: '#3b82f6', label: 'Good' },
  okay: { icon: 'emoticon-neutral', color: '#f59e0b', label: 'Okay' },
  bad: { icon: 'emoticon-sad', color: '#ef4444', label: 'Bad' },
};

// ─────────────────────────────────────
// Calendar Heatmap
// ─────────────────────────────────────

interface CalendarHeatmapProps {
  entries: Record<string, JournalEntry>;
  onDayPress?: (date: string) => void;
}

const CalendarHeatmap: React.FC<CalendarHeatmapProps> = ({ entries, onDayPress }) => {
  const today = new Date();
  const cellSize = 12;
  const cellGap = 2;
  const weeksToShow = 12; // ~3 months

  // Generate dates for the last N weeks
  const dates = useMemo(() => {
    const result: { date: string; intensity: number }[] = [];
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (weeksToShow * 7 - 1));

    for (let i = 0; i < weeksToShow * 7; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

      const entry = entries[dateStr];
      let intensity = 0;
      if (entry && entry.completedActivities.length > 0) {
        // Map learning time to intensity (0-4)
        const time = entry.learningTime;
        if (time >= 60) intensity = 4;
        else if (time >= 30) intensity = 3;
        else if (time >= 15) intensity = 2;
        else intensity = 1;
      }

      result.push({ date: dateStr, intensity });
    }
    return result;
  }, [entries, today, weeksToShow]);

  // Intensity colors
  const getColor = (intensity: number) => {
    switch (intensity) {
      case 4: return '#166534';
      case 3: return '#22c55e';
      case 2: return '#86efac';
      case 1: return '#dcfce7';
      default: return '#f3f4f6';
    }
  };

  const svgWidth = weeksToShow * (cellSize + cellGap);
  const svgHeight = 7 * (cellSize + cellGap);

  return (
    <View style={styles.heatmapContainer}>
      <View style={styles.heatmapHeader}>
        <MaterialCommunityIcons name="calendar-month" size={20} color="#6b7280" />
        <Text style={styles.heatmapTitle}>Learning Activity</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={svgWidth} height={svgHeight}>
          {dates.map((item, index) => {
            const week = Math.floor(index / 7);
            const day = index % 7;
            return (
              <Rect
                key={item.date}
                x={week * (cellSize + cellGap)}
                y={day * (cellSize + cellGap)}
                width={cellSize}
                height={cellSize}
                rx={2}
                fill={getColor(item.intensity)}
                onPress={() => onDayPress?.(item.date)}
              />
            );
          })}
        </Svg>
      </ScrollView>
      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendLabel}>Less</Text>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={[styles.legendCell, { backgroundColor: getColor(i) }]}
          />
        ))}
        <Text style={styles.legendLabel}>More</Text>
      </View>
    </View>
  );
};

// ─────────────────────────────────────
// Stat Card
// ─────────────────────────────────────

interface StatCardProps {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string | number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <View style={styles.statCard}>
    <MaterialCommunityIcons name={icon} size={28} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// ─────────────────────────────────────
// Journal View
// ─────────────────────────────────────

interface JournalViewProps {
  onEntryPress?: (entry: JournalEntry) => void;
}

export const JournalView: React.FC<JournalViewProps> = ({ onEntryPress }) => {
  const {
    entries,
    streak,
    skillProgress,
    getMonthlyStats,
    getRecentEntries,
    getTotalLearningTime,
  } = useJournalStore();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Current month stats
  const currentMonth = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const monthlyStats = useMemo(() => getMonthlyStats(currentMonth), [currentMonth, getMonthlyStats]);
  const recentEntries = useMemo(() => getRecentEntries(7), [getRecentEntries]);
  const totalTime = useMemo(() => getTotalLearningTime(), [getTotalLearningTime]);

  // Format time
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Streak Section */}
      <View style={styles.streakSection}>
        <View style={styles.streakMain}>
          <MaterialCommunityIcons name="fire" size={40} color="#f97316" />
          <View style={styles.streakInfo}>
            <Text style={styles.streakCount}>{streak.currentStreak}</Text>
            <Text style={styles.streakLabel}>Day Streak</Text>
          </View>
        </View>
        <View style={styles.streakStats}>
          <View style={styles.streakStat}>
            <Text style={styles.streakStatValue}>{streak.longestStreak}</Text>
            <Text style={styles.streakStatLabel}>Longest</Text>
          </View>
          <View style={styles.streakDivider} />
          <View style={styles.streakStat}>
            <Text style={styles.streakStatValue}>{streak.totalLearningDays}</Text>
            <Text style={styles.streakStatLabel}>Total Days</Text>
          </View>
        </View>
      </View>

      {/* Calendar Heatmap */}
      <CalendarHeatmap
        entries={entries}
        onDayPress={setSelectedDate}
      />

      {/* Monthly Stats */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="chart-bar" size={20} color="#6b7280" />
          <Text style={styles.sectionTitle}>This Month</Text>
        </View>
        <View style={styles.statsGrid}>
          <StatCard
            icon="clock-outline"
            label="Total Time"
            value={formatTime(monthlyStats.totalLearningTime)}
            color="#3b82f6"
          />
          <StatCard
            icon="calendar-check"
            label="Active Days"
            value={monthlyStats.learningDays}
            color="#22c55e"
          />
          <StatCard
            icon="checkbox-multiple-marked"
            label="Activities"
            value={monthlyStats.completedActivities}
            color="#a855f7"
          />
          <StatCard
            icon="star"
            label="Stars"
            value={monthlyStats.totalStarsEarned}
            color="#fbbf24"
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="history" size={20} color="#6b7280" />
          <Text style={styles.sectionTitle}>Recent Activity</Text>
        </View>
        {recentEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="book-open-page-variant" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>No learning activity yet</Text>
            <Text style={styles.emptySubtext}>Start learning to track your progress!</Text>
          </View>
        ) : (
          recentEntries.map((entry) => (
            <Pressable
              key={entry.id}
              style={styles.entryCard}
              onPress={() => onEntryPress?.(entry)}
            >
              <View style={styles.entryDate}>
                <Text style={styles.entryDay}>
                  {new Date(entry.date).getDate()}
                </Text>
                <Text style={styles.entryMonth}>
                  {new Date(entry.date).toLocaleDateString('en-US', { month: 'short' })}
                </Text>
              </View>
              <View style={styles.entryContent}>
                <Text style={styles.entryTitle}>
                  {entry.completedActivities.length} activities
                </Text>
                <View style={styles.entryMeta}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#9ca3af" />
                  <Text style={styles.entryMetaText}>{formatTime(entry.learningTime)}</Text>
                  {entry.mood && (
                    <>
                      <MaterialCommunityIcons
                        name={MOOD_CONFIG[entry.mood].icon}
                        size={14}
                        color={MOOD_CONFIG[entry.mood].color}
                        style={{ marginLeft: 12 }}
                      />
                      <Text style={[styles.entryMetaText, { color: MOOD_CONFIG[entry.mood].color }]}>
                        {MOOD_CONFIG[entry.mood].label}
                      </Text>
                    </>
                  )}
                </View>
              </View>
              <View style={styles.entryStars}>
                <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
                <Text style={styles.entryStarsText}>+{entry.starsEarned}</Text>
              </View>
            </Pressable>
          ))
        )}
      </View>

      {/* Total Stats */}
      <View style={styles.totalSection}>
        <MaterialCommunityIcons name="trophy" size={24} color="#fbbf24" />
        <Text style={styles.totalText}>
          Total Learning Time: <Text style={styles.totalValue}>{formatTime(totalTime)}</Text>
        </Text>
      </View>
    </ScrollView>
  );
};

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  // Streak
  streakSection: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  streakInfo: {
    flex: 1,
  },
  streakCount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  streakStats: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  streakStat: {
    flex: 1,
    alignItems: 'center',
  },
  streakStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
  },
  streakStatLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  streakDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  // Heatmap
  heatmapContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  heatmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heatmapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 12,
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize: 11,
    color: '#9ca3af',
  },
  // Section
  section: {
    backgroundColor: '#fff',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
  // Entry Card
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  entryDate: {
    width: 48,
    alignItems: 'center',
  },
  entryDay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  entryMonth: {
    fontSize: 12,
    color: '#6b7280',
  },
  entryContent: {
    flex: 1,
    marginLeft: 12,
  },
  entryTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  entryMetaText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  entryStars: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  entryStarsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fbbf24',
  },
  // Total
  totalSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 24,
    marginBottom: 16,
  },
  totalText: {
    fontSize: 16,
    color: '#6b7280',
  },
  totalValue: {
    fontWeight: 'bold',
    color: '#1f2937',
  },
});

export default JournalView;

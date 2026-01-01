/**
 * WeeklyChart Component
 * 최근 7일 학습 활동을 시각화하는 차트
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getWeeklyActivity } from '@/utils/statistics';

export function WeeklyChart() {
  const activities = getWeeklyActivity();
  const maxTime = Math.max(...activities.map((a) => a.learningTime), 1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 최근 7일 활동</Text>

      <View style={styles.chart}>
        {activities.map((activity, index) => {
          const heightPercent = (activity.learningTime / maxTime) * 100;
          const dayOfWeek = new Date(activity.date).toLocaleDateString('ko-KR', {
            weekday: 'short',
          });

          return (
            <View key={activity.date} style={styles.barContainer}>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: activity.hasActivity ? '#4CAF50' : '#E0E0E0',
                    },
                  ]}
                />
              </View>
              <Text style={styles.dayLabel}>{dayOfWeek}</Text>
              {activity.learningTime > 0 && (
                <Text style={styles.timeLabel}>{activity.learningTime}분</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    width: '80%',
    height: 100,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    minHeight: 4,
    borderRadius: 4,
  },
  dayLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
  },
  timeLabel: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
});

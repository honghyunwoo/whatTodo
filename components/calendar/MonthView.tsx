import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';

interface MonthViewProps {
  selectedDate?: string;
  markedDates?: string[];
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatDate(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

function getMonthData(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = new Date(prevYear, prevMonth + 1, 0).getDate();

  const days: { day: number; month: number; year: number; isCurrentMonth: boolean }[] = [];

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    days.push({
      day: prevMonthLastDay - i,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
    });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    days.push({
      day: i,
      month,
      year,
      isCurrentMonth: true,
    });
  }

  const remainingDays = 42 - days.length;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      day: i,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
    });
  }

  return days;
}

export function MonthView({ selectedDate, markedDates = [], onSelectDate }: MonthViewProps) {
  const { colors } = useTheme();
  const today = useMemo(() => {
    const now = new Date();
    return formatDate(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());

  const days = useMemo(() => getMonthData(currentYear, currentMonth), [currentYear, currentMonth]);

  const markedSet = useMemo(() => new Set(markedDates), [markedDates]);

  const goToPrevMonth = useCallback(() => {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const goToNextMonth = useCallback(() => {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const handleSelectDate = useCallback(
    (year: number, month: number, day: number) => {
      const dateStr = formatDate(year, month, day);
      onSelectDate(dateStr);
    },
    [onSelectDate]
  );

  const renderWeekdayHeader = useCallback(() => {
    return (
      <View style={styles.weekdayRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={day} style={styles.weekdayCell}>
            <Text
              style={[
                styles.weekdayText,
                { color: index === 0 ? COLORS.danger : colors.textSecondary },
              ]}
            >
              {day}
            </Text>
          </View>
        ))}
      </View>
    );
  }, [colors.textSecondary]);

  const renderDay = useCallback(
    (
      item: { day: number; month: number; year: number; isCurrentMonth: boolean },
      index: number
    ) => {
      const dateStr = formatDate(item.year, item.month, item.day);
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      const isMarked = markedSet.has(dateStr);
      const isSunday = index % 7 === 0;

      return (
        <Pressable
          key={`${item.year}-${item.month}-${item.day}-${index}`}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDayCell,
            isSelected && { backgroundColor: COLORS.primary },
          ]}
          onPress={() => handleSelectDate(item.year, item.month, item.day)}
        >
          <Text
            style={[
              styles.dayText,
              { color: colors.text },
              !item.isCurrentMonth && { color: colors.textSecondary, opacity: 0.4 },
              isSunday && item.isCurrentMonth && { color: COLORS.danger },
              isToday && !isSelected && styles.todayText,
              isSelected && styles.selectedDayText,
            ]}
          >
            {item.day}
          </Text>
          {isMarked && (
            <View
              style={[
                styles.marker,
                { backgroundColor: isSelected ? COLORS.surface : COLORS.primary },
              ]}
            />
          )}
        </Pressable>
      );
    },
    [today, selectedDate, markedSet, colors, handleSelectDate]
  );

  const weeks = useMemo(() => {
    const result: (typeof days)[] = [];
    for (let i = 0; i < 6; i++) {
      result.push(days.slice(i * 7, (i + 1) * 7));
    }
    return result;
  }, [days]);

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <IconButton icon="chevron-left" size={24} onPress={goToPrevMonth} iconColor={colors.text} />
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {currentYear}년 {currentMonth + 1}월
        </Text>
        <IconButton
          icon="chevron-right"
          size={24}
          onPress={goToNextMonth}
          iconColor={colors.text}
        />
      </View>

      {renderWeekdayHeader()}

      <View style={styles.daysGrid}>
        {weeks.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {week.map((day, dayIndex) => renderDay(day, weekIndex * 7 + dayIndex))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.borderRadius.lg,
    marginHorizontal: SIZES.spacing.md,
    marginTop: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.md,
  },
  dayCell: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: SIZES.borderRadius.full,
    flex: 1,
    justifyContent: 'center',
    margin: 2,
  },
  dayText: {
    fontSize: SIZES.fontSize.md,
    fontWeight: '500',
  },
  daysGrid: {
    paddingHorizontal: SIZES.spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.sm,
    paddingTop: SIZES.spacing.sm,
  },
  marker: {
    borderRadius: 3,
    height: 6,
    marginTop: 2,
    position: 'absolute',
    bottom: 4,
    width: 6,
  },
  monthTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
  },
  selectedDayCell: {
    backgroundColor: COLORS.primary,
  },
  selectedDayText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  todayText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekdayCell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: SIZES.spacing.sm,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.spacing.sm,
  },
  weekdayText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '600',
  },
});

/**
 * Tab Layout - 4탭 구조
 *
 * 구성:
 * - 오늘: 통합 입력 + 타임라인 (메모/할일/일기)
 * - 학습: 영어 학습 (시나리오/세션/퀴즈)
 * - 캘린더: 월간/주간 뷰 + 일정 관리
 * - 설정: 앱 설정 + 통계
 */

import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: false, // 각 화면에서 커스텀 헤더 사용
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '오늘',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="today-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: '학습',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: '캘린더',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '설정',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      {/* 기록 탭은 "오늘" 탭에 통합됨 - 라우팅에서 숨김 처리 */}
      <Tabs.Screen
        name="records"
        options={{
          href: null, // 탭바에서 숨김
        }}
      />
    </Tabs>
  );
}

/**
 * Test Routes Layout
 * Stack navigator for test flows
 */

import { Stack } from 'expo-router';
import React from 'react';

import { useTheme } from '@/contexts/ThemeContext';

export default function TestLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="[testId]" />
      <Stack.Screen name="result" />
    </Stack>
  );
}

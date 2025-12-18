/**
 * Level Test Screen
 * CEFR placement test for determining user's English level
 */

import { Stack, router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { LevelTestView } from '@/components/learn';
import { COLORS } from '@/constants/colors';
import type { LevelTestResult } from '@/types/levelTest';

export default function LevelTestScreen() {
  const handleComplete = useCallback((result: LevelTestResult) => {
    // Result is already saved in LevelTestView
    if (__DEV__) {
      console.log('Level test completed:', result.finalLevel);
    }
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: '레벨 테스트',
          headerLeft: () => (
            <IconButton icon="close" onPress={handleCancel} iconColor={COLORS.text} />
          ),
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text },
        }}
      />
      <LevelTestView onComplete={handleComplete} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

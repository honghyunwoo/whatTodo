/**
 * SRS Review Screen
 * Spaced repetition vocabulary review session
 */

import { Stack, router } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';

import { SrsReviewSession } from '@/components/learn';
import { COLORS } from '@/constants/colors';

interface SessionStats {
  totalReviewed: number;
  correctCount: number;
  accuracy: number;
  starsEarned: number;
  timeSpent: number;
}

export default function ReviewScreen() {
  const handleComplete = useCallback((stats: SessionStats) => {
    if (__DEV__) {
      console.log('Review session completed:', stats);
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
          title: '단어 복습',
          headerLeft: () => (
            <IconButton
              icon="close"
              onPress={handleCancel}
              iconColor={COLORS.text}
            />
          ),
          headerStyle: { backgroundColor: COLORS.surface },
          headerTitleStyle: { color: COLORS.text },
        }}
      />
      <SrsReviewSession onComplete={handleComplete} onCancel={handleCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

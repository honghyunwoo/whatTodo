/**
 * Test Taking Route
 * Dynamic route for taking tests
 */

import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { TestView } from '@/components/test';
import { COLORS } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';
import type { TestMeta, TestQuestion } from '@/types/test';
import { loadTest } from '@/utils/testLoader';

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export default function TestScreen() {
  const { testId } = useLocalSearchParams<{ testId: string }>();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [testMeta, setTestMeta] = useState<TestMeta | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testId]);

  const loadTestData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!testId) {
        setError('테스트 ID가 없습니다.');
        return;
      }

      // 실제 테스트 로더 사용
      const testData = await loadTest(testId);

      if (!testData) {
        setError('테스트를 찾을 수 없습니다.');
        return;
      }

      setTestMeta(testData.meta);
      setQuestions(testData.questions);
    } catch (err) {
      console.error('Failed to load test:', err);
      setError('테스트를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = () => {
    // 결과 화면으로 이동 (TestView에서 이미 처리됨)
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading test...</Text>
      </View>
    );
  }

  if (error || !testMeta || questions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error ?? 'Test not found'}</Text>
      </View>
    );
  }

  return (
    <TestView
      testMeta={testMeta}
      questions={questions}
      onComplete={handleComplete}
      onCancel={handleCancel}
    />
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

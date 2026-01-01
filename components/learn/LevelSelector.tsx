/**
 * LevelSelector Component
 * A1~C2 레벨을 선택할 수 있는 가로 버튼 그룹
 * Hero 섹션 내부에서 사용 (그라데이션 배경 위)
 */

import React, { memo, useCallback } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
}

function LevelSelectorComponent({ currentLevel, onLevelChange }: LevelSelectorProps) {
  const handleLevelPress = useCallback(
    (level: string) => {
      if (currentLevel.toLowerCase() === level.toLowerCase()) return;

      Alert.alert(
        '레벨 변경',
        `학습 레벨을 ${level}로 변경하시겠습니까?\n\n레벨을 변경하면 해당 레벨의 학습 콘텐츠로 전환됩니다.`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '변경',
            onPress: () => onLevelChange(level.toLowerCase()),
          },
        ]
      );
    },
    [currentLevel, onLevelChange]
  );

  return (
    <View style={styles.container}>
      {LEVELS.map((level) => {
        const isSelected = currentLevel.toUpperCase() === level;
        return (
          <Pressable
            key={level}
            onPress={() => handleLevelPress(level)}
            style={({ pressed }) => [
              styles.button,
              isSelected && styles.buttonActive,
              pressed && !isSelected && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.text, isSelected && styles.textActive]} variant="labelMedium">
              {level}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const LevelSelector = memo(LevelSelectorComponent);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  buttonActive: {
    backgroundColor: '#FFFFFF',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    flexDirection: 'row',
    marginVertical: 16,
    padding: 4,
  },
  text: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  textActive: {
    color: '#4A90D9',
  },
});

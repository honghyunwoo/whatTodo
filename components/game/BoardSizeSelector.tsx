import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SIZES } from '@/constants/sizes';
import { BoardSize, BOARD_SIZES } from '@/types/game';
import { useGameStore } from '@/store/gameStore';
import { BlurModal } from '@/components/common';
import { gameHaptics } from '@/services/hapticService';

interface BoardSizeSelectorProps {
  visible: boolean;
  onClose: () => void;
}

function BoardSizeSelectorComponent({ visible, onClose }: BoardSizeSelectorProps) {
  const gridSize = useGameStore((state) => state.gridSize);
  const setGridSize = useGameStore((state) => state.setGridSize);
  const newGame = useGameStore((state) => state.newGame);

  const handleSelect = async (size: BoardSize) => {
    await gameHaptics.tileMove();
    setGridSize(size);
    newGame();
    onClose();
  };

  return (
    <BlurModal visible={visible} onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.title}>보드 크기 선택</Text>
        <Text style={styles.subtitle}>새 게임이 시작됩니다</Text>

        <View style={styles.options}>
          {BOARD_SIZES.map((option, index) => (
            <Animated.View key={option.size} entering={FadeInUp.duration(300).delay(index * 100)}>
              <TouchableOpacity
                style={[styles.option, gridSize === option.size && styles.optionSelected]}
                onPress={() => handleSelect(option.size)}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.optionSize, gridSize === option.size && styles.optionTextSelected]}
                >
                  {option.name}
                </Text>
                <Text
                  style={[
                    styles.optionDifficulty,
                    gridSize === option.size && styles.optionTextSelected,
                  ]}
                >
                  {option.difficulty}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>
      </View>
    </BlurModal>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SIZES.spacing.lg,
    minWidth: 280,
  },
  title: {
    fontSize: SIZES.fontSize.xl,
    fontWeight: 'bold',
    color: '#776e65',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.fontSize.sm,
    color: '#8f7a66',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: SIZES.spacing.lg,
  },
  options: {
    gap: SIZES.spacing.sm,
  },
  option: {
    backgroundColor: '#eee4da',
    borderRadius: SIZES.borderRadius.md,
    padding: SIZES.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionSelected: {
    backgroundColor: '#8f7a66',
  },
  optionSize: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: 'bold',
    color: '#776e65',
  },
  optionDifficulty: {
    fontSize: SIZES.fontSize.sm,
    color: '#8f7a66',
  },
  optionTextSelected: {
    color: '#f9f6f2',
  },
});

export const BoardSizeSelector = memo(BoardSizeSelectorComponent);

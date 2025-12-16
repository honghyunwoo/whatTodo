import React, { memo, useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { SIZES } from '@/constants/sizes';
import { Tile as TileType } from '@/types/game';
import { gameHaptics } from '@/services/hapticService';
import { useGameStore } from '@/store/gameStore';

// 안전한 햅틱 래퍼 함수 (에러 무시)
const safeHighValueMergeHaptic = () => {
  gameHaptics.highValueMerge().catch(() => {});
};

const safeTileMergeHaptic = () => {
  gameHaptics.tileMerge().catch(() => {});
};

interface TileProps {
  tile: TileType;
  tileSize: number;
  gap: number;
}

const SPRING_CONFIG = {
  damping: 12,
  stiffness: 200,
  mass: 0.8,
};

function TileComponent({ tile, tileSize, gap }: TileProps) {
  const getTileColors = useGameStore((state) => state.getTileColors);
  const colors = getTileColors(tile.value);

  const fontSize =
    tile.value >= 1000 ? tileSize * 0.28 : tile.value >= 100 ? tileSize * 0.35 : tileSize * 0.45;

  // Animation values
  const scale = useSharedValue(tile.isNew ? 0 : 1);
  const translateX = useSharedValue(tile.col * (tileSize + gap) + gap);
  const translateY = useSharedValue(tile.row * (tileSize + gap) + gap);

  // Handle new tile animation
  useEffect(() => {
    if (tile.isNew) {
      scale.value = 0;
      scale.value = withSpring(1, {
        ...SPRING_CONFIG,
        damping: 8,
        stiffness: 300,
      });
    }
  }, [tile.isNew, scale]);

  // Handle merge animation
  useEffect(() => {
    if (tile.isMerged) {
      scale.value = withSequence(withTiming(1.2, { duration: 100 }), withSpring(1, SPRING_CONFIG));
      // Haptic feedback for high value merges (안전한 래퍼 사용)
      if (tile.value >= 512) {
        safeHighValueMergeHaptic();
      } else {
        safeTileMergeHaptic();
      }
    }
  }, [tile.isMerged, tile.value, scale]);

  // Handle position animation
  useEffect(() => {
    const newX = tile.col * (tileSize + gap) + gap;
    const newY = tile.row * (tileSize + gap) + gap;

    if (translateX.value !== newX || translateY.value !== newY) {
      translateX.value = withSpring(newX, SPRING_CONFIG);
      translateY.value = withSpring(newY, SPRING_CONFIG);
    }
  }, [tile.col, tile.row, tileSize, gap, translateX, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.tile,
        {
          width: tileSize,
          height: tileSize,
          backgroundColor: colors.bg,
        },
        animatedStyle,
      ]}
    >
      <Text
        style={[
          styles.tileText,
          {
            fontSize,
            color: colors.text,
          },
        ]}
      >
        {tile.value}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    borderRadius: SIZES.borderRadius.md,
    justifyContent: 'center',
    position: 'absolute',
    left: 0,
    top: 0,
  },
  tileText: {
    fontWeight: 'bold',
  },
});

export const Tile = memo(TileComponent);

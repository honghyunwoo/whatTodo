import React, { memo, useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text } from 'react-native-paper';
import LottieView from 'lottie-react-native';
import Animated, { ZoomIn, FadeInUp } from 'react-native-reanimated';

import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { BlurModal } from '@/components/common';
import { GameStatus } from '@/types/game';
import { gameHaptics } from '@/services/hapticService';

interface GameOverModalProps {
  visible: boolean;
  status: GameStatus;
  score: number;
  onNewGame: () => void;
  onContinue?: () => void;
}

function GameOverModalComponent({
  visible,
  status,
  score,
  onNewGame,
  onContinue,
}: GameOverModalProps) {
  const { colors, isDark } = useTheme();
  const isWon = status === 'won';
  const confettiRef = useRef<LottieView>(null);

  useEffect(() => {
    if (visible) {
      if (isWon) {
        gameHaptics.win();
        confettiRef.current?.play();
      } else {
        gameHaptics.gameOver();
      }
    }
  }, [visible, isWon]);

  const handleNewGame = async () => {
    await gameHaptics.newGame();
    onNewGame();
  };

  return (
    <BlurModal visible={visible} closeOnBackdrop={false}>
      <View style={styles.content}>
        {/* Confetti Animation for Win */}
        {isWon && (
          <View style={styles.confettiContainer}>
            <LottieView
              ref={confettiRef}
              source={require('@/assets/animations/confetti.json')}
              style={styles.confetti}
              loop={false}
            />
          </View>
        )}

        <Animated.View entering={ZoomIn.springify().damping(12)}>
          <Text
            style={[styles.title, { color: isWon ? '#edc22e' : isDark ? '#8E8E93' : '#776e65' }]}
          >
            {isWon ? '🎉 축하합니다!' : '😢 게임 오버'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(300).delay(100)}>
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {isWon ? '2048을 달성했습니다!' : '더 이상 이동할 수 없습니다'}
          </Text>
        </Animated.View>

        <Animated.View entering={ZoomIn.springify().damping(10).delay(200)}>
          <Text style={[styles.score, { color: colors.text }]}>점수: {score.toLocaleString()}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(300).delay(300)} style={styles.buttons}>
          {isWon && onContinue && (
            <TouchableOpacity
              style={[styles.button, styles.continueButton]}
              onPress={onContinue}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>계속하기</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.button, styles.newGameButton]}
            onPress={handleNewGame}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>새 게임</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </BlurModal>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: SIZES.borderRadius.md,
    flex: 1,
    paddingHorizontal: SIZES.spacing.lg,
    paddingVertical: SIZES.spacing.md,
  },
  buttonText: {
    color: '#f9f6f2',
    fontSize: SIZES.fontSize.md,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    gap: SIZES.spacing.md,
    marginTop: SIZES.spacing.lg,
    width: '100%',
  },
  confetti: {
    width: 300,
    height: 300,
  },
  confettiContainer: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -150,
    zIndex: 10,
    pointerEvents: 'none',
  },
  content: {
    alignItems: 'center',
    position: 'relative',
  },
  continueButton: {
    backgroundColor: '#edc22e',
  },
  message: {
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.sm,
    textAlign: 'center',
  },
  newGameButton: {
    backgroundColor: '#8f7a66',
  },
  score: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    marginTop: SIZES.spacing.md,
  },
  title: {
    fontSize: SIZES.fontSize.xxl + 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export const GameOverModal = memo(GameOverModalComponent);

/**
 * OnboardingScreen Component
 * 앱 첫 실행 시 보여주는 온보딩 화면
 *
 * Features:
 * - Lottie 애니메이션으로 시각적 임팩트
 * - 레벨 선택 슬라이드 (A1-C2)
 * - 현대적인 그라데이션 디자인
 * - 부드러운 전환 효과
 */

import React, { useRef, useState, useCallback } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useUserStore } from '@/store/userStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Animation files
const ANIMATIONS = {
  welcome: require('@/assets/animations/welcome.json'),
  checklist: require('@/assets/animations/checklist.json'),
  book: require('@/assets/animations/book.json'),
  crown: require('@/assets/animations/crown.json'),
  rocket: require('@/assets/animations/rocket.json'),
};

type LevelOption = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

const LEVELS: { id: LevelOption; name: string; description: string }[] = [
  { id: 'A1', name: '입문', description: '기초 인사, 숫자, 간단한 표현' },
  { id: 'A2', name: '초급', description: '일상 대화, 간단한 문장 구성' },
  { id: 'B1', name: '중급', description: '의견 표현, 여행 회화' },
  { id: 'B2', name: '중상급', description: '복잡한 주제, 토론 참여' },
  { id: 'C1', name: '고급', description: '학술적 표현, 유창한 대화' },
  { id: 'C2', name: '최고급', description: '원어민 수준, 미묘한 뉘앙스' },
];

type OnboardingSlide = {
  id: string;
  type: 'info' | 'level-select';
  animation?: keyof typeof ANIMATIONS;
  title: string;
  description: string;
  gradient: readonly [string, string];
};

const slides: OnboardingSlide[] = [
  {
    id: '1',
    type: 'info',
    animation: 'welcome',
    title: '안녕하세요! 👋',
    description: '영어 학습과 할 일 관리를\n하나로 연결하는 WhatTodo입니다',
    gradient: ['#667eea', '#764ba2'] as const,
  },
  {
    id: '2',
    type: 'info',
    animation: 'checklist',
    title: '할 일 완료 = 별 획득 ⭐',
    description: '매일 할 일을 완료하고\n별을 모아 학습 콘텐츠를 잠금 해제하세요',
    gradient: ['#f093fb', '#f5576c'] as const,
  },
  {
    id: '3',
    type: 'info',
    animation: 'book',
    title: '체계적인 영어 학습 📚',
    description: '어휘, 문법, 듣기, 읽기, 말하기, 쓰기\n6가지 영역을 골고루 학습하세요',
    gradient: ['#4facfe', '#00f2fe'] as const,
  },
  {
    id: '4',
    type: 'level-select',
    animation: 'crown',
    title: '나의 레벨 선택 👑',
    description: '현재 영어 실력에 맞는 레벨을 선택하세요\n나중에 설정에서 변경할 수 있어요',
    gradient: ['#fa709a', '#fee140'] as const,
  },
  {
    id: '5',
    type: 'info',
    animation: 'rocket',
    title: '준비 완료! 🚀',
    description: '지금 바로 첫 번째 할 일을 만들고\n영어 학습 여정을 시작해보세요',
    gradient: ['#a8edea', '#fed6e3'] as const,
  },
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>('A1');
  const flatListRef = useRef<FlatList>(null);
  const setPreferredLevel = useUserStore((state) => state.setPreferredLevel);

  // Animation values
  const buttonScale = useSharedValue(1);
  const scrollX = useSharedValue(0);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    scrollX.value = offsetX;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      // Save selected level and complete onboarding
      setPreferredLevel(selectedLevel);
      onComplete();
    }
  }, [currentIndex, selectedLevel, setPreferredLevel, onComplete]);

  const handleSkip = () => {
    // Jump to level selection
    flatListRef.current?.scrollToIndex({
      index: 3, // Level select slide
      animated: true,
    });
  };

  const handleLevelSelect = (level: LevelOption) => {
    setSelectedLevel(level);
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const onPressIn = () => {
    buttonScale.value = withSpring(0.95);
  };

  const onPressOut = () => {
    buttonScale.value = withSpring(1);
  };

  const renderLevelSelector = () => (
    <View style={styles.levelContainer}>
      <View style={styles.levelGrid}>
        {LEVELS.map((level) => (
          <Pressable
            key={level.id}
            style={[styles.levelCard, selectedLevel === level.id && styles.levelCardSelected]}
            onPress={() => handleLevelSelect(level.id)}
          >
            <Text style={[styles.levelId, selectedLevel === level.id && styles.levelIdSelected]}>
              {level.id}
            </Text>
            <Text
              style={[styles.levelName, selectedLevel === level.id && styles.levelNameSelected]}
            >
              {level.name}
            </Text>
            <Text
              style={[styles.levelDesc, selectedLevel === level.id && styles.levelDescSelected]}
              numberOfLines={2}
            >
              {level.description}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => (
    <View style={styles.slide}>
      <LinearGradient
        colors={item.gradient}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.slideContent}>
          {/* Animation */}
          {item.animation && (
            <View style={styles.animationContainer}>
              <LottieView
                source={ANIMATIONS[item.animation]}
                autoPlay
                loop
                style={styles.animation}
              />
            </View>
          )}

          {/* Title */}
          <Text style={styles.title}>{item.title}</Text>

          {/* Description */}
          <Text style={styles.description}>{item.description}</Text>

          {/* Level Selector (only for level-select type) */}
          {item.type === 'level-select' && renderLevelSelector()}
        </View>
      </LinearGradient>
    </View>
  );

  // Pagination dot animation
  const PaginationDot = ({ index: dotIndex }: { index: number }) => {
    const animatedStyle = useAnimatedStyle(() => {
      const inputRange = [
        (dotIndex - 1) * SCREEN_WIDTH,
        dotIndex * SCREEN_WIDTH,
        (dotIndex + 1) * SCREEN_WIDTH,
      ];

      const width = interpolate(scrollX.value, inputRange, [8, 24, 8], Extrapolation.CLAMP);

      const opacity = interpolate(scrollX.value, inputRange, [0.5, 1, 0.5], Extrapolation.CLAMP);

      return {
        width,
        opacity,
      };
    });

    return <Animated.View style={[styles.dot, animatedStyle]} />;
  };

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <PaginationDot key={index} index={index} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {currentIndex < slides.length - 1 && currentIndex < 3 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>
        )}

        <Animated.View style={[styles.nextButtonContainer, buttonAnimatedStyle]}>
          <Pressable
            style={styles.nextButton}
            onPress={handleNext}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              style={styles.nextButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
              </Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  slide: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 180,
    maxWidth: 500,
    width: '100%',
  },
  animationContainer: {
    width: 200,
    height: 200,
    marginBottom: 32,
  },
  animation: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 28,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelContainer: {
    marginTop: 24,
    width: '100%',
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  levelCard: {
    width: (SCREEN_WIDTH - 96) / 3,
    minWidth: 90,
    maxWidth: 110,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  levelCardSelected: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  levelId: {
    fontSize: 20,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  levelIdSelected: {
    color: '#667eea',
  },
  levelName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 4,
  },
  levelNameSelected: {
    color: '#333',
  },
  levelDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 14,
  },
  levelDescSelected: {
    color: '#666',
  },
  pagination: {
    position: 'absolute',
    bottom: 140,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  buttons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 16,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 12,
  },
  skipButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  nextButtonContainer: {
    flex: 1,
    marginLeft: 16,
  },
  nextButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  nextButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  nextText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});

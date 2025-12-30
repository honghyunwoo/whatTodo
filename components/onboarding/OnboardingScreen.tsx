/**
 * OnboardingScreen Component
 * 앱 첫 실행 시 보여주는 온보딩 화면
 */

import React, { useRef, useState } from 'react';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type OnboardingSlide = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  backgroundColor: string;
};

const slides: OnboardingSlide[] = [
  {
    id: '1',
    emoji: '🎯',
    title: 'whatTodo에 오신 것을 환영합니다!',
    description: '영어 학습을 체계적으로 관리하고\n꾸준한 학습 습관을 만들어보세요.',
    backgroundColor: '#E3F2FD',
  },
  {
    id: '2',
    emoji: '📚',
    title: '레슨 기반 학습',
    description:
      'A1부터 C2까지 CEFR 레벨에 맞춘\n체계적인 레슨을 제공합니다.\n매일 조금씩, 부담 없이 학습하세요.',
    backgroundColor: '#F3E5F5',
  },
  {
    id: '3',
    emoji: '🔄',
    title: '간격 반복 학습 (SRS)',
    description:
      '학습한 단어를 잊지 않도록\n최적의 타이밍에 복습을 제안합니다.\n과학적으로 검증된 학습 방법입니다.',
    backgroundColor: '#E8F5E9',
  },
  {
    id: '4',
    emoji: '📊',
    title: '학습 통계 & 진도 관리',
    description:
      '학습 시간, 연속 학습일, 완료한 활동을\n한눈에 확인하고 동기부여를 받으세요.\n꾸준한 학습이 실력 향상의 열쇠입니다.',
    backgroundColor: '#FFF3E0',
  },
  {
    id: '5',
    emoji: '💾',
    title: '자동 백업',
    description:
      '학습 데이터가 자동으로 백업되어\n안전하게 보관됩니다.\n기기를 바꿔도 걱정 없이 이어서 학습하세요.',
    backgroundColor: '#FCE4EC',
  },
];

type OnboardingScreenProps = {
  onComplete: () => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { backgroundColor: item.backgroundColor }]}>
      <View style={styles.slideContent}>
        <Text style={styles.emoji}>{item.emoji}</Text>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );

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
          <View key={index} style={[styles.dot, index === currentIndex && styles.dotActive]} />
        ))}
      </View>

      {/* Buttons */}
      <View style={styles.buttons}>
        {currentIndex < slides.length - 1 && (
          <Pressable style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </Pressable>
        )}

        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? '시작하기' : '다음'}
          </Text>
        </Pressable>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emoji: {
    fontSize: 100,
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D0D0D0',
  },
  dotActive: {
    width: 24,
    backgroundColor: '#2196F3',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  nextText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '700',
  },
});

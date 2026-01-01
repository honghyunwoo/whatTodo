import { Dimensions, PixelRatio } from 'react-native';

// 기준 화면 크기 (iPhone 8)
const BASE_WIDTH = 375;
// BASE_HEIGHT = 667 (reference only)

// 현재 화면 크기
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * 반응형 크기 계산
 * 기준: iPhone 8 (375px)
 * 최소: 75% / 최대: 125% 스케일
 */
export const getResponsiveSize = (baseSize: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const scaledSize = baseSize * scale;
  const minSize = baseSize * 0.75;
  const maxSize = baseSize * 1.25;
  return Math.max(minSize, Math.min(scaledSize, maxSize));
};

/**
 * 폰트 크기 반응형 계산 (PixelRatio 고려)
 */
export const getResponsiveFontSize = (baseSize: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  const scaledSize = baseSize * scale;
  const pixelRatio = PixelRatio.get();

  // 고밀도 디스플레이에서는 약간 작게
  const adjustedSize = pixelRatio > 2 ? scaledSize * 0.95 : scaledSize;

  const minSize = baseSize * 0.8;
  const maxSize = baseSize * 1.15;
  return Math.max(minSize, Math.min(adjustedSize, maxSize));
};

/**
 * 반응형 상수
 */
export const RESPONSIVE = {
  // 터치 타겟 최소 크기 (접근성 기준: 44px)
  touchTarget: Math.max(44, getResponsiveSize(48)),

  // 모달 최대 너비
  modalMaxWidth: Math.min(SCREEN_WIDTH - 32, 400),

  // 카드 최대 너비
  cardMaxWidth: Math.min(SCREEN_WIDTH - 32, 500),

  // 화면 크기
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // 작은 화면 여부 (SE, 5s 등)
  isSmallScreen: SCREEN_WIDTH < 375,

  // 큰 화면 여부 (Plus, Max, 태블릿)
  isLargeScreen: SCREEN_WIDTH >= 414,
} as const;

export const SIZES = {
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    full: 9999,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 24,
    round: 9999, // Alias for full (circular)
    full: 9999,
  },
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
  },
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

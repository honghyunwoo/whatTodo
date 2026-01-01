/**
 * Design System - Soft Brutalism + Korean Paper (한지)
 *
 * 대담하면서도 따뜻한 디자인 시스템
 * - 한지 텍스처: 자연스럽고 따뜻한 배경
 * - 인장 스타일: 상태 표시에 도장 느낌
 * - 부드러운 브루탈리즘: 대담한 타이포 + 라운드 코너
 */

// 색상 팔레트 - 한지 + 먹(墨) 영감
export const PALETTE = {
  // 기본 배경 - 한지 색상
  paper: {
    cream: '#FDF8F3', // 밝은 한지
    warm: '#F5EDE4', // 따뜻한 한지
    aged: '#E8DFD5', // 오래된 한지
    dark: '#1A1916', // 다크 모드 한지
  },

  // 먹(墨) 계열 - 텍스트
  ink: {
    black: '#1A1A1A', // 진한 먹
    dark: '#333333', // 어두운 먹
    medium: '#666666', // 중간 먹
    light: '#999999', // 연한 먹
    faded: '#CCCCCC', // 희미한 먹
  },

  // 인장(印章) 색상 - 액센트
  seal: {
    red: '#C73E3A', // 전통 주홍
    vermilion: '#E25822', // 주황 주홍
    gold: '#B8860B', // 금색
    blue: '#2E5A88', // 남색
    green: '#2D5A27', // 녹색
  },

  // 기능 색상
  functional: {
    memo: '#4A7C59', // 숲 초록
    todo: '#C17F59', // 황토색
    diary: '#7B5EA7', // 자주색
    success: '#4A7C59',
    warning: '#C17F59',
    error: '#C73E3A',
  },

  // 그라데이션
  gradients: {
    sunrise: ['#FFE5D9', '#FFD6BA', '#FFCAB0'],
    forest: ['#D4E6D7', '#B5D4B9', '#96C29B'],
    dusk: ['#E5D9F2', '#D4C7E8', '#C3B5DE'],
    ocean: ['#D6E6F2', '#B8D4E8', '#9AC2DE'],
  },
} as const;

// 타이포그래피 - 한글 최적화
export const TYPOGRAPHY = {
  // 폰트 크기
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
    hero: 34,
  },

  // 폰트 무게
  weight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },

  // 행간
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // 자간
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// 간격 시스템 - 8px 기반
export const SPACE = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

// 둥근 모서리 - 부드러운 브루탈리즘
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

// 그림자 - 부드럽고 자연스러운
export const SHADOW = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  // 인장(도장) 스타일 그림자
  seal: {
    shadowColor: '#C73E3A',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 2,
  },
  // 부유 카드 그림자
  float: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 15,
  },
} as const;

// 애니메이션 프리셋
export const ANIMATION = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    dramatic: 800,
  },
  easing: {
    // 부드러운 등장
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)',
    // 탄력적 등장
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // 자연스러운 움직임
    natural: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // 스태거드 딜레이
  stagger: {
    fast: 50,
    normal: 100,
    slow: 150,
  },
} as const;

// 컴포넌트별 스타일 프리셋
export const COMPONENTS = {
  // 카드 스타일
  card: {
    default: {
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.xl,
      padding: SPACE.lg,
      ...SHADOW.md,
    },
    elevated: {
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.xxl,
      padding: SPACE.xl,
      ...SHADOW.lg,
    },
    flat: {
      backgroundColor: PALETTE.paper.warm,
      borderRadius: RADIUS.lg,
      padding: SPACE.md,
      borderWidth: 1,
      borderColor: PALETTE.paper.aged,
    },
    // 인장 카드 - 특별한 상태용
    seal: {
      backgroundColor: '#FFFFFF',
      borderRadius: RADIUS.lg,
      padding: SPACE.md,
      borderWidth: 2,
      borderColor: PALETTE.seal.red,
      ...SHADOW.seal,
    },
  },

  // 버튼 스타일
  button: {
    primary: {
      backgroundColor: PALETTE.ink.black,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACE.sm,
      paddingHorizontal: SPACE.lg,
    },
    secondary: {
      backgroundColor: 'transparent',
      borderRadius: RADIUS.lg,
      paddingVertical: SPACE.sm,
      paddingHorizontal: SPACE.lg,
      borderWidth: 2,
      borderColor: PALETTE.ink.black,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderRadius: RADIUS.md,
      paddingVertical: SPACE.xs,
      paddingHorizontal: SPACE.sm,
    },
  },

  // 입력 필드 스타일
  input: {
    default: {
      backgroundColor: PALETTE.paper.cream,
      borderRadius: RADIUS.lg,
      paddingVertical: SPACE.md,
      paddingHorizontal: SPACE.md,
      borderWidth: 1,
      borderColor: PALETTE.paper.aged,
    },
    focused: {
      borderColor: PALETTE.ink.dark,
      borderWidth: 2,
    },
  },

  // 태그/배지 스타일
  badge: {
    default: {
      backgroundColor: PALETTE.paper.warm,
      borderRadius: RADIUS.full,
      paddingVertical: SPACE.xxs,
      paddingHorizontal: SPACE.sm,
    },
    accent: {
      backgroundColor: PALETTE.seal.red,
      borderRadius: RADIUS.full,
      paddingVertical: SPACE.xxs,
      paddingHorizontal: SPACE.sm,
    },
  },
} as const;

// 아이콘 크기
export const ICON_SIZE = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  xxl: 48,
} as const;

// 테마 헬퍼 함수
export function withOpacity(color: string, opacity: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

// 그라데이션 생성 헬퍼
export function createGradient(startColor: string, endColor: string): string[] {
  return [startColor, endColor];
}

export default {
  PALETTE,
  TYPOGRAPHY,
  SPACE,
  RADIUS,
  SHADOW,
  ANIMATION,
  COMPONENTS,
  ICON_SIZE,
  withOpacity,
  createGradient,
};

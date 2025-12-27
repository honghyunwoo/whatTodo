/**
 * Jest Test Setup
 *
 * @created 2025-12-24 - Phase 1.1: 테스트 환경 구축
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock Expo modules
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({ canceled: true })),
}));

jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: {
    document: { uri: 'file:///mock/document' },
    cache: { uri: 'file:///mock/cache' },
  },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  Link: 'Link',
  Stack: 'Stack',
}));

// Mock Sentry
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  captureException: jest.fn(),
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn(),
  setUser: jest.fn(),
  setContext: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    default: {
      View,
    },
    FadeInUp: { duration: () => ({ delay: () => ({}) }) },
    FadeInRight: { duration: () => ({ delay: () => ({}) }) },
    FadeIn: { duration: () => ({}) },
    FadeOut: { duration: () => ({}) },
    ZoomIn: { duration: () => ({}), springify: () => ({ damping: () => ({}) }) },
    useSharedValue: jest.fn(() => ({ value: 0 })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((v) => v),
    withSpring: jest.fn((v) => v),
    runOnJS: jest.fn((fn) => fn),
    Easing: {
      bezier: jest.fn(),
      linear: jest.fn(),
    },
  };
});

// Mock react-native modules
jest.mock('react-native', () => ({
  Alert: {
    alert: jest.fn(),
  },
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios),
  },
}));

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});

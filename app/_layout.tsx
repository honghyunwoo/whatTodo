import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { OnboardingScreen } from '@/components/onboarding/OnboardingScreen';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { useStreakStore } from '@/store/streakStore';
import { performAutoBackup, shouldAutoBackup } from '@/utils/backup';
import { isOnboardingCompleted, markOnboardingCompleted } from '@/utils/onboarding';
import { initSentry } from '@/utils/sentry';

function AppContent() {
  const { isDark } = useTheme();
  const initializeNotifications = useUserStore((state) => state.initializeNotifications);
  const checkStreak = useStreakStore((state) => state.checkStreak);
  // 기본값 false로 시작하여 즉시 렌더링 (로딩 블로킹 제거)
  const [onboardingDone, setOnboardingDone] = useState<boolean>(false);

  // Check onboarding status and initialize app (비블로킹)
  useEffect(() => {
    const init = async () => {
      try {
        // Check if onboarding is completed
        const completed = await isOnboardingCompleted();
        setOnboardingDone(completed);

        // Only initialize if onboarding is done
        if (completed) {
          // 백그라운드에서 실행 (await 제거로 비블로킹)
          initializeNotifications().catch(console.warn);
          checkStreak();

          // 자동 백업 체크 및 실행 (백그라운드)
          shouldAutoBackup()
            .then((needsBackup) => {
              if (needsBackup) {
                performAutoBackup().catch(console.warn);
              }
            })
            .catch(console.warn);
        }
      } catch (error) {
        console.warn('Init error:', error);
        setOnboardingDone(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 의존성 제거 - Zustand persist rehydration 무한 루프 방지

  const handleOnboardingComplete = async () => {
    await markOnboardingCompleted();
    setOnboardingDone(true);

    // Initialize app after onboarding (백그라운드)
    initializeNotifications().catch(console.warn);
    checkStreak();

    shouldAutoBackup()
      .then((needsBackup) => {
        if (needsBackup) {
          performAutoBackup().catch(console.warn);
        }
      })
      .catch(console.warn);
  };

  // Show onboarding if not completed
  if (!onboardingDone) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  // Sentry 초기화 (앱 시작 시 한 번만)
  useEffect(() => {
    initSentry();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <ThemeProvider>
            <PaperProvider
              settings={{
                icon: (props) => <MaterialCommunityIcons {...props} />,
              }}
            >
              <AppContent />
            </PaperProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

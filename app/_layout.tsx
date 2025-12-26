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
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);

  // Check onboarding status and initialize app
  useEffect(() => {
    const init = async () => {
      // Check if onboarding is completed
      const completed = await isOnboardingCompleted();
      setOnboardingDone(completed);

      // Only initialize if onboarding is done
      if (completed) {
        // Initialize notification permissions
        await initializeNotifications();

        // Check streak status
        checkStreak();

        // 자동 백업 체크 및 실행
        const needsBackup = await shouldAutoBackup();
        if (needsBackup) {
          await performAutoBackup();
        }
      }
    };

    init();
  }, [initializeNotifications, checkStreak]);

  const handleOnboardingComplete = async () => {
    await markOnboardingCompleted();
    setOnboardingDone(true);

    // Initialize app after onboarding
    await initializeNotifications();
    checkStreak();

    const needsBackup = await shouldAutoBackup();
    if (needsBackup) {
      await performAutoBackup();
    }
  };

  // Loading state
  if (onboardingDone === null) {
    return null; // or a loading spinner
  }

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
            <PaperProvider>
              <AppContent />
            </PaperProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

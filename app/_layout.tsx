import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { useStreakStore } from '@/store/streakStore';
import { initSentry } from '@/utils/sentry';

function AppContent() {
  const { isDark } = useTheme();
  const initializeNotifications = useUserStore((state) => state.initializeNotifications);
  const checkStreak = useStreakStore((state) => state.checkStreak);

  // Initialize notifications and check streak on app start
  useEffect(() => {
    const init = async () => {
      // Initialize notification permissions
      await initializeNotifications();

      // Check streak status
      checkStreak();
    };

    init();
  }, [initializeNotifications, checkStreak]);

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider>
            <AppContent />
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

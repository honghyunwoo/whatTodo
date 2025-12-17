import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/userStore';
import { useStreakStore } from '@/store/streakStore';
import { notificationService } from '@/services/notificationService';
import { initSentry } from '@/utils/sentry';

function AppContent() {
  const { isDark } = useTheme();
  const initializeNotifications = useUserStore((state) => state.initializeNotifications);
  const currentStreak = useStreakStore((state) => state.currentStreak);
  const lastStudyDate = useStreakStore((state) => state.lastStudyDate);
  const checkStreak = useStreakStore((state) => state.checkStreak);

  // Initialize notifications and check streak on app start
  useEffect(() => {
    const init = async () => {
      // Initialize notification permissions
      await initializeNotifications();

      // Check streak status
      checkStreak();

      // Check if studied today
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const studiedToday = lastStudyDate === todayStr;

      // Schedule streak warning if needed
      if (currentStreak > 0 && !studiedToday) {
        await notificationService.scheduleStreakWarning(currentStreak);
      }
    };

    init();
  }, [initializeNotifications, currentStreak, lastStudyDate, checkStreak]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="settings"
          options={{
            headerShown: true,
            title: '설정',
            presentation: 'modal',
          }}
        />
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

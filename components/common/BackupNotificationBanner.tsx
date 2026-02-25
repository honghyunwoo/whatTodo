/**
 * Backup Notification Banner
 *
 * 백업 실패 시 화면 상단에 표시되는 알림 배너
 * 탭하면 설정 화면으로 이동하여 수동 백업 가능
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useTheme } from '@/contexts/ThemeContext';
import { useBackupStore } from '@/store/backupStore';

export function BackupNotificationBanner() {
  const { colors } = useTheme();
  // Select a stable store slice. Calling an action in selector can allocate
  // a new array each render and trigger useSyncExternalStore update loops.
  const notifications = useBackupStore((state) => state.notifications);
  const dismissNotification = useBackupStore((state) => state.dismissNotification);

  // 가장 최근 에러 알림만 표시
  const errorNotification = notifications.find((n) => n.type === 'error' && !n.dismissed);

  if (!errorNotification) {
    return null;
  }

  const handlePress = () => {
    // 설정 화면으로 이동
    router.push('/settings');
    // 알림 닫기
    dismissNotification(errorNotification.id);
  };

  const handleDismiss = () => {
    dismissNotification(errorNotification.id);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.danger }]}>
      <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.8}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={20} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{errorNotification.title}</Text>
          <Text style={styles.message} numberOfLines={2}>
            탭하여 수동 백업
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
        <Ionicons name="close" size={18} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  message: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

export default BackupNotificationBanner;

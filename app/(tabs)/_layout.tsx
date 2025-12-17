import { Tabs, Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { COLORS } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        headerShown: true,
        headerRight: () => (
          <Link href="/settings" asChild>
            <Pressable>
              {({ pressed }) => (
                <Ionicons
                  name="settings-outline"
                  size={22}
                  color={COLORS.textSecondary}
                  style={{ opacity: pressed ? 0.6 : 1 }}
                />
              )}
            </Pressable>
          </Link>
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Diary',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="reader-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="todo"
        options={{
          title: 'Todo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="checkbox-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="game"
        options={{
          title: 'Break',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="game-controller-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

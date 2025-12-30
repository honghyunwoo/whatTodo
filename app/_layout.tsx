import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

// 🔧 최소 테스트 버전 - 모든 외부 의존성 제거
export default function RootLayout() {
  console.log('[RootLayout] MINIMAL TEST - Rendering...');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>앱 테스트 - 이게 보이면 성공!</Text>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9F0',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 100,
    color: '#333',
  },
});

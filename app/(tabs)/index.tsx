import { View, Text, StyleSheet } from 'react-native';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

export default function TodoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Todo</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: SIZES.fontSize.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.fontSize.md,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacing.sm,
  },
});

import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';

import { AddTaskModal, TaskList } from '@/components/todo';
import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';

export default function TodoScreen() {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => setModalVisible(true);
  const closeModal = () => setModalVisible(false);

  return (
    <View style={styles.container}>
      <TaskList />
      <FAB icon="plus" style={styles.fab} onPress={openModal} />
      <AddTaskModal visible={modalVisible} onDismiss={closeModal} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  fab: {
    backgroundColor: COLORS.primary,
    bottom: SIZES.spacing.lg,
    position: 'absolute',
    right: SIZES.spacing.lg,
  },
});

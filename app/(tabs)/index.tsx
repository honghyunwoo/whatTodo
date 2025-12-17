import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Text, TextInput } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useJournalStore } from '@/store/journalStore';
import { useSrsStore } from '@/store/srsStore';
import { useTaskStore } from '@/store/taskStore';

const getTodayString = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export default function DiaryScreen() {
  const todayEntry = useJournalStore((state) => state.getTodayEntry());
  const recentEntries = useJournalStore((state) => state.getRecentEntries(3));
  const createEntry = useJournalStore((state) => state.createEntry);
  const updateEntry = useJournalStore((state) => state.updateEntry);

  const todayTasks = useTaskStore((state) => state.getTodayTasks());

  const reviewCount = useSrsStore((state) => state.getWordsForReview().length);

  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNote(todayEntry?.notes || '');
  }, [todayEntry?.notes]);

  const handleSave = async () => {
    setSaving(true);
    const today = getTodayString();

    if (todayEntry) {
      updateEntry(today, { notes: note });
    } else {
      createEntry({ date: today, notes: note });
    }

    setSaving(false);
  };

  const recommendedAction = useMemo(() => {
    if (reviewCount > 0) {
      return `복습 ${reviewCount}개 이어보기`;
    }

    if (todayTasks.some((task) => !task.completed)) {
      return '가벼운 할 일 하나만 체크하기';
    }

    return '잠깐 쉬어가기 (2048)';
  }, [reviewCount, todayTasks]);

  const handleActionPress = () => {
    if (reviewCount > 0) {
      router.push('/review');
      return;
    }

    if (todayTasks.some((task) => !task.completed)) {
      router.push('/todo');
      return;
    }

    router.push('/game');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>오늘 한 줄</Text>
        <TextInput
          mode="outlined"
          placeholder="오늘 어떤 하루였어? 한 줄만 적어봐"
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.input}
          outlineStyle={styles.inputOutline}
        />
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving || !note.trim()}
          style={styles.saveButton}
        >
          가볍게 기록하기
        </Button>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>오늘</Text>
          <Chip onPress={handleActionPress}>{recommendedAction}</Chip>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>오늘의 메모</Text>
            <Text style={styles.cardText}>
              {note.trim()
                ? note.trim()
                : '아직 기록이 없어요. 방금 한 줄을 남기면 여기서 다시 볼 수 있어요.'}
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.quickLinks}>
          <Chip icon="checkbox-outline" onPress={() => router.push('/todo')}>
            할 일 열기
          </Chip>
          <Chip icon="book-outline" onPress={() => router.push('/learn')}>
            영어 한 조각
          </Chip>
          <Chip icon="gamepad-variant-outline" onPress={() => router.push('/game')}>
            쉬어가기
          </Chip>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>최근 기록</Text>
        {recentEntries.length === 0 ? (
          <Text style={styles.cardText}>최근에 남긴 메모가 없어요. 오늘부터 천천히 쌓아봐요.</Text>
        ) : (
          recentEntries.map((entry) => (
            <Card key={entry.id} style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>{entry.date}</Text>
                <Text style={styles.cardText}>{entry.notes || '메모 없음'}</Text>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    marginBottom: SIZES.spacing.sm,
  },
  cardText: {
    color: COLORS.textSecondary,
    fontSize: SIZES.fontSize.md,
    marginTop: SIZES.spacing.xs,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.lg,
    fontWeight: '700',
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    padding: SIZES.spacing.md,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  inputOutline: {
    borderRadius: SIZES.borderRadius.md,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.sm,
    marginTop: SIZES.spacing.sm,
  },
  saveButton: {
    marginTop: SIZES.spacing.sm,
  },
  section: {
    marginBottom: SIZES.spacing.lg,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.spacing.sm,
  },
  sectionLabel: {
    color: COLORS.text,
    fontSize: SIZES.fontSize.xl,
    fontWeight: '700',
  },
});

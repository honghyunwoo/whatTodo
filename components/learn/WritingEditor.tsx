/**
 * WritingEditor Component
 * Writing input with helpful tools and suggestions
 * NO EMOJI - uses MaterialCommunityIcons
 */

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MotiView } from 'moti';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Card, Text } from 'react-native-paper';

import { COLORS } from '@/constants/colors';
import { SIZES } from '@/constants/sizes';
import { useTheme } from '@/contexts/ThemeContext';
import { learnHaptics } from '@/services/hapticService';
import type { WritingPrompt } from '@/types/writing';

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

interface WritingEditorProps {
  prompt: WritingPrompt;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isSubmitting?: boolean;
}

interface WritingHelper {
  id: string;
  title: string;
  icon: string;
  items: string[];
}

// ─────────────────────────────────────
// Constants
// ─────────────────────────────────────

const WRITING_HELPERS: WritingHelper[] = [
  {
    id: 'opening',
    title: 'Opening',
    icon: 'format-quote-open',
    items: [
      'Dear...',
      'Hello...',
      'I am writing to...',
      'Thank you for...',
      'I would like to...',
    ],
  },
  {
    id: 'connectors',
    title: 'Connectors',
    icon: 'link-variant',
    items: [
      'However,',
      'Moreover,',
      'In addition,',
      'On the other hand,',
      'Furthermore,',
      'As a result,',
      'For example,',
      'In conclusion,',
    ],
  },
  {
    id: 'closing',
    title: 'Closing',
    icon: 'format-quote-close',
    items: [
      'Best regards,',
      'Sincerely,',
      'Looking forward to...',
      'Thank you for your time.',
      'Please let me know if...',
    ],
  },
  {
    id: 'expressions',
    title: 'Expressions',
    icon: 'comment-text-outline',
    items: [
      'In my opinion,',
      'I believe that...',
      'It seems to me that...',
      'From my point of view,',
      'I would suggest that...',
    ],
  },
];

// ─────────────────────────────────────
// Component
// ─────────────────────────────────────

export function WritingEditor({
  prompt,
  value,
  onChangeText,
  onSubmit,
  disabled = false,
  isSubmitting = false,
}: WritingEditorProps) {
  const { colors, isDark } = useTheme();

  const [showHelpers, setShowHelpers] = useState(false);
  const [activeHelper, setActiveHelper] = useState<string | null>(null);

  // Word count
  const wordCount = useMemo(() => {
    return value
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }, [value]);

  // Check if word count is in valid range
  const isWordCountValid =
    wordCount >= prompt.wordCount.min && wordCount <= prompt.wordCount.max;

  const isUnderMinimum = wordCount < prompt.wordCount.min;
  const isOverMaximum = wordCount > prompt.wordCount.max;

  // Get word count color
  const getWordCountColor = () => {
    if (isOverMaximum) return '#ef4444';
    if (isUnderMinimum) return '#f59e0b';
    return '#22c55e';
  };

  // Insert text at cursor
  const insertText = useCallback(
    (text: string) => {
      const newValue = value + (value.endsWith(' ') || value === '' ? '' : ' ') + text + ' ';
      onChangeText(newValue);
      learnHaptics.selection();
    },
    [value, onChangeText]
  );

  // Toggle helper section
  const toggleHelper = useCallback(
    (helperId: string) => {
      if (activeHelper === helperId) {
        setActiveHelper(null);
      } else {
        setActiveHelper(helperId);
      }
      learnHaptics.selection();
    },
    [activeHelper]
  );

  // Can submit
  const canSubmit = wordCount >= prompt.wordCount.min && !disabled && !isSubmitting;

  return (
    <View style={styles.container}>
      {/* Prompt Card */}
      <Card style={[styles.promptCard, { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface }]}>
        <Card.Content>
          <View style={styles.promptHeader}>
            <MaterialCommunityIcons name="text-box-outline" size={20} color={COLORS.primary} />
            <Text style={[styles.promptTitle, { color: colors.text }]}>
              {prompt.topic}
            </Text>
          </View>

          {prompt.scenario && (
            <Text style={[styles.promptScenario, { color: colors.textSecondary }]}>
              {prompt.scenario}
            </Text>
          )}

          {/* Requirements */}
          {prompt.requirements.length > 0 && (
            <View style={styles.requirementsContainer}>
              <Text style={[styles.requirementsTitle, { color: colors.textSecondary }]}>
                Include:
              </Text>
              {prompt.requirements.map((req, index) => (
                <View key={index} style={styles.requirementItem}>
                  <MaterialCommunityIcons
                    name="checkbox-blank-circle-outline"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text style={[styles.requirementText, { color: colors.textSecondary }]}>
                    {req}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </Card.Content>
      </Card>

      {/* Editor Area */}
      <View
        style={[
          styles.editorContainer,
          {
            backgroundColor: isDark ? '#2C2C2E' : COLORS.surface,
            borderColor: isOverMaximum
              ? '#ef4444'
              : value.length > 0
              ? COLORS.primary
              : COLORS.border,
          },
        ]}
      >
        <TextInput
          style={[styles.editor, { color: colors.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Start writing here..."
          placeholderTextColor={colors.textSecondary}
          multiline
          textAlignVertical="top"
          editable={!disabled && !isSubmitting}
          autoCapitalize="sentences"
          autoCorrect={false}
        />

        {/* Word Count */}
        <View style={styles.wordCountContainer}>
          <Text style={[styles.wordCountText, { color: getWordCountColor() }]}>
            {wordCount} / {prompt.wordCount.min}-{prompt.wordCount.max} words
          </Text>
          {isUnderMinimum && (
            <Text style={[styles.wordCountHint, { color: '#f59e0b' }]}>
              Need {prompt.wordCount.min - wordCount} more
            </Text>
          )}
          {isOverMaximum && (
            <Text style={[styles.wordCountHint, { color: '#ef4444' }]}>
              Remove {wordCount - prompt.wordCount.max}
            </Text>
          )}
        </View>
      </View>

      {/* Helper Toggle Button */}
      <Pressable
        style={[
          styles.helperToggle,
          { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
        ]}
        onPress={() => {
          setShowHelpers(!showHelpers);
          if (showHelpers) setActiveHelper(null);
          learnHaptics.selection();
        }}
      >
        <MaterialCommunityIcons
          name={showHelpers ? 'chevron-down' : 'chevron-up'}
          size={20}
          color={colors.textSecondary}
        />
        <Text style={[styles.helperToggleText, { color: colors.textSecondary }]}>
          {showHelpers ? 'Hide writing helpers' : 'Show writing helpers'}
        </Text>
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={18}
          color="#f59e0b"
        />
      </Pressable>

      {/* Writing Helpers */}
      {showHelpers && (
        <MotiView
          from={{ opacity: 0, translateY: -10 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 200 }}
        >
          <Card style={[styles.helpersCard, { backgroundColor: isDark ? '#1C1C1E' : COLORS.background }]}>
            <Card.Content>
              {/* Helper Categories */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.helperCategories}
              >
                {WRITING_HELPERS.map((helper) => (
                  <Pressable
                    key={helper.id}
                    style={[
                      styles.helperCategory,
                      {
                        backgroundColor:
                          activeHelper === helper.id
                            ? COLORS.primary
                            : isDark
                            ? '#2C2C2E'
                            : COLORS.surface,
                      },
                    ]}
                    onPress={() => toggleHelper(helper.id)}
                  >
                    <MaterialCommunityIcons
                      name={helper.icon as any}
                      size={16}
                      color={activeHelper === helper.id ? '#fff' : colors.text}
                    />
                    <Text
                      style={[
                        styles.helperCategoryText,
                        {
                          color:
                            activeHelper === helper.id ? '#fff' : colors.text,
                        },
                      ]}
                    >
                      {helper.title}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* Helper Items */}
              {activeHelper && (
                <MotiView
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ type: 'timing', duration: 150 }}
                >
                  <View style={styles.helperItems}>
                    {WRITING_HELPERS.find((h) => h.id === activeHelper)?.items.map(
                      (item, index) => (
                        <Pressable
                          key={index}
                          style={[
                            styles.helperItem,
                            { backgroundColor: isDark ? '#2C2C2E' : COLORS.surface },
                          ]}
                          onPress={() => insertText(item)}
                        >
                          <Text
                            style={[styles.helperItemText, { color: colors.text }]}
                          >
                            {item}
                          </Text>
                          <MaterialCommunityIcons
                            name="plus"
                            size={14}
                            color={COLORS.primary}
                          />
                        </Pressable>
                      )
                    )}
                  </View>
                </MotiView>
              )}
            </Card.Content>
          </Card>
        </MotiView>
      )}

      {/* Submit Button */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 12 }}
      >
        <Pressable
          style={[
            styles.submitButton,
            {
              backgroundColor: canSubmit ? COLORS.primary : COLORS.border,
            },
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onSubmit();
          }}
          disabled={!canSubmit}
        >
          {isSubmitting ? (
            <>
              <MotiView
                from={{ rotate: '0deg' }}
                animate={{ rotate: '360deg' }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
              >
                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              </MotiView>
              <Text style={styles.submitButtonText}>Analyzing...</Text>
            </>
          ) : (
            <>
              <Text
                style={[
                  styles.submitButtonText,
                  { color: canSubmit ? '#fff' : colors.textSecondary },
                ]}
              >
                Submit for Review
              </Text>
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={canSubmit ? '#fff' : colors.textSecondary}
              />
            </>
          )}
        </Pressable>
      </MotiView>
    </View>
  );
}

// ─────────────────────────────────────
// Styles
// ─────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    padding: SIZES.spacing.md,
    gap: SIZES.spacing.md,
  },
  promptCard: {
    marginBottom: SIZES.spacing.xs,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.sm,
    marginBottom: SIZES.spacing.sm,
  },
  promptTitle: {
    fontSize: SIZES.fontSize.lg,
    fontWeight: '600',
    flex: 1,
  },
  promptScenario: {
    fontSize: SIZES.fontSize.sm,
    lineHeight: 20,
    marginBottom: SIZES.spacing.sm,
  },
  requirementsContainer: {
    marginTop: SIZES.spacing.sm,
  },
  requirementsTitle: {
    fontSize: SIZES.fontSize.xs,
    fontWeight: '500',
    marginBottom: SIZES.spacing.xs,
    textTransform: 'uppercase',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    marginBottom: SIZES.spacing.xs,
  },
  requirementText: {
    fontSize: SIZES.fontSize.sm,
  },
  editorContainer: {
    borderWidth: 2,
    borderRadius: SIZES.borderRadius.md,
    minHeight: 200,
  },
  editor: {
    flex: 1,
    fontSize: SIZES.fontSize.md,
    lineHeight: 24,
    padding: SIZES.spacing.md,
    minHeight: 180,
  },
  wordCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: SIZES.spacing.sm,
    paddingHorizontal: SIZES.spacing.md,
    paddingBottom: SIZES.spacing.sm,
  },
  wordCountText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  wordCountHint: {
    fontSize: SIZES.fontSize.xs,
  },
  helperToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.md,
  },
  helperToggleText: {
    fontSize: SIZES.fontSize.sm,
  },
  helpersCard: {},
  helperCategories: {
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
  },
  helperCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.md,
    paddingVertical: SIZES.spacing.sm,
    borderRadius: SIZES.borderRadius.full,
  },
  helperCategoryText: {
    fontSize: SIZES.fontSize.sm,
    fontWeight: '500',
  },
  helperItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.spacing.xs,
    marginTop: SIZES.spacing.md,
  },
  helperItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.spacing.xs,
    paddingHorizontal: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.xs,
    borderRadius: SIZES.borderRadius.sm,
  },
  helperItemText: {
    fontSize: SIZES.fontSize.sm,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.spacing.sm,
    paddingVertical: SIZES.spacing.md,
    borderRadius: SIZES.borderRadius.md,
    marginTop: SIZES.spacing.sm,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: SIZES.fontSize.md,
    fontWeight: '600',
  },
});

export default WritingEditor;

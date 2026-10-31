import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../theme/colors';
import { useThemeColors } from '../../../theme/useThemeColors';

function createTopicStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 8,
    },
    back: {
      color: colors.accent,
      fontSize: 15,
      fontWeight: '700',
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '700',
    },
    meta: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    situationRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    situationChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    situationChipSelected: {
      borderColor: colors.accent,
      backgroundColor: colors.chipSelected,
    },
    situationText: {
      color: colors.body,
      fontSize: 12,
      fontWeight: '700',
    },
    situationTextSelected: {
      color: colors.accent,
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 10,
    },
    empty: {
      color: colors.muted,
      fontSize: 14,
      paddingVertical: 12,
    },
    post: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      padding: 12,
      gap: 4,
    },
    postAuthor: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '800',
    },
    postBody: {
      color: colors.text,
      fontSize: 15,
      lineHeight: 21,
    },
    postTime: {
      color: colors.meta,
      fontSize: 12,
    },
    composer: {
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 8,
      gap: 8,
      backgroundColor: colors.screen,
    },
    input: {
      backgroundColor: colors.input,
      color: colors.text,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 72,
      textAlignVertical: 'top',
      fontSize: 15,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
    },
    submit: {
      backgroundColor: colors.button,
      borderRadius: 14,
      alignItems: 'center',
      paddingVertical: 14,
    },
    submitText: {
      color: colors.onAccent,
      fontSize: 16,
      fontWeight: '800',
    },
  });
}

export function useTopicStyles() {
  const colors = useThemeColors();
  return useMemo(() => createTopicStyles(colors), [colors]);
}

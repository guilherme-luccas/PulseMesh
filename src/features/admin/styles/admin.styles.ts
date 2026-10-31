import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../theme/colors';
import { useThemeColors } from '../../../theme/useThemeColors';

function createAdminStyles(colors: ThemeColors) {
  return StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.backdrop,
      justifyContent: 'center',
      padding: 24,
    },
    sheet: {
      backgroundColor: colors.sheet,
      borderRadius: 16,
      padding: 16,
      gap: 10,
    },
    title: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    hint: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    input: {
      backgroundColor: colors.input,
      color: colors.text,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 16,
    },
    error: {
      color: colors.danger,
      fontSize: 13,
    },
    submit: {
      backgroundColor: colors.button,
      borderRadius: 12,
      alignItems: 'center',
      paddingVertical: 12,
    },
    submitText: {
      color: colors.onAccent,
      fontSize: 15,
      fontWeight: '800',
    },
  });
}

export function useAdminStyles() {
  const colors = useThemeColors();
  return useMemo(() => createAdminStyles(colors), [colors]);
}

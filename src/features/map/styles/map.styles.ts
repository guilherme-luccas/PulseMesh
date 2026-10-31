import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../theme/colors';
import { useThemeColors } from '../../../theme/useThemeColors';

function createMapStyles(colors: ThemeColors) {
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
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    map: {
      flex: 1,
    },
    fallback: {
      flex: 1,
      color: colors.text,
      padding: 20,
    },
  });
}

export function useMapStyles() {
  const colors = useThemeColors();
  return useMemo(() => createMapStyles(colors), [colors]);
}

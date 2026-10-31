import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../theme/colors';
import { useThemeColors } from '../../../theme/useThemeColors';

function createConnectivityStyles(colors: ThemeColors) {
  return StyleSheet.create({
    banner: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    online: {
      backgroundColor: colors.online,
    },
    offline: {
      backgroundColor: colors.offline,
    },
    text: {
      color: colors.onBanner,
      fontSize: 13,
      fontWeight: '600',
    },
  });
}

export function useConnectivityStyles() {
  const colors = useThemeColors();
  return useMemo(() => createConnectivityStyles(colors), [colors]);
}

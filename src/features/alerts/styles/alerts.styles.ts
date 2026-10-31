import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import type { ThemeColors } from '../../../theme/colors';
import { useThemeColors } from '../../../theme/useThemeColors';

function createAlertsStyles(colors: ThemeColors) {
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
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '700',
      flex: 1,
    },
    adminButton: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    adminButtonActive: {
      borderColor: colors.accent,
      backgroundColor: colors.chipSelected,
    },
    adminButtonText: {
      color: colors.body,
      fontSize: 13,
      fontWeight: '700',
    },
    adminButtonTextActive: {
      color: colors.accent,
    },
    subtitle: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    syncRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    pending: {
      color: colors.warning,
      fontSize: 13,
      fontWeight: '600',
    },
    syncButton: {
      backgroundColor: colors.sync,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    syncButtonDisabled: {
      opacity: 0.45,
    },
    syncButtonText: {
      color: colors.onSync,
      fontSize: 13,
      fontWeight: '700',
    },
    list: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 10,
    },
    empty: {
      color: colors.muted,
      fontSize: 14,
      paddingVertical: 24,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      gap: 6,
    },
    cardTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 8,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
    },
    badge: {
      borderRadius: 999,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    badgeText: {
      color: colors.onAccent,
      fontSize: 11,
      fontWeight: '700',
    },
    cardDescription: {
      color: colors.body,
      fontSize: 14,
      lineHeight: 20,
    },
    cardMeta: {
      color: colors.meta,
      fontSize: 12,
    },
    topicRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 4,
    },
    topicLinkText: {
      color: colors.accent,
      fontSize: 13,
      fontWeight: '700',
    },
    deleteLinkText: {
      color: colors.danger,
      fontSize: 13,
      fontWeight: '700',
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
      fontSize: 15,
    },
    inputMultiline: {
      minHeight: 72,
      textAlignVertical: 'top',
    },
    severityRow: {
      flexDirection: 'row',
      gap: 8,
    },
    queueRow: {
      flexDirection: 'row',
      gap: 8,
    },
    severityChip: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    severityChipText: {
      color: colors.body,
      fontSize: 12,
      fontWeight: '600',
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

export function useAlertsStyles() {
  const colors = useThemeColors();
  return useMemo(() => createAlertsStyles(colors), [colors]);
}

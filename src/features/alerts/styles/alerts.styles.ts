import { StyleSheet } from 'react-native';
import type { AlertSeverity } from '../types/alert.types';

export const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  info: '#7DD3C7',
  warning: '#F5C16C',
  critical: '#FF6B6B',
};

export const alertsStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101614',
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
    color: '#F4F7F5',
    fontSize: 28,
    fontWeight: '700',
    flex: 1,
  },
  adminButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#31423B',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  adminButtonActive: {
    borderColor: '#E8F36A',
    backgroundColor: '#24332D',
  },
  adminButtonText: {
    color: '#C5D2CC',
    fontSize: 13,
    fontWeight: '700',
  },
  adminButtonTextActive: {
    color: '#E8F36A',
  },
  subtitle: {
    color: '#9AABA3',
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
    color: '#F5C16C',
    fontSize: 13,
    fontWeight: '600',
  },
  syncButton: {
    backgroundColor: '#1E3A34',
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
    color: '#D7F5EA',
    fontSize: 13,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  empty: {
    color: '#9AABA3',
    fontSize: 14,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: '#1A2420',
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
    color: '#F4F7F5',
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
    fontSize: 11,
    fontWeight: '700',
  },
  cardDescription: {
    color: '#C5D2CC',
    fontSize: 14,
    lineHeight: 20,
  },
  cardMeta: {
    color: '#7E9088',
    fontSize: 12,
  },
  topicLink: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  topicLinkText: {
    color: '#E8F36A',
    fontSize: 13,
    fontWeight: '700',
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: '#24302B',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 8,
    backgroundColor: '#101614',
  },
  input: {
    backgroundColor: '#18211E',
    color: '#F4F7F5',
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
    borderColor: '#31423B',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  severityChipText: {
    color: '#C5D2CC',
    fontSize: 12,
    fontWeight: '600',
  },
  error: {
    color: '#FF8E8E',
    fontSize: 13,
  },
  submit: {
    backgroundColor: '#E8F36A',
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
  },
  submitText: {
    color: '#17211C',
    fontSize: 16,
    fontWeight: '800',
  },
});

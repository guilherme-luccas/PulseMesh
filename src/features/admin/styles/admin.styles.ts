import { StyleSheet } from 'react-native';

export const adminStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    backgroundColor: '#18211E',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    color: '#F4F7F5',
    fontSize: 18,
    fontWeight: '700',
  },
  hint: {
    color: '#9AABA3',
    fontSize: 13,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#101614',
    color: '#F4F7F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#FF8E8E',
    fontSize: 13,
  },
  submit: {
    backgroundColor: '#E8F36A',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  submitText: {
    color: '#17211C',
    fontSize: 15,
    fontWeight: '800',
  },
});

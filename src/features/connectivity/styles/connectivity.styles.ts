import { StyleSheet } from 'react-native';

export const connectivityStyles = StyleSheet.create({
  banner: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  online: {
    backgroundColor: '#1E3A34',
  },
  offline: {
    backgroundColor: '#3A2A1E',
  },
  text: {
    color: '#F4F7F5',
    fontSize: 13,
    fontWeight: '600',
  },
});

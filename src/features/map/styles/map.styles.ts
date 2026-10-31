import { StyleSheet } from 'react-native';

export const mapStyles = StyleSheet.create({
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
  title: {
    color: '#F4F7F5',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#9AABA3',
    fontSize: 14,
    lineHeight: 20,
  },
  map: {
    flex: 1,
  },
  fallback: {
    flex: 1,
    color: '#F4F7F5',
    padding: 20,
  },
});

import { StyleSheet } from 'react-native';

export const topicStyles = StyleSheet.create({
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
  back: {
    color: '#E8F36A',
    fontSize: 15,
    fontWeight: '700',
  },
  title: {
    color: '#F4F7F5',
    fontSize: 24,
    fontWeight: '700',
  },
  meta: {
    color: '#9AABA3',
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
    borderColor: '#31423B',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  situationChipSelected: {
    borderColor: '#E8F36A',
    backgroundColor: '#24332D',
  },
  situationText: {
    color: '#C5D2CC',
    fontSize: 12,
    fontWeight: '700',
  },
  situationTextSelected: {
    color: '#E8F36A',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  empty: {
    color: '#9AABA3',
    fontSize: 14,
    paddingVertical: 12,
  },
  post: {
    backgroundColor: '#1A2420',
    borderRadius: 14,
    padding: 12,
    gap: 4,
  },
  postAuthor: {
    color: '#E8F36A',
    fontSize: 12,
    fontWeight: '800',
  },
  postBody: {
    color: '#F4F7F5',
    fontSize: 15,
    lineHeight: 21,
  },
  postTime: {
    color: '#7E9088',
    fontSize: 12,
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
    minHeight: 72,
    textAlignVertical: 'top',
    fontSize: 15,
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

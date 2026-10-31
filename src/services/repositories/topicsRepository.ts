import type { AlertPost, PostAuthorRole } from '../../features/alerts/types/topic.types';
import { topicsDatabase } from '../database/topicsDatabase';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const topicsRepository = {
  list(alertId: string): AlertPost[] {
    return topicsDatabase.list(alertId);
  },

  add(input: { alertId: string; body: string; authorRole: PostAuthorRole; authorId: string }): AlertPost[] {
    return topicsDatabase.append({
      id: createId(),
      alertId: input.alertId,
      body: input.body,
      createdAt: new Date().toISOString(),
      authorRole: input.authorRole,
      authorId: input.authorId,
    });
  },
};

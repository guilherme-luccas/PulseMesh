import { mergeTopicPosts } from '../../features/alerts/domain/topicSync';
import type { AlertPost, PostAuthorRole } from '../../features/alerts/types/topic.types';
import { topicsDatabase } from '../database/topicsDatabase';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export const topicsRepository = {
  list(alertId: string): AlertPost[] {
    return topicsDatabase.list(alertId);
  },

  add(input: { alertId: string; body: string; authorRole: PostAuthorRole; authorId: string }): {
    posts: AlertPost[];
    created: AlertPost;
  } {
    const created: AlertPost = {
      id: createId(),
      alertId: input.alertId,
      body: input.body,
      createdAt: new Date().toISOString(),
      authorRole: input.authorRole,
      authorId: input.authorId,
    };
    return { posts: topicsDatabase.append(created), created };
  },

  merge(alertId: string, remote: readonly AlertPost[], pendingIds: ReadonlySet<string>): AlertPost[] {
    const next = mergeTopicPosts(topicsDatabase.read(), alertId, remote, pendingIds);
    topicsDatabase.write(next);
    return next.filter((post) => post.alertId === alertId);
  },
};

import type { AlertPost } from '../../features/alerts/types/topic.types';
import { httpClient } from './httpClient';

export interface RemotePostInput {
  id: string;
  body: string;
  createdAt: string;
}

export const postsApi = {
  list(alertId: string, token: string): Promise<unknown> {
    return httpClient.get<unknown>(`/alerts/${encodeURIComponent(alertId)}/posts`, { token });
  },

  create(alertId: string, post: RemotePostInput, token: string): Promise<unknown> {
    return httpClient.post<unknown>(`/alerts/${encodeURIComponent(alertId)}/posts`, post, { token });
  },
};

export function toRemotePost(post: AlertPost): RemotePostInput {
  return { id: post.id, body: post.body, createdAt: post.createdAt };
}

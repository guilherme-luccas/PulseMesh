import type { OutboxEntry } from '../../features/alerts/types/alert.types';
import type { AlertPost, PostAuthorRole } from '../../features/alerts/types/topic.types';
import { alertsRepository } from '../repositories/alertsRepository';
import { topicsRepository } from '../repositories/topicsRepository';

const POST_MAX_LENGTH = 500;

export class TopicValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TopicValidationError';
  }
}

export const topicsService = {
  list(alertId: string): AlertPost[] {
    return topicsRepository.list(alertId);
  },

  publish(input: {
    alertId: string;
    body: string;
    authorRole: PostAuthorRole;
    authorId: string;
  }): { posts: AlertPost[]; outbox: OutboxEntry[] } {
    const body = input.body.trim();
    if (!body) {
      throw new TopicValidationError('Escreva uma mensagem.');
    }

    if (body.length > POST_MAX_LENGTH) {
      throw new TopicValidationError('A mensagem deve ter no máximo 500 caracteres.');
    }

    const saved = topicsRepository.add({ ...input, body });
    const outbox = alertsRepository.queuePost(saved.created);
    return { posts: saved.posts, outbox };
  },
};

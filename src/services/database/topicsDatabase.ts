import type { AlertPost, PostAuthorRole } from '../../features/alerts/types/topic.types';
import { readStorageString, writeStorageString } from './mmkvStorage';

const TOPICS_KEY = 'pulsemesh.topics';

const ROLES: readonly PostAuthorRole[] = ['citizen', 'admin'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isPost(value: unknown): value is AlertPost {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.alertId === 'string' &&
    typeof value.body === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.authorId === 'string' &&
    typeof value.authorRole === 'string' &&
    ROLES.includes(value.authorRole as PostAuthorRole)
  );
}

function readAll(raw: string | undefined): AlertPost[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isPost) : [];
  } catch {
    return [];
  }
}

export const topicsDatabase = {
  list(alertId: string): AlertPost[] {
    return readAll(readStorageString(TOPICS_KEY))
      .filter((post) => post.alertId === alertId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  },

  append(post: AlertPost): AlertPost[] {
    const all = readAll(readStorageString(TOPICS_KEY));
    const next = [...all, post];
    writeStorageString(TOPICS_KEY, JSON.stringify(next));
    return next.filter((item) => item.alertId === post.alertId);
  },
};

import type { AlertPost, PostAuthorRole } from '../types/topic.types';

const ROLES: readonly PostAuthorRole[] = ['citizen', 'admin'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readRemotePosts(payload: unknown): AlertPost[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.alertId !== 'string' ||
      typeof item.body !== 'string' ||
      typeof item.createdAt !== 'string' ||
      typeof item.authorId !== 'string' ||
      typeof item.authorRole !== 'string' ||
      !ROLES.includes(item.authorRole as PostAuthorRole)
    ) {
      return [];
    }

    return [
      {
        id: item.id,
        alertId: item.alertId,
        body: item.body,
        createdAt: item.createdAt,
        authorRole: item.authorRole as PostAuthorRole,
        authorId: item.authorId,
      },
    ];
  });
}

export function mergeTopicPosts(
  local: readonly AlertPost[],
  alertId: string,
  remote: readonly AlertPost[],
  pendingIds: ReadonlySet<string>,
): AlertPost[] {
  const pending = local.filter((post) => post.alertId === alertId && pendingIds.has(post.id));
  const pendingIdsOnAlert = new Set(pending.map((post) => post.id));
  const incoming = remote.filter((post) => post.alertId === alertId && !pendingIdsOnAlert.has(post.id));
  const others = local.filter((post) => post.alertId !== alertId);

  return [...others, ...incoming, ...pending].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
}

function assertCheck(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runTopicSyncCheck(): void {
  const local: AlertPost[] = [
    { id: 'keep', alertId: 'other', body: 'fica', createdAt: '2026-10-30T00:00:00.000Z', authorRole: 'citizen', authorId: 'a' },
    { id: 'pending', alertId: 'a1', body: 'local', createdAt: '2026-10-30T00:00:02.000Z', authorRole: 'citizen', authorId: 'a' },
    { id: 'gone', alertId: 'a1', body: 'saiu', createdAt: '2026-10-30T00:00:00.000Z', authorRole: 'citizen', authorId: 'a' },
  ];
  const remote: AlertPost[] = [
    { id: 'server', alertId: 'a1', body: 'chegou', createdAt: '2026-10-30T00:00:01.000Z', authorRole: 'admin', authorId: 'operator' },
  ];
  const merged = mergeTopicPosts(local, 'a1', remote, new Set(['pending']));
  assertCheck(merged.some((post) => post.id === 'keep'), 'another conversation stays');
  assertCheck(merged.some((post) => post.id === 'pending' && post.body === 'local'), 'a queued message stays');
  assertCheck(merged.some((post) => post.id === 'server'), 'a remote message arrives');
  assertCheck(!merged.some((post) => post.id === 'gone'), 'a message missing on the server leaves');
}

const checkEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

if (checkEnv?.PULSEMESH_CHECK === '1') {
  runTopicSyncCheck();
  console.log('topicSync ok');
}

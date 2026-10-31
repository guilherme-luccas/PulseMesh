import {
  applyCreate,
  applyDelete,
  applyRemoteAlerts,
  applySituation,
  applySyncSuccess,
  readRemoteAlerts,
} from '../../features/alerts/domain/alertsDomain';
import { readRemotePosts } from '../../features/alerts/domain/topicSync';
import type { AlertSituation, AlertsSnapshot, CreateAlertInput, EmergencyAlert, OutboxEntry } from '../../features/alerts/types/alert.types';
import type { AlertPost } from '../../features/alerts/types/topic.types';
import { alertsApi } from '../api/alertsApi';
import { ApiError } from '../api/httpClient';
import { peopleApi } from '../api/peopleApi';
import { postsApi, toRemotePost } from '../api/postsApi';
import { alertsDatabase } from '../database/alertsDatabase';
import { topicsDatabase } from '../database/topicsDatabase';
import { identityService } from '../identity/identityService';
import { topicsRepository } from './topicsRepository';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface SyncReport {
  snapshot: AlertsSnapshot;
  reachable: boolean;
  rejected: number;
  needsAdmin: boolean;
}

function toRemoteAlert(alert: EmergencyAlert, reporterId: string) {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    createdAt: alert.createdAt,
    coordinate: alert.coordinate,
    reporterId,
  };
}

export const alertsRepository = {
  load(): AlertsSnapshot {
    return alertsDatabase.read();
  },

  create(input: CreateAlertInput): AlertsSnapshot {
    const next = applyCreate(alertsDatabase.read(), input, {
      alertId: createId(),
      outboxId: createId(),
      now: new Date().toISOString(),
    });
    alertsDatabase.write(next);
    return next;
  },

  delete(alertId: string): AlertsSnapshot {
    const next = applyDelete(alertsDatabase.read(), alertId, {
      outboxId: createId(),
      now: new Date().toISOString(),
    });
    alertsDatabase.write(next);
    topicsDatabase.remove(alertId);
    return next;
  },

  queuePost(post: AlertPost): OutboxEntry[] {
    const current = alertsDatabase.read();
    const next: AlertsSnapshot = {
      ...current,
      outbox: [
        ...current.outbox,
        {
          id: createId(),
          operation: 'post',
          alertId: post.alertId,
          postId: post.id,
          createdAt: post.createdAt,
        },
      ],
    };
    alertsDatabase.write(next);
    return next.outbox;
  },

  setSituation(alertId: string, situation: AlertSituation): AlertsSnapshot {
    const next = applySituation(alertsDatabase.read(), alertId, situation, {
      outboxId: createId(),
      now: new Date().toISOString(),
    });
    alertsDatabase.write(next);
    return next;
  },

  async sync(adminToken: string | null): Promise<SyncReport> {
    const current = alertsDatabase.read();
    const identity = identityService.current() ?? identityService.ensure();
    const syncedOutboxIds = new Set<string>();
    const seenOutboxIds = new Set(current.outbox.map((entry) => entry.id));
    let reachable = false;
    let rejected = 0;
    let needsAdmin = false;

    let token: string | null = null;
    try {
      const person = await peopleApi.register({ id: identity.id, shortCode: identity.shortCode });
      token = person.token;
      reachable = true;
    } catch (error) {
      token = null;
      if (error instanceof ApiError) {
        reachable = true;
      }
    }

    const note = (error: unknown, onStatus?: (status: number) => boolean) => {
      if (!(error instanceof ApiError)) {
        return;
      }

      reachable = true;
      if (onStatus?.(error.status)) {
        return;
      }

      rejected += 1;
    };

    const writeSnapshot = (snapshot: AlertsSnapshot): AlertsSnapshot => {
      const arrived = alertsDatabase.read().outbox.filter((entry) => !seenOutboxIds.has(entry.id));
      const withArrivals = arrived.length === 0 ? snapshot : { ...snapshot, outbox: [...snapshot.outbox, ...arrived] };
      for (const entry of withArrivals.outbox) {
        seenOutboxIds.add(entry.id);
      }
      alertsDatabase.write(withArrivals);
      return withArrivals;
    };

    for (const entry of current.outbox) {
      if (entry.operation === 'delete') {
        if (!token) {
          if (reachable) {
            rejected += 1;
          }
          continue;
        }

        try {
          await alertsApi.remove(entry.alertId, token);
          syncedOutboxIds.add(entry.id);
        } catch (error) {
          note(error, (status) => {
            if (status === 404) {
              syncedOutboxIds.add(entry.id);
              return true;
            }

            return false;
          });
        }
        continue;
      }

      if (entry.operation === 'situation') {
        if (!adminToken || !entry.situation) {
          needsAdmin = true;
          continue;
        }

        try {
          await alertsApi.updateSituation(entry.alertId, entry.situation, adminToken);
          syncedOutboxIds.add(entry.id);
        } catch (error) {
          note(error, (status) => {
            if (status === 404) {
              syncedOutboxIds.add(entry.id);
              return true;
            }

            if (status === 401 || status === 403) {
              needsAdmin = true;
              return true;
            }

            return false;
          });
        }
        continue;
      }

      if (entry.operation === 'post') {
        const post = topicsDatabase.read().find((item) => item.id === entry.postId);
        if (!post) {
          syncedOutboxIds.add(entry.id);
          continue;
        }

        const postToken = post.authorRole === 'admin' ? adminToken : token;
        if (!postToken) {
          if (post.authorRole === 'admin') {
            needsAdmin = true;
          } else if (reachable) {
            rejected += 1;
          }
          continue;
        }

        const createStillQueued = current.outbox.some(
          (item) => item.alertId === entry.alertId && item.operation === 'create' && !syncedOutboxIds.has(item.id),
        );

        try {
          await postsApi.create(entry.alertId, toRemotePost(post), postToken);
          syncedOutboxIds.add(entry.id);
        } catch (error) {
          note(error, (status) => {
            if (status === 404 && createStillQueued) {
              return true;
            }

            if (status === 404) {
              syncedOutboxIds.add(entry.id);
              return true;
            }

            if ((status === 401 || status === 403) && post.authorRole === 'admin') {
              needsAdmin = true;
              return true;
            }

            return false;
          });
        }
        continue;
      }

      if (!token) {
        if (reachable) {
          rejected += 1;
        }
        continue;
      }

      const alert = current.alerts.find((item) => item.id === entry.alertId);
      if (!alert) {
        syncedOutboxIds.add(entry.id);
        continue;
      }

      if (alert.reporterId && alert.reporterId !== identity.id) {
        rejected += 1;
        continue;
      }

      try {
        await alertsApi.create(toRemoteAlert(alert, identity.id), token);
        syncedOutboxIds.add(entry.id);
      } catch (error) {
        note(error);
      }
    }

    let next = writeSnapshot(applySyncSuccess(current, syncedOutboxIds));

    if (token) {
      try {
        const remote = readRemoteAlerts(await alertsApi.list(token));
        const previousIds = next.alerts.map((alert) => alert.id);
        next = writeSnapshot(applyRemoteAlerts(next, remote));
        reachable = true;

        for (const alertId of previousIds) {
          if (!next.alerts.some((alert) => alert.id === alertId)) {
            topicsDatabase.remove(alertId);
          }
        }

        const pendingPostIds = new Set(
          next.outbox.flatMap((entry) => (entry.operation === 'post' && entry.postId ? [entry.postId] : [])),
        );

        for (const alert of next.alerts) {
          if (next.outbox.some((entry) => entry.alertId === alert.id && entry.operation === 'create')) {
            continue;
          }

          const canReadAsCitizen = alert.reporterId === identity.id;
          const readToken = canReadAsCitizen ? token : adminToken;
          if (!readToken) {
            continue;
          }

          try {
            const remotePosts = readRemotePosts(await postsApi.list(alert.id, readToken));
            topicsRepository.merge(alert.id, remotePosts, pendingPostIds);
          } catch (error) {
            if (error instanceof ApiError) {
              reachable = true;
            }
          }
        }
      } catch (error) {
        if (error instanceof ApiError) {
          reachable = true;
        }
      }
    }

    return { snapshot: alertsDatabase.read(), reachable, rejected, needsAdmin };
  },
};

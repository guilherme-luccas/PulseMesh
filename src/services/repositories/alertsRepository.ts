import {
  applyCreate,
  applyDelete,
  applyRemoteAlerts,
  applySituation,
  applySyncSuccess,
  readRemoteAlerts,
} from '../../features/alerts/domain/alertsDomain';
import type { AlertSituation, AlertsSnapshot, CreateAlertInput, EmergencyAlert } from '../../features/alerts/types/alert.types';
import { adminApi } from '../api/adminApi';
import { alertsApi } from '../api/alertsApi';
import { ApiError } from '../api/httpClient';
import { peopleApi } from '../api/peopleApi';
import { alertsDatabase } from '../database/alertsDatabase';
import { topicsDatabase } from '../database/topicsDatabase';
import { identityService } from '../identity/identityService';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

  setSituation(alertId: string, situation: AlertSituation): AlertsSnapshot {
    const next = applySituation(alertsDatabase.read(), alertId, situation, {
      outboxId: createId(),
      now: new Date().toISOString(),
    });
    alertsDatabase.write(next);
    return next;
  },

  async sync(adminCode: string): Promise<AlertsSnapshot> {
    const current = alertsDatabase.read();
    const identity = identityService.current() ?? identityService.ensure();
    const syncedOutboxIds = new Set<string>();

    let token: string | null = null;
    try {
      const person = await peopleApi.register({ id: identity.id, shortCode: identity.shortCode });
      token = person.token;
    } catch {
      token = null;
    }

    let adminToken: string | null = null;
    if (current.outbox.some((entry) => entry.operation === 'situation')) {
      try {
        const session = await adminApi.session(adminCode);
        adminToken = session.token;
      } catch {
        adminToken = null;
      }
    }

    for (const entry of current.outbox) {
      if (entry.operation === 'delete') {
        if (!token) {
          continue;
        }

        try {
          await alertsApi.remove(entry.alertId, token);
          syncedOutboxIds.add(entry.id);
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            syncedOutboxIds.add(entry.id);
          }
        }
        continue;
      }

      if (entry.operation === 'situation') {
        if (!adminToken || !entry.situation) {
          continue;
        }

        try {
          await alertsApi.updateSituation(entry.alertId, entry.situation, adminToken);
          syncedOutboxIds.add(entry.id);
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            syncedOutboxIds.add(entry.id);
          }
        }
        continue;
      }

      if (!token) {
        continue;
      }

      const alert = current.alerts.find((item) => item.id === entry.alertId);
      if (!alert) {
        syncedOutboxIds.add(entry.id);
        continue;
      }

      if (alert.reporterId && alert.reporterId !== identity.id) {
        continue;
      }

      try {
        await alertsApi.create(toRemoteAlert(alert, identity.id), token);
        syncedOutboxIds.add(entry.id);
      } catch {
        // Keep the entry in the outbox until a later sync succeeds.
      }
    }

    let next = applySyncSuccess(current, syncedOutboxIds);
    alertsDatabase.write(next);

    try {
      const remote = readRemoteAlerts(await alertsApi.list());
      next = applyRemoteAlerts(next, remote);
      alertsDatabase.write(next);
    } catch {
      // The upload already landed. The list refresh waits for the next connection.
    }

    return next;
  },
};

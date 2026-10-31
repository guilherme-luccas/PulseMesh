import { applyCreate, applySyncSuccess } from '../../features/alerts/domain/alertsDomain';
import type { AlertSituation, AlertsSnapshot, CreateAlertInput, EmergencyAlert } from '../../features/alerts/types/alert.types';
import { alertsApi } from '../api/alertsApi';
import { peopleApi } from '../api/peopleApi';
import { alertsDatabase } from '../database/alertsDatabase';
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

  setSituation(alertId: string, situation: AlertSituation): AlertsSnapshot {
    const current = alertsDatabase.read();
    const next = {
      ...current,
      alerts: current.alerts.map((alert) => (alert.id === alertId ? { ...alert, situation } : alert)),
    };
    alertsDatabase.write(next);
    return next;
  },

  async sync(): Promise<AlertsSnapshot> {
    const current = alertsDatabase.read();
    const identity = identityService.current() ?? identityService.ensure();
    const syncedAlertIds = new Set<string>();

    let token: string;
    try {
      const person = await peopleApi.register({ id: identity.id, shortCode: identity.shortCode });
      token = person.token;
    } catch {
      return current;
    }

    for (const entry of current.outbox) {
      const alert = current.alerts.find((item) => item.id === entry.alertId);
      if (!alert) {
        syncedAlertIds.add(entry.alertId);
        continue;
      }

      if (alert.reporterId && alert.reporterId !== identity.id) {
        continue;
      }

      try {
        await alertsApi.create(toRemoteAlert(alert, identity.id), token);
        syncedAlertIds.add(alert.id);
      } catch {
        // Keep the entry in the outbox until a later sync succeeds.
      }
    }

    const next = applySyncSuccess(current, syncedAlertIds);
    alertsDatabase.write(next);
    return next;
  },
};

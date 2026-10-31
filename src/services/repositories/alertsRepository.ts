import { applyCreate, applySyncSuccess } from '../../features/alerts/domain/alertsDomain';
import type { AlertsSnapshot, CreateAlertInput } from '../../features/alerts/types/alert.types';
import { alertsApi } from '../api/alertsApi';
import { alertsDatabase } from '../database/alertsDatabase';

function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
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

  async sync(): Promise<AlertsSnapshot> {
    const current = alertsDatabase.read();
    const syncedAlertIds = new Set<string>();

    for (const entry of current.outbox) {
      const alert = current.alerts.find((item) => item.id === entry.alertId);
      if (!alert) {
        syncedAlertIds.add(entry.alertId);
        continue;
      }

      try {
        await alertsApi.create(alert);
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

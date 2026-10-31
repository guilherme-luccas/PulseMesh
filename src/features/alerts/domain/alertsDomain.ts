import type {
  AlertDraftIds,
  AlertsSnapshot,
  CreateAlertInput,
} from '../types/alert.types';

export const EMPTY_ALERTS_SNAPSHOT: AlertsSnapshot = {
  alerts: [],
  outbox: [],
};

export function applyCreate(
  snapshot: AlertsSnapshot,
  input: CreateAlertInput,
  ids: AlertDraftIds,
): AlertsSnapshot {
  return {
    alerts: [
      {
        id: ids.alertId,
        title: input.title,
        description: input.description,
        severity: input.severity,
        createdAt: ids.now,
        syncStatus: 'pending',
        coordinate: input.coordinate,
      },
      ...snapshot.alerts,
    ],
    outbox: [
      ...snapshot.outbox,
      {
        id: ids.outboxId,
        operation: 'create',
        alertId: ids.alertId,
        createdAt: ids.now,
      },
    ],
  };
}

export function applySyncSuccess(
  snapshot: AlertsSnapshot,
  syncedAlertIds: ReadonlySet<string>,
): AlertsSnapshot {
  return {
    alerts: snapshot.alerts.map((alert) =>
      syncedAlertIds.has(alert.id) ? { ...alert, syncStatus: 'synced' } : alert,
    ),
    outbox: snapshot.outbox.filter((entry) => !syncedAlertIds.has(entry.alertId)),
  };
}

function assertCheck(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runAlertsDomainCheck(): void {
  const created = applyCreate(
    EMPTY_ALERTS_SNAPSHOT,
    {
      title: 'Alagamento',
      description: 'Av. Paulista',
      severity: 'critical',
    },
    { alertId: 'a1', outboxId: 'o1', now: '2026-10-30T00:00:00.000Z' },
  );

  assertCheck(created.alerts.length === 1, 'create adds one alert');
  assertCheck(created.alerts[0]?.syncStatus === 'pending', 'create stays pending');
  assertCheck(created.outbox.length === 1, 'create enqueues the outbox');
  assertCheck(created.outbox[0]?.alertId === 'a1', 'outbox points at the alert');
  assertCheck(created.alerts[0]?.coordinate === undefined, 'create without a place stays unpinned');

  const placed = applyCreate(
    EMPTY_ALERTS_SNAPSHOT,
    {
      title: 'Alagamento',
      description: 'Av. Paulista',
      severity: 'critical',
      coordinate: { latitude: -23.56, longitude: -46.65 },
    },
    { alertId: 'a2', outboxId: 'o2', now: '2026-10-30T00:00:00.000Z' },
  );
  assertCheck(placed.alerts[0]?.coordinate?.latitude === -23.56, 'create keeps the latitude');

  const synced = applySyncSuccess(created, new Set(['a1']));
  assertCheck(synced.outbox.length === 0, 'sync clears the outbox');
  assertCheck(synced.alerts[0]?.syncStatus === 'synced', 'sync marks the alert');

  const kept = applySyncSuccess(created, new Set());
  assertCheck(kept.outbox.length === 1, 'a failed sync keeps the outbox');
  assertCheck(kept.alerts[0]?.syncStatus === 'pending', 'a failed sync stays pending');
}

const checkEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

if (checkEnv?.PULSEMESH_CHECK === '1') {
  runAlertsDomainCheck();
  console.log('alertsDomain ok');
}

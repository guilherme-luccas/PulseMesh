import type {
  AlertDraftIds,
  AlertSeverity,
  AlertSituation,
  AlertsSnapshot,
  CreateAlertInput,
  EmergencyAlert,
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
        situation: 'open',
        coordinate: input.coordinate,
        reporterId: input.reporterId,
        reporterCode: input.reporterCode,
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

export function applyDelete(
  snapshot: AlertsSnapshot,
  alertId: string,
  ids: Pick<AlertDraftIds, 'outboxId' | 'now'>,
): AlertsSnapshot {
  const alert = snapshot.alerts.find((item) => item.id === alertId);
  const outbox = snapshot.outbox.filter((entry) => entry.alertId !== alertId);

  if (alert?.syncStatus === 'synced') {
    outbox.push({
      id: ids.outboxId,
      operation: 'delete',
      alertId,
      createdAt: ids.now,
    });
  }

  return {
    alerts: snapshot.alerts.filter((item) => item.id !== alertId),
    outbox,
  };
}

export interface RemoteAlertRecord {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  situation: AlertSituation;
  createdAt: string;
  coordinate?: EmergencyAlert['coordinate'];
  reporterId?: string;
  reporterCode?: string;
}

const REMOTE_SEVERITIES: readonly AlertSeverity[] = ['info', 'warning', 'critical'];
const REMOTE_SITUATIONS: readonly AlertSituation[] = ['open', 'attending', 'closed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function readRemoteAlerts(payload: unknown): RemoteAlertRecord[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.id !== 'string' ||
      typeof item.title !== 'string' ||
      typeof item.description !== 'string' ||
      typeof item.createdAt !== 'string' ||
      typeof item.severity !== 'string' ||
      typeof item.situation !== 'string' ||
      !REMOTE_SEVERITIES.includes(item.severity as AlertSeverity) ||
      !REMOTE_SITUATIONS.includes(item.situation as AlertSituation)
    ) {
      return [];
    }

    const coordinate =
      isRecord(item.coordinate) &&
      typeof item.coordinate.latitude === 'number' &&
      typeof item.coordinate.longitude === 'number'
        ? { latitude: item.coordinate.latitude, longitude: item.coordinate.longitude }
        : undefined;

    return [
      {
        id: item.id,
        title: item.title,
        description: item.description,
        severity: item.severity as AlertSeverity,
        situation: item.situation as AlertSituation,
        createdAt: item.createdAt,
        coordinate,
        reporterId: typeof item.reporterId === 'string' ? item.reporterId : undefined,
        reporterCode: typeof item.reporterCode === 'string' ? item.reporterCode : undefined,
      },
    ];
  });
}

export function applySituation(
  snapshot: AlertsSnapshot,
  alertId: string,
  situation: AlertSituation,
  ids: Pick<AlertDraftIds, 'outboxId' | 'now'>,
): AlertsSnapshot {
  const alert = snapshot.alerts.find((item) => item.id === alertId);
  if (!alert) {
    return snapshot;
  }

  const outbox = snapshot.outbox.filter((entry) => !(entry.alertId === alertId && entry.operation === 'situation'));
  outbox.push({
    id: ids.outboxId,
    operation: 'situation',
    alertId,
    createdAt: ids.now,
    situation,
  });

  return {
    alerts: snapshot.alerts.map((item) => (item.id === alertId ? { ...item, situation } : item)),
    outbox,
  };
}

export function applyRemoteAlerts(snapshot: AlertsSnapshot, remote: readonly RemoteAlertRecord[]): AlertsSnapshot {
  const localIds = new Set(snapshot.alerts.map((alert) => alert.id));
  const remoteById = new Map(remote.map((alert) => [alert.id, alert]));
  const blocked = new Set(
    snapshot.outbox.filter((entry) => entry.operation !== 'post').map((entry) => entry.alertId),
  );

  const kept = snapshot.alerts.flatMap((alert) => {
    if (blocked.has(alert.id)) {
      return [alert];
    }

    const incoming = remoteById.get(alert.id);
    if (!incoming) {
      return alert.syncStatus === 'pending' ? [alert] : [];
    }

    return [remoteToAlert(incoming)];
  });

  const added = remote
    .filter((alert) => !localIds.has(alert.id))
    .filter((alert) => !snapshot.outbox.some((entry) => entry.alertId === alert.id && entry.operation === 'delete'))
    .map(remoteToAlert);

  return {
    alerts: [...kept, ...added].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    outbox: snapshot.outbox,
  };
}

function remoteToAlert(alert: RemoteAlertRecord): EmergencyAlert {
  return {
    id: alert.id,
    title: alert.title,
    description: alert.description,
    severity: alert.severity,
    situation: alert.situation,
    createdAt: alert.createdAt,
    syncStatus: 'synced',
    coordinate: alert.coordinate,
    reporterId: alert.reporterId,
    reporterCode: alert.reporterCode,
  };
}

export function applySyncSuccess(snapshot: AlertsSnapshot, syncedOutboxIds: ReadonlySet<string>): AlertsSnapshot {
  const syncedAlertIds = new Set(
    snapshot.outbox
      .filter((entry) => syncedOutboxIds.has(entry.id) && entry.operation === 'create')
      .map((entry) => entry.alertId),
  );

  return {
    alerts: snapshot.alerts.map((alert) =>
      syncedAlertIds.has(alert.id) ? { ...alert, syncStatus: 'synced' } : alert,
    ),
    outbox: snapshot.outbox.filter((entry) => !syncedOutboxIds.has(entry.id)),
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
  assertCheck(created.alerts[0]?.situation === 'open', 'create starts open');
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

  const synced = applySyncSuccess(created, new Set(['o1']));
  assertCheck(synced.outbox.length === 0, 'sync clears the outbox');
  assertCheck(synced.alerts[0]?.syncStatus === 'synced', 'sync marks the alert');

  const kept = applySyncSuccess(created, new Set());
  assertCheck(kept.outbox.length === 1, 'a failed sync keeps the outbox');
  assertCheck(kept.alerts[0]?.syncStatus === 'pending', 'a failed sync stays pending');

  const dropped = applyDelete(created, 'a1', { outboxId: 'd1', now: '2026-10-30T00:00:00.000Z' });
  assertCheck(dropped.alerts.length === 0, 'delete removes a pending alert');
  assertCheck(dropped.outbox.length === 0, 'delete of a pending alert skips the server');

  const removed = applyDelete(synced, 'a1', { outboxId: 'd2', now: '2026-10-30T00:00:00.000Z' });
  assertCheck(removed.alerts.length === 0, 'delete removes a synced alert');
  assertCheck(removed.outbox[0]?.operation === 'delete', 'delete of a synced alert is queued');

  const changed = applySituation(synced, 'a1', 'closed', { outboxId: 's1', now: '2026-10-30T00:00:00.000Z' });
  assertCheck(changed.alerts[0]?.situation === 'closed', 'situation updates the alert');
  assertCheck(changed.outbox[0]?.operation === 'situation', 'situation is queued');

  const merged = applyRemoteAlerts(EMPTY_ALERTS_SNAPSHOT, [
    {
      id: 'remote',
      title: 'Queda',
      description: '',
      severity: 'info',
      situation: 'attending',
      createdAt: '2026-10-30T00:00:00.000Z',
      reporterId: 'other',
      reporterCode: 'ZZZZ',
    },
  ]);
  assertCheck(merged.alerts.length === 1, 'pull adds a remote alert');
  assertCheck(merged.alerts[0]?.syncStatus === 'synced', 'pulled alert is already synced');
  assertCheck(merged.alerts[0]?.reporterId === 'other', 'pull keeps the reporter');

  const chatting = applyRemoteAlerts(
    {
      ...synced,
      outbox: [{ id: 'p1', operation: 'post', alertId: 'a1', createdAt: synced.alerts[0]?.createdAt ?? '', postId: 'post-1' }],
    },
    [
      {
        id: 'a1',
        title: 'Alagamento',
        description: 'Av. Paulista',
        severity: 'critical',
        situation: 'attending',
        createdAt: '2026-10-30T00:00:00.000Z',
      },
    ],
  );
  assertCheck(chatting.alerts[0]?.situation === 'attending', 'a queued message still accepts the remote situation');
  assertCheck(chatting.outbox[0]?.operation === 'post', 'a queued message stays in the outbox');
}

const checkEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  ?.env;

if (checkEnv?.PULSEMESH_CHECK === '1') {
  runAlertsDomainCheck();
  console.log('alertsDomain ok');
}

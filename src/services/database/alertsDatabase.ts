import type {
  AlertCoordinate,
  AlertSituation,
  AlertsSnapshot,
  AlertSeverity,
  EmergencyAlert,
  OutboxEntry,
  SyncStatus,
} from '../../features/alerts/types/alert.types';
import { EMPTY_ALERTS_SNAPSHOT } from '../../features/alerts/domain/alertsDomain';
import { readStorageString, writeStorageString } from './mmkvStorage';

const ALERTS_SNAPSHOT_KEY = 'pulsemesh.alerts.snapshot';

const SEVERITIES: readonly AlertSeverity[] = ['info', 'warning', 'critical'];
const SYNC_STATUSES: readonly SyncStatus[] = ['pending', 'synced'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSeverity(value: unknown): value is AlertSeverity {
  return typeof value === 'string' && SEVERITIES.includes(value as AlertSeverity);
}

function isSyncStatus(value: unknown): value is SyncStatus {
  return typeof value === 'string' && SYNC_STATUSES.includes(value as SyncStatus);
}

const SITUATIONS: readonly AlertSituation[] = ['open', 'attending', 'closed'];

function isSituation(value: unknown): value is AlertSituation {
  return typeof value === 'string' && SITUATIONS.includes(value as AlertSituation);
}

function isAlert(value: unknown): value is EmergencyAlert {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.title === 'string' &&
    typeof value.description === 'string' &&
    isSeverity(value.severity) &&
    typeof value.createdAt === 'string' &&
    isSyncStatus(value.syncStatus) &&
    (value.coordinate === undefined || isCoordinate(value.coordinate))
  );
}

function toAlert(value: unknown): EmergencyAlert | null {
  if (!isAlert(value)) {
    return null;
  }

  return {
    ...value,
    situation: isSituation(value.situation) ? value.situation : 'open',
    reporterId: typeof value.reporterId === 'string' ? value.reporterId : undefined,
    reporterCode: typeof value.reporterCode === 'string' ? value.reporterCode : undefined,
  };
}

function isCoordinate(value: unknown): value is AlertCoordinate {
  return (
    isRecord(value) &&
    typeof value.latitude === 'number' &&
    typeof value.longitude === 'number' &&
    Number.isFinite(value.latitude) &&
    Number.isFinite(value.longitude)
  );
}

function isOutboxEntry(value: unknown): value is OutboxEntry {
  if (
    !isRecord(value) ||
    typeof value.id !== 'string' ||
    typeof value.alertId !== 'string' ||
    typeof value.createdAt !== 'string'
  ) {
    return false;
  }

  if (value.operation === 'create' || value.operation === 'delete') {
    return true;
  }

  if (value.operation === 'post') {
    return typeof value.postId === 'string';
  }

  return value.operation === 'situation' && isSituation(value.situation);
}

function parseSnapshot(raw: string | undefined): AlertsSnapshot {
  if (!raw) {
    return EMPTY_ALERTS_SNAPSHOT;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed) || !Array.isArray(parsed.alerts) || !Array.isArray(parsed.outbox)) {
      return EMPTY_ALERTS_SNAPSHOT;
    }

    return {
      alerts: parsed.alerts.flatMap((item) => {
        const alert = toAlert(item);
        return alert ? [alert] : [];
      }),
      outbox: parsed.outbox.filter(isOutboxEntry),
    };
  } catch {
    return EMPTY_ALERTS_SNAPSHOT;
  }
}

export const alertsDatabase = {
  read(): AlertsSnapshot {
    return parseSnapshot(readStorageString(ALERTS_SNAPSHOT_KEY));
  },

  write(snapshot: AlertsSnapshot): void {
    writeStorageString(ALERTS_SNAPSHOT_KEY, JSON.stringify(snapshot));
  },
};

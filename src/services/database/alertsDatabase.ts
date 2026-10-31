import type {
  AlertCoordinate,
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
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    value.operation === 'create' &&
    typeof value.alertId === 'string' &&
    typeof value.createdAt === 'string'
  );
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
      alerts: parsed.alerts.filter(isAlert),
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

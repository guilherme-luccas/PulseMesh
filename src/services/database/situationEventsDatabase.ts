import type { AlertSituation } from '../../features/alerts/types/alert.types';
import { readStorageString, writeStorageString } from './mmkvStorage';

const EVENTS_KEY = 'pulsemesh.situation-events';

export interface SituationEvent {
  id: string;
  alertId: string;
  situation: AlertSituation;
  createdAt: string;
}

const SITUATIONS: readonly AlertSituation[] = ['open', 'attending', 'closed'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isEvent(value: unknown): value is SituationEvent {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.alertId === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.situation === 'string' &&
    SITUATIONS.includes(value.situation as AlertSituation)
  );
}

function readAll(): SituationEvent[] {
  const raw = readStorageString(EVENTS_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(isEvent) : [];
  } catch {
    return [];
  }
}

function writeAll(events: readonly SituationEvent[]): void {
  writeStorageString(EVENTS_KEY, JSON.stringify(events));
}

export function readRemoteEvents(payload: unknown): SituationEvent[] {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload.filter(isEvent);
}

export const situationEventsDatabase = {
  list(alertId: string): SituationEvent[] {
    return readAll()
      .filter((event) => event.alertId === alertId)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  },

  append(event: SituationEvent): SituationEvent[] {
    const all = readAll().filter((item) => item.id !== event.id);
    writeAll([...all, event]);
    return this.list(event.alertId);
  },

  merge(alertId: string, remote: readonly SituationEvent[]): SituationEvent[] {
    const incoming = remote.filter((event) => event.alertId === alertId);
    const incomingIds = new Set(incoming.map((event) => event.id));
    const all = readAll();
    const others = all.filter((event) => event.alertId !== alertId);
    const pending = all.filter((event) => event.alertId === alertId && !incomingIds.has(event.id));
    writeAll([...others, ...incoming, ...pending]);
    return this.list(alertId);
  },

  remove(alertId: string): void {
    writeAll(readAll().filter((event) => event.alertId !== alertId));
  },
};

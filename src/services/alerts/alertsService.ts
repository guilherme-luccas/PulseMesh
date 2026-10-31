import { ADMIN_ACCESS_CODE } from '../../features/admin/admin.constants';
import type { AlertsSnapshot, AlertSituation, CreateAlertInput } from '../../features/alerts/types/alert.types';
import { connectivityService } from '../connectivity/connectivityService';
import { alertsRepository } from '../repositories/alertsRepository';

const TITLE_MAX_LENGTH = 80;

export class AlertValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlertValidationError';
  }
}

export type SyncOutcome = 'offline' | 'empty' | 'backend' | 'synced';

export interface SyncResult {
  snapshot: AlertsSnapshot;
  message: string | null;
  outcome: SyncOutcome;
}

const BACKEND_MESSAGE = 'Sem servidor. A fila foi mantida.';

export function normalizeCreateAlert(input: CreateAlertInput): CreateAlertInput {
  const title = input.title.trim();
  const description = input.description.trim();

  if (!title) {
    throw new AlertValidationError('Informe um título para o alerta.');
  }

  if (title.length > TITLE_MAX_LENGTH) {
    throw new AlertValidationError('O título deve ter no máximo 80 caracteres.');
  }

  return {
    title,
    description,
    severity: input.severity,
    coordinate: input.coordinate,
    reporterId: input.reporterId,
    reporterCode: input.reporterCode,
  };
}

export const alertsService = {
  list(): AlertsSnapshot {
    return alertsRepository.load();
  },

  createAlert(input: CreateAlertInput): AlertsSnapshot {
    return alertsRepository.create(normalizeCreateAlert(input));
  },

  setSituation(alertId: string, situation: AlertSituation): AlertsSnapshot {
    return alertsRepository.setSituation(alertId, situation);
  },

  deleteAlert(alertId: string): AlertsSnapshot {
    return alertsRepository.delete(alertId);
  },

  async syncOutbox(): Promise<SyncResult> {
    const snapshot = alertsRepository.load();

    if (connectivityService.status() !== 'online') {
      return { snapshot, message: null, outcome: 'offline' };
    }

    const next = await alertsRepository.sync(ADMIN_ACCESS_CODE);
    if (next.outbox.length > 0) {
      return { snapshot: next, message: BACKEND_MESSAGE, outcome: 'backend' };
    }

    return { snapshot: next, message: null, outcome: 'synced' };
  },
};

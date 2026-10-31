import type { AlertsSnapshot, CreateAlertInput } from '../../features/alerts/types/alert.types';
import { alertsRepository } from '../repositories/alertsRepository';

const TITLE_MAX_LENGTH = 80;

export class AlertValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlertValidationError';
  }
}

export const alertsService = {
  list(): AlertsSnapshot {
    return alertsRepository.load();
  },

  createAlert(input: CreateAlertInput): AlertsSnapshot {
    const title = input.title.trim();
    const description = input.description.trim();

    if (!title) {
      throw new AlertValidationError('Informe um título para o alerta.');
    }

    if (title.length > TITLE_MAX_LENGTH) {
      throw new AlertValidationError('O título deve ter no máximo 80 caracteres.');
    }

    return alertsRepository.create({
      title,
      description,
      severity: input.severity,
    });
  },

  syncOutbox(): Promise<AlertsSnapshot> {
    return alertsRepository.sync();
  },
};

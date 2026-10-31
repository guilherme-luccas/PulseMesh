export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const;

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export type SyncStatus = 'pending' | 'synced';

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface CreateAlertInput {
  title: string;
  description: string;
  severity: AlertSeverity;
}

export interface OutboxEntry {
  id: string;
  operation: 'create';
  alertId: string;
  createdAt: string;
}

export interface AlertsSnapshot {
  alerts: EmergencyAlert[];
  outbox: OutboxEntry[];
}

export interface AlertDraftIds {
  alertId: string;
  outboxId: string;
  now: string;
}

export const ALERT_SEVERITY_LABEL: Record<AlertSeverity, string> = {
  info: 'Informação',
  warning: 'Atenção',
  critical: 'Crítico',
};

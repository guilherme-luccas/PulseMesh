export const ALERT_SEVERITIES = ['info', 'warning', 'critical'] as const;

export type AlertSeverity = (typeof ALERT_SEVERITIES)[number];

export type SyncStatus = 'pending' | 'synced';

export type AlertSituation = 'open' | 'attending' | 'closed';

export const ALERT_SITUATION_LABEL: Record<AlertSituation, string> = {
  open: 'Aberto',
  attending: 'Em atendimento',
  closed: 'Encerrado',
};

export interface AlertCoordinate {
  latitude: number;
  longitude: number;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: string;
  syncStatus: SyncStatus;
  situation: AlertSituation;
  coordinate?: AlertCoordinate;
  reporterId?: string;
  reporterCode?: string;
}

export interface CreateAlertInput {
  title: string;
  description: string;
  severity: AlertSeverity;
  coordinate?: AlertCoordinate;
  reporterId?: string;
  reporterCode?: string;
}

export interface OutboxEntry {
  id: string;
  operation: 'create' | 'delete' | 'situation' | 'post';
  alertId: string;
  createdAt: string;
  situation?: AlertSituation;
  postId?: string;
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

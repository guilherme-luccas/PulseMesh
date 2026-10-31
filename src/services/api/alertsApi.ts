import type { AlertCoordinate, AlertSeverity, AlertSituation } from '../../features/alerts/types/alert.types';
import { httpClient } from './httpClient';

export interface RemoteAlertInput {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  createdAt: string;
  coordinate?: AlertCoordinate;
  reporterId: string;
}

export interface RemoteAlertReceipt {
  id: string;
  situation: string;
}

export const alertsApi = {
  create(alert: RemoteAlertInput, token: string): Promise<RemoteAlertReceipt> {
    return httpClient.post<RemoteAlertReceipt>('/alerts', alert, { token });
  },

  remove(alertId: string, token: string): Promise<RemoteAlertReceipt> {
    return httpClient.delete<RemoteAlertReceipt>(`/alerts/${encodeURIComponent(alertId)}`, { token });
  },

  list(): Promise<unknown> {
    return httpClient.get<unknown>('/alerts');
  },

  updateSituation(alertId: string, situation: AlertSituation, token: string): Promise<RemoteAlertReceipt> {
    return httpClient.patch<RemoteAlertReceipt>(`/alerts/${encodeURIComponent(alertId)}`, { situation }, { token });
  },
};

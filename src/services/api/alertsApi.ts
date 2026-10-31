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

  list(token: string): Promise<unknown> {
    return httpClient.get<unknown>('/alerts', { token });
  },

  updateSituation(
    alertId: string,
    event: { id: string; situation: AlertSituation; createdAt: string },
    token: string,
  ): Promise<RemoteAlertReceipt> {
    return httpClient.patch<RemoteAlertReceipt>(`/alerts/${encodeURIComponent(alertId)}`, event, { token });
  },

  listEvents(alertId: string, token: string): Promise<unknown> {
    return httpClient.get<unknown>(`/alerts/${encodeURIComponent(alertId)}/events`, { token });
  },
};

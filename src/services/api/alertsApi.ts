import type { AlertCoordinate, AlertSeverity } from '../../features/alerts/types/alert.types';
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
};

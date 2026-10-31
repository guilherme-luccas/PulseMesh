import type { EmergencyAlert } from '../../features/alerts/types/alert.types';
import { httpClient } from './httpClient';

export interface RemoteAlertReceipt {
  ok: boolean;
}

export const alertsApi = {
  create(alert: EmergencyAlert): Promise<RemoteAlertReceipt> {
    return httpClient.post<RemoteAlertReceipt>('/alerts', alert);
  },
};

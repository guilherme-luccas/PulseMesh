import { httpClient } from './httpClient';

export const adminApi = {
  session(code: string): Promise<{ token: string }> {
    return httpClient.post<{ token: string }>('/admin/session', { code });
  },
};

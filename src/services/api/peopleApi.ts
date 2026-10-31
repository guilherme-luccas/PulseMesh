import { httpClient } from './httpClient';

export interface RemotePerson {
  id: string;
  shortCode: string;
  token: string;
}

export const peopleApi = {
  register(input: { id: string; shortCode: string }): Promise<RemotePerson> {
    return httpClient.post<RemotePerson>('/people', input);
  },

  recover(shortCode: string): Promise<RemotePerson> {
    return httpClient.post<RemotePerson>('/people/recover', { shortCode });
  },
};

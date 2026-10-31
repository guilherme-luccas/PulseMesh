import { readRemoteEvents, situationEventsDatabase, type SituationEvent } from '../database/situationEventsDatabase';
import { alertsApi } from '../api/alertsApi';
import { peopleApi } from '../api/peopleApi';
import { connectivityService } from '../connectivity/connectivityService';
import { identityService } from '../identity/identityService';

export const situationEventsService = {
  list(alertId: string): SituationEvent[] {
    return situationEventsDatabase.list(alertId);
  },

  async refresh(alertId: string, input: { reporterId?: string; adminToken: string | null }): Promise<SituationEvent[]> {
    if (connectivityService.status() !== 'online') {
      return situationEventsDatabase.list(alertId);
    }

    await identityService.prepare();
    const identity = identityService.current();
    if (!identity) {
      return situationEventsDatabase.list(alertId);
    }
    const person = await peopleApi.register({ id: identity.id, shortCode: identity.shortCode });
    const token =
      input.reporterId !== identity.id && input.adminToken ? input.adminToken : person.token;
    const remote = readRemoteEvents(await alertsApi.listEvents(alertId, token));
    return situationEventsDatabase.merge(alertId, remote);
  },
};

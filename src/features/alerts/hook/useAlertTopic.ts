import { useEffect, useState } from 'react';
import { ALERT_SITUATION_LABEL, type AlertSituation } from '../types/alert.types';
import type { AlertPost } from '../types/topic.types';
import { useAlertsStore } from '../store/useAlertsStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { identityService } from '../../../services/identity/identityService';
import { situationEventsService } from '../../../services/situation/situationEventsService';
import type { SituationEvent } from '../../../services/database/situationEventsDatabase';
import { topicsService } from '../../../services/topics/topicsService';
import { canJoinTopic } from '../domain/topicAccess';

const SITUATIONS: AlertSituation[] = ['open', 'attending', 'closed'];

export function useAlertTopic(alertId: string) {
  const alert = useAlertsStore((state) => state.alerts.find((item) => item.id === alertId));
  const setSituation = useAlertsStore((state) => state.setSituation);
  const unlocked = useAdminStore((state) => state.unlocked);
  const adminToken = useAdminStore((state) => state.token);
  const [posts, setPosts] = useState<AlertPost[]>(() => topicsService.list(alertId));
  const [events, setEvents] = useState<SituationEvent[]>(() => situationEventsService.list(alertId));
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const identityId = identityService.current()?.id ?? null;
  const syncing = useAlertsStore((state) => state.syncing);
  const syncOutbox = useAlertsStore((state) => state.syncOutbox);
  const canPost = alert
    ? canJoinTopic({ reporterId: alert.reporterId, identityId, isAdmin: unlocked })
    : false;

  useEffect(() => {
    void syncOutbox();
  }, [alertId, syncOutbox]);

  useEffect(() => {
    if (syncing) {
      return;
    }

    setPosts(topicsService.list(alertId));
    void situationEventsService
      .refresh(alertId, { reporterId: alert?.reporterId, adminToken })
      .then(setEvents)
      .catch(() => setEvents(situationEventsService.list(alertId)));
  }, [adminToken, alert?.reporterId, alertId, syncing]);

  function onPublish() {
    if (!canPost) {
      return;
    }

    void identityService.prepare().then(() => {
      const identity = identityService.current() ?? identityService.ensure();
      try {
        const next = topicsService.publish({
          alertId,
          body: draft,
          authorRole: unlocked ? 'admin' : 'citizen',
          authorId: unlocked ? 'operator' : identity.id,
        });
        setPosts(next.posts);
        useAlertsStore.setState({ outbox: next.outbox });
        setDraft('');
        setError(null);
        void syncOutbox();
      } catch (publishError) {
        const message = publishError instanceof Error ? publishError.message : 'Não foi possível publicar.';
        setError(message);
      }
    });
  }

  function onSituation(situation: AlertSituation) {
    if (!unlocked) {
      return;
    }

    setSituation(alertId, situation);
    setEvents(situationEventsService.list(alertId));
  }

  return {
    alert,
    posts,
    draft,
    error,
    unlocked,
    canPost,
    situations: SITUATIONS,
    events,
    situationLabel: ALERT_SITUATION_LABEL,
    setDraft,
    onPublish,
    onSituation,
  };
}

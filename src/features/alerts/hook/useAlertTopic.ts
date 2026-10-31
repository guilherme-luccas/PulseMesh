import { useEffect, useState } from 'react';
import { ALERT_SITUATION_LABEL, type AlertSituation } from '../types/alert.types';
import type { AlertPost } from '../types/topic.types';
import { useAlertsStore } from '../store/useAlertsStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { identityService } from '../../../services/identity/identityService';
import { topicsService } from '../../../services/topics/topicsService';
import { canJoinTopic } from '../domain/topicAccess';

const SITUATIONS: AlertSituation[] = ['open', 'attending', 'closed'];

export function useAlertTopic(alertId: string) {
  const alert = useAlertsStore((state) => state.alerts.find((item) => item.id === alertId));
  const setSituation = useAlertsStore((state) => state.setSituation);
  const unlocked = useAdminStore((state) => state.unlocked);
  const [posts, setPosts] = useState<AlertPost[]>(() => topicsService.list(alertId));
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
    if (!syncing) {
      setPosts(topicsService.list(alertId));
    }
  }, [alertId, syncing]);

  function onPublish() {
    if (!canPost) {
      return;
    }

    const identity = identityService.ensure();
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
  }

  function onSituation(situation: AlertSituation) {
    if (!unlocked) {
      return;
    }

    setSituation(alertId, situation);
  }

  return {
    alert,
    posts,
    draft,
    error,
    unlocked,
    canPost,
    situations: SITUATIONS,
    situationLabel: ALERT_SITUATION_LABEL,
    setDraft,
    onPublish,
    onSituation,
  };
}

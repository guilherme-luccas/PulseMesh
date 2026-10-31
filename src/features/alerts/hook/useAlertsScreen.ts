import { useCallback, useEffect, useState } from 'react';
import type { AlertSeverity, EmergencyAlert } from '../types/alert.types';
import { useAlertsStore } from '../store/useAlertsStore';

export interface AlertsScreenViewModel {
  alerts: EmergencyAlert[];
  pendingCount: number;
  syncing: boolean;
  error: string | null;
  title: string;
  description: string;
  severity: AlertSeverity;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setSeverity: (value: AlertSeverity) => void;
  onCreate: () => void;
  onSync: () => void;
}

export function useAlertsScreen(): AlertsScreenViewModel {
  const alerts = useAlertsStore((state) => state.alerts);
  const pendingCount = useAlertsStore((state) => state.outbox.length);
  const error = useAlertsStore((state) => state.error);
  const hydrate = useAlertsStore((state) => state.hydrate);
  const createAlert = useAlertsStore((state) => state.createAlert);
  const syncOutbox = useAlertsStore((state) => state.syncOutbox);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const onCreate = useCallback(() => {
    const saved = createAlert({ title, description, severity });
    if (saved) {
      setTitle('');
      setDescription('');
    }
  }, [createAlert, description, severity, title]);

  const onSync = useCallback(() => {
    setSyncing(true);
    syncOutbox().finally(() => {
      setSyncing(false);
    });
  }, [syncOutbox]);

  return {
    alerts,
    pendingCount,
    syncing,
    error,
    title,
    description,
    severity,
    setTitle,
    setDescription,
    setSeverity,
    onCreate,
    onSync,
  };
}

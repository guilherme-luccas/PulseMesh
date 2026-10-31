import { useCallback, useState } from 'react';
import type { AlertSeverity, EmergencyAlert } from '../types/alert.types';
import { useAlertsStore } from '../store/useAlertsStore';
import { useMapFocusStore } from '../../map/store/useMapFocusStore';

export interface AlertsScreenViewModel {
  alerts: EmergencyAlert[];
  pendingCount: number;
  syncing: boolean;
  saving: boolean;
  formError: string | null;
  title: string;
  description: string;
  severity: AlertSeverity;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setSeverity: (value: AlertSeverity) => void;
  onCreate: () => void;
  onSync: () => void;
  onOpenAlert: (alert: EmergencyAlert) => void;
}

export function useAlertsScreen(): AlertsScreenViewModel {
  const alerts = useAlertsStore((state) => state.alerts);
  const pendingCount = useAlertsStore((state) => state.outbox.length);
  const formError = useAlertsStore((state) => state.formError);
  const syncing = useAlertsStore((state) => state.syncing);
  const createAlert = useAlertsStore((state) => state.createAlert);
  const syncOutbox = useAlertsStore((state) => state.syncOutbox);
  const focusAlert = useMapFocusStore((state) => state.focusAlert);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [saving, setSaving] = useState(false);

  const onCreate = useCallback(() => {
    setSaving(true);
    void createAlert({ title, description, severity })
      .then((saved) => {
        if (saved) {
          setTitle('');
          setDescription('');
        }
      })
      .finally(() => {
        setSaving(false);
      });
  }, [createAlert, description, severity, title]);

  const onSync = useCallback(() => {
    void syncOutbox();
  }, [syncOutbox]);

  const onOpenAlert = useCallback(
    (alert: EmergencyAlert) => {
      if (!alert.coordinate) {
        return;
      }

      focusAlert(alert.id);
    },
    [focusAlert],
  );

  return {
    alerts,
    pendingCount,
    syncing,
    saving,
    formError,
    title,
    description,
    severity,
    setTitle,
    setDescription,
    setSeverity,
    onCreate,
    onSync,
    onOpenAlert,
  };
}

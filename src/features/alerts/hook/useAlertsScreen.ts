import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { AlertSeverity, AlertSituation, EmergencyAlert } from '../types/alert.types';
import { useAlertsStore } from '../store/useAlertsStore';
import { useMapFocusStore } from '../../map/store/useMapFocusStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { canJoinTopic } from '../domain/topicAccess';
import { identityService } from '../../../services/identity/identityService';

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
  onOpenTopic: (alert: EmergencyAlert) => void;
  onDeleteAlert: (alert: EmergencyAlert) => void;
  canOpenTopic: (alert: EmergencyAlert) => boolean;
  canDeleteAlert: (alert: EmergencyAlert) => boolean;
  adminUnlocked: boolean;
  adminError: string | null;
  codeOpen: boolean;
  onAdminPress: () => void;
  onCloseCode: () => void;
  onSubmitCode: (code: string) => void;
  situationFilter: AlertSituation | 'all';
  situationCounts: Record<AlertSituation, number>;
  setSituationFilter: (filter: AlertSituation | 'all') => void;
}

export function useAlertsScreen(): AlertsScreenViewModel {
  const alerts = useAlertsStore((state) => state.alerts);
  const pendingCount = useAlertsStore((state) => state.outbox.length);
  const formError = useAlertsStore((state) => state.formError);
  const syncing = useAlertsStore((state) => state.syncing);
  const createAlert = useAlertsStore((state) => state.createAlert);
  const deleteAlert = useAlertsStore((state) => state.deleteAlert);
  const syncOutbox = useAlertsStore((state) => state.syncOutbox);
  const focusAlert = useMapFocusStore((state) => state.focusAlert);
  const openTopic = useMapFocusStore((state) => state.openTopic);
  const adminUnlocked = useAdminStore((state) => state.unlocked);
  const adminError = useAdminStore((state) => state.error);
  const unlock = useAdminStore((state) => state.unlock);
  const lock = useAdminStore((state) => state.lock);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<AlertSeverity>('warning');
  const [saving, setSaving] = useState(false);
  const [codeOpen, setCodeOpen] = useState(false);
  const [situationFilter, setSituationFilter] = useState<AlertSituation | 'all'>('open');

  const situationCounts = useMemo(() => {
    const counts: Record<AlertSituation, number> = { open: 0, attending: 0, closed: 0 };
    for (const alert of alerts) {
      counts[alert.situation ?? 'open'] += 1;
    }
    return counts;
  }, [alerts]);

  const visibleAlerts = adminUnlocked
    ? alerts.filter((alert) => situationFilter === 'all' || (alert.situation ?? 'open') === situationFilter)
    : alerts;
  const identityId = identityService.current()?.id ?? null;

  const canOpenTopic = useCallback(
    (alert: EmergencyAlert) =>
      canJoinTopic({
        reporterId: alert.reporterId,
        identityId,
        isAdmin: adminUnlocked,
      }),
    [adminUnlocked, identityId],
  );

  const canDelete = useCallback(
    (alert: EmergencyAlert) =>
      canJoinTopic({
        reporterId: alert.reporterId,
        identityId,
        isAdmin: false,
      }),
    [identityId],
  );

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

  const onOpenTopic = useCallback(
    (alert: EmergencyAlert) => {
      if (!canOpenTopic(alert)) {
        return;
      }

      openTopic(alert.id);
    },
    [canOpenTopic, openTopic],
  );

  const onAdminPress = useCallback(() => {
    if (adminUnlocked) {
      lock();
      return;
    }

    useAdminStore.setState({ error: null });
    setCodeOpen(true);
  }, [adminUnlocked, lock]);

  const onCloseCode = useCallback(() => {
    setCodeOpen(false);
  }, []);

  const onSubmitCode = useCallback(
    (code: string) => {
      if (unlock(code)) {
        setCodeOpen(false);
      }
    },
    [unlock],
  );

  const onDeleteAlert = useCallback(
    (alert: EmergencyAlert) => {
      if (!canDelete(alert)) {
        return;
      }

      Alert.alert('Apagar alerta', `Apagar "${alert.title}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => deleteAlert(alert.id) },
      ]);
    },
    [canDelete, deleteAlert],
  );

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
    alerts: visibleAlerts,
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
    onOpenTopic,
    onDeleteAlert,
    canOpenTopic,
    canDeleteAlert: canDelete,
    adminUnlocked,
    adminError,
    codeOpen,
    onAdminPress,
    onCloseCode,
    onSubmitCode,
    situationFilter,
    situationCounts,
    setSituationFilter,
  };
}

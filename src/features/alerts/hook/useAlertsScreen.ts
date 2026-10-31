import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import type { AlertSeverity, AlertSituation, EmergencyAlert } from '../types/alert.types';
import { useAlertsStore } from '../store/useAlertsStore';
import { useMapFocusStore } from '../../map/store/useMapFocusStore';
import { useAdminStore } from '../../admin/store/useAdminStore';
import { canJoinTopic } from '../domain/topicAccess';
import { identityService, type DeviceIdentity } from '../../../services/identity/identityService';

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
  shortCode: string | null;
  recoverOpen: boolean;
  recoverError: string | null;
  onOpenRecover: () => void;
  onCloseRecover: () => void;
  onSubmitRecover: (code: string) => void;
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
  const [recoverOpen, setRecoverOpen] = useState(false);
  const [recoverError, setRecoverError] = useState<string | null>(null);
  const [identity, setIdentity] = useState<DeviceIdentity | null>(() => identityService.current());
  const [situationFilter, setSituationFilter] = useState<AlertSituation | 'all'>('open');

  useEffect(() => {
    void identityService.prepare().then(() => {
      setIdentity(identityService.current());
    });
  }, []);

  const identityId = identity?.id ?? null;

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
          setIdentity(identityService.current());
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

  const onSubmitRecover = useCallback(
    (code: string) => {
      void identityService
        .restore(code)
        .then((restored) => {
          setIdentity(restored);
          setRecoverError(null);
          setRecoverOpen(false);
          void syncOutbox();
        })
        .catch((error: unknown) => {
          const message = error instanceof Error ? error.message : 'Não foi possível recuperar o código.';
          setRecoverError(message);
        });
    },
    [syncOutbox],
  );

  const onSubmitCode = useCallback(
    (code: string) => {
      void unlock(code).then((accepted) => {
        if (accepted) {
          setCodeOpen(false);
          void syncOutbox();
        }
      });
    },
    [syncOutbox, unlock],
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

  const onCloseCode = useCallback(() => {
    setCodeOpen(false);
  }, []);

  const onOpenRecover = useCallback(() => {
    setRecoverError(null);
    setRecoverOpen(true);
  }, []);

  const onCloseRecover = useCallback(() => {
    setRecoverOpen(false);
  }, []);

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
    shortCode: identity?.shortCode ?? null,
    recoverOpen,
    recoverError,
    onOpenRecover,
    onCloseRecover,
    onSubmitRecover,
    situationFilter,
    situationCounts,
    setSituationFilter,
  };
}

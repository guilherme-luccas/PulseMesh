import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AlertsSnapshot, CreateAlertInput } from '../types/alert.types';
import { alertsService } from '../../../services/alerts/alertsService';
import { mmkvStateStorage } from '../../../services/database/mmkvStorage';

interface AlertsStoreState extends AlertsSnapshot {
  error: string | null;
  hydrate: () => void;
  createAlert: (input: CreateAlertInput) => boolean;
  syncOutbox: () => Promise<void>;
}

type PersistedAlertsState = Pick<AlertsStoreState, 'alerts' | 'outbox'>;

function applySnapshot(snapshot: AlertsSnapshot): Pick<AlertsStoreState, 'alerts' | 'outbox' | 'error'> {
  return {
    alerts: snapshot.alerts,
    outbox: snapshot.outbox,
    error: null,
  };
}

export const useAlertsStore = create<AlertsStoreState>()(
  persist(
    (set) => ({
      alerts: [],
      outbox: [],
      error: null,
      hydrate: () => {
        set(applySnapshot(alertsService.list()));
      },
      createAlert: (input) => {
        try {
          set(applySnapshot(alertsService.createAlert(input)));
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Não foi possível salvar o alerta.';
          set({ error: message });
          return false;
        }
      },
      syncOutbox: async () => {
        set(applySnapshot(await alertsService.syncOutbox()));
      },
    }),
    {
      name: 'pulsemesh.alerts-store',
      storage: createJSONStorage(() => mmkvStateStorage),
      partialize: (state): PersistedAlertsState => ({
        alerts: state.alerts,
        outbox: state.outbox,
      }),
      onRehydrateStorage: () => () => {
        useAlertsStore.getState().hydrate();
      },
    },
  ),
);

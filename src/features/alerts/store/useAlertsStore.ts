import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AlertsSnapshot, CreateAlertInput } from '../types/alert.types';
import { alertsService, normalizeCreateAlert } from '../../../services/alerts/alertsService';
import { useConnectivityStore } from '../../connectivity/store/useConnectivityStore';
import { connectivityService } from '../../../services/connectivity/connectivityService';
import { locationService } from '../../../services/location/locationService';
import { mmkvStateStorage } from '../../../services/database/mmkvStorage';

interface AlertsStoreState extends AlertsSnapshot {
  formError: string | null;
  syncMessage: string | null;
  syncing: boolean;
  hydrate: () => void;
  createAlert: (input: CreateAlertInput) => Promise<boolean>;
  syncOutbox: () => Promise<void>;
}

type PersistedAlertsState = Pick<AlertsStoreState, 'alerts' | 'outbox'>;

let syncTask: Promise<void> | null = null;

export const useAlertsStore = create<AlertsStoreState>()(
  persist(
    (set) => ({
      alerts: [],
      outbox: [],
      formError: null,
      syncMessage: null,
      syncing: false,
      hydrate: () => {
        const snapshot = alertsService.list();
        set({ alerts: snapshot.alerts, outbox: snapshot.outbox });
      },
      createAlert: async (input) => {
        let draft: CreateAlertInput;
        try {
          draft = normalizeCreateAlert(input);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Não foi possível salvar o alerta.';
          set({ formError: message });
          return false;
        }

        const coordinate = await locationService.current();

        try {
          const snapshot = alertsService.createAlert({
            ...draft,
            coordinate: coordinate ?? undefined,
          });
          set({ alerts: snapshot.alerts, outbox: snapshot.outbox, formError: null });
          if (connectivityService.status() === 'online') {
            void useAlertsStore.getState().syncOutbox();
          }
          return true;
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Não foi possível salvar o alerta.';
          set({ formError: message });
          return false;
        }
      },
      syncOutbox: () => {
        if (syncTask) {
          return syncTask;
        }

        syncTask = (async () => {
          set({ syncing: true });
          try {
            const status = await connectivityService.refresh();
            useConnectivityStore.getState().setStatus(status, { react: false });
            const result = await alertsService.syncOutbox();
            set({
              alerts: result.snapshot.alerts,
              outbox: result.snapshot.outbox,
              syncMessage: result.message,
            });
          } catch {
            set({ syncMessage: 'Não foi possível sincronizar a fila.' });
          } finally {
            set({ syncing: false });
            syncTask = null;
          }
        })();

        return syncTask;
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

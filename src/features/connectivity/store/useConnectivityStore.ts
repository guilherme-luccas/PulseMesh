import { create } from 'zustand';
import { planSync } from '../domain/connectivityDomain';
import type { ConnectivityStatus } from '../types/connectivity.types';
import { useAlertsStore } from '../../alerts/store/useAlertsStore';
import { connectivityService } from '../../../services/connectivity/connectivityService';

interface ConnectivityStoreState {
  status: ConnectivityStatus;
  start: () => void;
  setStatus: (status: ConnectivityStatus, options?: { react?: boolean }) => void;
}

let listening = false;
let booted = false;

export const useConnectivityStore = create<ConnectivityStoreState>()((set, get) => ({
  status: 'unknown',
  start: () => {
    if (listening) {
      return;
    }

    listening = true;
    connectivityService.subscribe((status) => {
      get().setStatus(status);
    });

    const boot = () => {
      if (booted) {
        return;
      }

      booted = true;
      useAlertsStore.getState().hydrate();
      const status = connectivityService.status();
      get().setStatus(status, { react: false });
      if (status === 'online' && useAlertsStore.getState().outbox.length > 0) {
        void useAlertsStore.getState().syncOutbox();
      }
    };

    void connectivityService.refresh().then(() => {
      const unsubscribe = useAlertsStore.persist.onFinishHydration(boot);
      if (useAlertsStore.persist.hasHydrated()) {
        boot();
        unsubscribe();
      }
    });
  },
  setStatus: (status, options) => {
    const previous = get().status;
    connectivityService.remember(status);
    if (previous !== status) {
      set({ status });
    }

    if (options?.react === false || previous === status) {
      return;
    }

    const pendingCount = useAlertsStore.getState().outbox.length;
    if (planSync(previous, status, pendingCount) === 'flush') {
      void useAlertsStore.getState().syncOutbox();
    }
  },
}));

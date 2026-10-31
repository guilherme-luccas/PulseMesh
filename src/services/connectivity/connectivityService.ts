import * as Network from 'expo-network';
import { resolveConnectivityStatus } from '../../features/connectivity/domain/connectivityDomain';
import type { ConnectivityStatus } from '../../features/connectivity/types/connectivity.types';

let current: ConnectivityStatus = 'unknown';

export const connectivityService = {
  status(): ConnectivityStatus {
    return current;
  },

  remember(status: ConnectivityStatus): void {
    current = status;
  },

  async refresh(): Promise<ConnectivityStatus> {
    const state = await Network.getNetworkStateAsync();
    current = resolveConnectivityStatus(state);
    return current;
  },

  subscribe(listener: (status: ConnectivityStatus) => void): () => void {
    const subscription = Network.addNetworkStateListener((state) => {
      current = resolveConnectivityStatus(state);
      listener(current);
    });

    return () => {
      subscription.remove();
    };
  },
};

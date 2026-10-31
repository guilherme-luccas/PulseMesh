export type ConnectivityStatus = 'unknown' | 'online' | 'offline';

export type SyncPlan = 'flush' | 'skip';

export interface NetworkSnapshot {
  isConnected?: boolean;
  isInternetReachable?: boolean | null;
}

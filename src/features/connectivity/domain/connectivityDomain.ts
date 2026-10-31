import type { ConnectivityStatus, NetworkSnapshot, SyncPlan } from '../types/connectivity.types';

export function resolveConnectivityStatus(state: NetworkSnapshot): Exclude<ConnectivityStatus, 'unknown'> {
  if (state.isConnected !== true) {
    return 'offline';
  }

  if (state.isInternetReachable === false) {
    return 'offline';
  }

  return 'online';
}

export function planSync(previous: ConnectivityStatus, next: ConnectivityStatus, pendingCount: number): SyncPlan {
  if (next !== 'online' || pendingCount === 0 || previous === 'online') {
    return 'skip';
  }

  return 'flush';
}

function assertCheck(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runConnectivityDomainCheck(): void {
  assertCheck(resolveConnectivityStatus({ isConnected: false }) === 'offline', 'disconnected is offline');
  assertCheck(
    resolveConnectivityStatus({ isConnected: true, isInternetReachable: false }) === 'offline',
    'captive network is offline',
  );
  assertCheck(resolveConnectivityStatus({ isConnected: true }) === 'online', 'connected is online');
  assertCheck(planSync('unknown', 'online', 2) === 'flush', 'opening online flushes the queue');
  assertCheck(planSync('offline', 'online', 1) === 'flush', 'reconnect flushes the queue');
  assertCheck(planSync('online', 'online', 2) === 'skip', 'staying online does not flush again');
  assertCheck(planSync('offline', 'online', 0) === 'skip', 'empty queue does not flush');
  assertCheck(planSync('online', 'offline', 2) === 'skip', 'going offline does not flush');
}

const checkEnv = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;

if (checkEnv?.PULSEMESH_CHECK === '1') {
  runConnectivityDomainCheck();
  console.log('connectivityDomain ok');
}

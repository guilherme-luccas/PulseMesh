import { Text, View } from 'react-native';
import { useAlertsStore } from '../../alerts/store/useAlertsStore';
import { useConnectivityStore } from '../store/useConnectivityStore';
import { connectivityStyles } from '../styles/connectivity.styles';
import type { ConnectivityStatus } from '../types/connectivity.types';

function bannerLabel(status: ConnectivityStatus, syncing: boolean, syncMessage: string | null): string {
  if (status === 'unknown') {
    return 'Verificando conexão';
  }

  if (status === 'offline') {
    return 'Offline. A fila fica neste aparelho.';
  }

  if (syncing) {
    return 'Online. Enviando a fila.';
  }

  return syncMessage ?? 'Online.';
}

export function ConnectivityBanner() {
  const status = useConnectivityStore((state) => state.status);
  const syncing = useAlertsStore((state) => state.syncing);
  const syncMessage = useAlertsStore((state) => state.syncMessage);
  const offline = status === 'offline';

  return (
    <View
      style={[connectivityStyles.banner, offline ? connectivityStyles.offline : connectivityStyles.online]}
      accessibilityRole="text"
      accessibilityLabel={bannerLabel(status, syncing, syncMessage)}
    >
      <Text style={connectivityStyles.text}>{bannerLabel(status, syncing, syncMessage)}</Text>
    </View>
  );
}

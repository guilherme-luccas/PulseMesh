import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectivityBanner } from '../../connectivity/components/ConnectivityBanner';
import { AlertCard } from '../components/AlertCard';
import { AlertComposer } from '../components/AlertComposer';
import { useAlertsScreen } from '../hook/useAlertsScreen';
import { alertsStyles } from '../styles/alerts.styles';

export function AlertsScreen() {
  const {
    alerts,
    pendingCount,
    syncing,
    formError,
    saving,
    title,
    description,
    severity,
    setTitle,
    setDescription,
    setSeverity,
    onCreate,
    onSync,
    onOpenAlert,
  } = useAlertsScreen();

  const syncDisabled = syncing || pendingCount === 0;

  return (
    <SafeAreaView style={alertsStyles.screen} edges={['top']}>
      <View style={alertsStyles.header}>
        <Text style={alertsStyles.title}>PulseMesh</Text>
        <Text style={alertsStyles.subtitle}>
          Alertas ficam neste aparelho. Com rede, a fila tenta sair sozinha.
        </Text>
        <ConnectivityBanner />
        <View style={alertsStyles.syncRow}>
          <Text style={alertsStyles.pending}>
            {pendingCount === 1 ? '1 alerta na fila' : `${pendingCount} alertas na fila`}
          </Text>
          <Pressable
            onPress={onSync}
            disabled={syncDisabled}
            style={[alertsStyles.syncButton, syncDisabled ? alertsStyles.syncButtonDisabled : null]}
            accessibilityRole="button"
            accessibilityLabel="Sincronizar fila"
            accessibilityState={{ disabled: syncDisabled }}
          >
            <Text style={alertsStyles.syncButtonText}>{syncing ? 'Sincronizando' : 'Sincronizar'}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alertsStyles.list}
        renderItem={({ item }) => <AlertCard alert={item} onOpen={onOpenAlert} />}
        ListEmptyComponent={<Text style={alertsStyles.empty}>Nenhum alerta salvo neste aparelho.</Text>}
      />

      <AlertComposer
        title={title}
        description={description}
        severity={severity}
        error={formError}
        saving={saving}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onChangeSeverity={setSeverity}
        onSubmit={onCreate}
      />
    </SafeAreaView>
  );
}

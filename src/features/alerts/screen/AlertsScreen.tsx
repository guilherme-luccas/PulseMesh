import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertCard } from '../components/AlertCard';
import { AlertComposer } from '../components/AlertComposer';
import { useAlertsScreen } from '../hook/useAlertsScreen';
import { alertsStyles } from '../styles/alerts.styles';
import type { EmergencyAlert } from '../types/alert.types';

export function AlertsScreen() {
  const {
    alerts,
    pendingCount,
    syncing,
    error,
    title,
    description,
    severity,
    setTitle,
    setDescription,
    setSeverity,
    onCreate,
    onSync,
  } = useAlertsScreen();

  const syncDisabled = syncing || pendingCount === 0;

  return (
    <SafeAreaView style={alertsStyles.screen} edges={['top', 'bottom']}>
      <View style={alertsStyles.header}>
        <Text style={alertsStyles.title}>PulseMesh</Text>
        <Text style={alertsStyles.subtitle}>
          Alertas ficam neste aparelho e entram na fila até a sincronização.
        </Text>
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
        renderItem={renderAlert}
        ListEmptyComponent={<Text style={alertsStyles.empty}>Nenhum alerta salvo neste aparelho.</Text>}
      />

      <AlertComposer
        title={title}
        description={description}
        severity={severity}
        error={error}
        onChangeTitle={setTitle}
        onChangeDescription={setDescription}
        onChangeSeverity={setSeverity}
        onSubmit={onCreate}
      />
    </SafeAreaView>
  );
}

function renderAlert({ item }: { item: EmergencyAlert }) {
  return <AlertCard alert={item} />;
}

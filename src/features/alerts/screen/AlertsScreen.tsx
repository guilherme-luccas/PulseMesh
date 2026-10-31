import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectivityBanner } from '../../connectivity/components/ConnectivityBanner';
import { AdminCodeSheet } from '../../admin/components/AdminCodeSheet';
import { AlertCard } from '../components/AlertCard';
import { AlertComposer } from '../components/AlertComposer';
import { AdminQueueBar } from '../components/AdminQueueBar';
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
    onOpenTopic,
    canOpenTopic,
    adminUnlocked,
    adminError,
    codeOpen,
    onAdminPress,
    onCloseCode,
    onSubmitCode,
    situationFilter,
    situationCounts,
    setSituationFilter,
  } = useAlertsScreen();

  const syncDisabled = syncing || pendingCount === 0;

  return (
    <SafeAreaView style={alertsStyles.screen} edges={['top']}>
      <View style={alertsStyles.header}>
        <View style={alertsStyles.titleRow}>
          <Text style={alertsStyles.title}>PulseMesh</Text>
          <Pressable
            onPress={onAdminPress}
            style={[alertsStyles.adminButton, adminUnlocked ? alertsStyles.adminButtonActive : null]}
            accessibilityRole="button"
            accessibilityLabel={adminUnlocked ? 'Sair do modo admin' : 'Entrar como admin'}
          >
            <Text style={[alertsStyles.adminButtonText, adminUnlocked ? alertsStyles.adminButtonTextActive : null]}>
              {adminUnlocked ? 'Sair' : 'Admin'}
            </Text>
          </Pressable>
        </View>
        <Text style={alertsStyles.subtitle}>
          {adminUnlocked
            ? 'Modo operação. Os alertas abaixo são a fila para atendimento.'
            : 'Alertas ficam neste aparelho. Com rede, a fila tenta sair sozinha.'}
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
            accessibilityState={{ disabled: syncDisabled, busy: syncing }}
          >
            {syncing ? <ActivityIndicator size="small" color="#D7F5EA" /> : null}
            <Text style={alertsStyles.syncButtonText}>{syncing ? 'Sincronizando' : 'Sincronizar'}</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alertsStyles.list}
        renderItem={({ item }) => (
          <AlertCard
            alert={item}
            showSituation={adminUnlocked}
            showTopic={canOpenTopic(item)}
            onOpen={onOpenAlert}
            onOpenTopic={onOpenTopic}
          />
        )}
        ListEmptyComponent={
          <Text style={alertsStyles.empty}>
            {adminUnlocked ? 'Nenhum alerta neste status.' : 'Nenhum alerta salvo neste aparelho.'}
          </Text>
        }
      />

      {adminUnlocked ? (
        <AdminQueueBar filter={situationFilter} counts={situationCounts} onChange={setSituationFilter} />
      ) : (
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
      )}
      {codeOpen ? (
        <AdminCodeSheet visible error={adminError} onClose={onCloseCode} onSubmit={onSubmitCode} />
      ) : null}
    </SafeAreaView>
  );
}

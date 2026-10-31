import { ActivityIndicator, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectivityBanner } from '../../connectivity/components/ConnectivityBanner';
import { AdminCodeSheet } from '../../admin/components/AdminCodeSheet';
import { AlertCard } from '../components/AlertCard';
import { AlertComposer } from '../components/AlertComposer';
import { AdminQueueBar } from '../components/AdminQueueBar';
import { useAlertsScreen } from '../hook/useAlertsScreen';
import { useAlertsStyles } from '../styles/alerts.styles';
import { useThemeColors } from '../../../theme/useThemeColors';

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
    onDeleteAlert,
    canOpenTopic,
    canDeleteAlert,
    adminUnlocked,
    adminError,
    codeOpen,
    onAdminPress,
    onCloseCode,
    onSubmitCode,
    shortCode,
    recoverOpen,
    recoverError,
    onOpenRecover,
    onCloseRecover,
    onSubmitRecover,
    situationFilter,
    situationCounts,
    setSituationFilter,
  } = useAlertsScreen();
  const alertsStyles = useAlertsStyles();
  const colors = useThemeColors();

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
            : shortCode
              ? `Seu código ${shortCode}. Ele recupera esta pessoa se o app for reinstalado.`
              : 'Recupere seu código se este aparelho já criou alertas.'}
        </Text>
        {adminUnlocked ? null : (
          <Pressable onPress={onOpenRecover} accessibilityRole="button" accessibilityLabel="Recuperar código">
            <Text style={alertsStyles.pending}>Recuperar código</Text>
          </Pressable>
        )}
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
            {syncing ? <ActivityIndicator size="small" color={colors.onSync} /> : null}
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
            showTopic={canOpenTopic(item)}
            canDelete={canDeleteAlert(item)}
            onOpen={onOpenAlert}
            onOpenTopic={onOpenTopic}
            onDelete={onDeleteAlert}
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
      {recoverOpen ? (
        <AdminCodeSheet
          visible
          error={recoverError}
          title="Recuperar pessoa"
          hint="Use o código de 4 letras deste aparelho. Os alertas antigos voltam a ser seus."
          submitLabel="Recuperar"
          onClose={onCloseRecover}
          onSubmit={onSubmitRecover}
        />
      ) : null}
    </SafeAreaView>
  );
}

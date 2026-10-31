import { Pressable, Text, View } from 'react-native';
import { ALERT_SEVERITY_LABEL, ALERT_SITUATION_LABEL, type EmergencyAlert } from '../types/alert.types';
import { SEVERITY_COLOR, SITUATION_COLOR, alertsStyles } from '../styles/alerts.styles';

interface AlertCardProps {
  alert: EmergencyAlert;
  onOpen: (alert: EmergencyAlert) => void;
  onOpenTopic: (alert: EmergencyAlert) => void;
  onDelete: (alert: EmergencyAlert) => void;
  showTopic?: boolean;
  canDelete?: boolean;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
}

export function AlertCard({ alert, onOpen, onOpenTopic, onDelete, showTopic = true, canDelete = false }: AlertCardProps) {
  const color = SEVERITY_COLOR[alert.severity];
  const situation = alert.situation ?? 'open';
  const situationColor = SITUATION_COLOR[situation];
  const statusLabel = alert.syncStatus === 'pending' ? 'Na fila' : 'Sincronizado';
  const hasPlace = Boolean(alert.coordinate);

  return (
    <View style={alertsStyles.card}>
      <Pressable
        disabled={!hasPlace}
        onPress={() => onOpen(alert)}
        accessibilityRole={hasPlace ? 'button' : undefined}
        accessibilityLabel={hasPlace ? `Abrir ${alert.title} no mapa` : alert.title}
      >
        <View style={alertsStyles.cardTop}>
          <Text style={alertsStyles.cardTitle}>{alert.title}</Text>
          <View style={[alertsStyles.badge, { backgroundColor: color }]}>
            <Text style={alertsStyles.badgeText}>{ALERT_SEVERITY_LABEL[alert.severity]}</Text>
          </View>
        </View>
        {alert.description ? <Text style={alertsStyles.cardDescription}>{alert.description}</Text> : null}
        <Text style={alertsStyles.cardMeta}>
          {formatCreatedAt(alert.createdAt)} · {statusLabel}
          {alert.coordinate ? ' · No mapa' : ' · Sem local'}
          {alert.reporterCode ? ` · ${alert.reporterCode}` : ''}
        </Text>
      </Pressable>
      {showTopic || situation !== 'open' || canDelete ? (
        <View style={alertsStyles.topicRow}>
          {showTopic ? (
            <Pressable
              onPress={() => onOpenTopic(alert)}
              accessibilityRole="button"
              accessibilityLabel={`Abrir conversa de ${alert.title}`}
            >
              <Text style={alertsStyles.topicLinkText}>Conversa</Text>
            </Pressable>
          ) : null}
          {canDelete ? (
            <Pressable
              onPress={() => onDelete(alert)}
              accessibilityRole="button"
              accessibilityLabel={`Apagar ${alert.title}`}
            >
              <Text style={alertsStyles.deleteLinkText}>Apagar</Text>
            </Pressable>
          ) : null}
          {situation === 'open' ? null : (
            <View style={[alertsStyles.badge, { backgroundColor: situationColor.background }]}>
              <Text style={[alertsStyles.badgeText, { color: situationColor.text }]}>
                {ALERT_SITUATION_LABEL[situation]}
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}

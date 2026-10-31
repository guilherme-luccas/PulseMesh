import { Pressable, Text, View } from 'react-native';
import { ALERT_SEVERITY_LABEL, ALERT_SITUATION_LABEL, type EmergencyAlert } from '../types/alert.types';
import { SEVERITY_COLOR, alertsStyles } from '../styles/alerts.styles';

interface AlertCardProps {
  alert: EmergencyAlert;
  onOpen: (alert: EmergencyAlert) => void;
  onOpenTopic: (alert: EmergencyAlert) => void;
  showSituation?: boolean;
  showTopic?: boolean;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
}

export function AlertCard({ alert, onOpen, onOpenTopic, showSituation = false, showTopic = true }: AlertCardProps) {
  const color = SEVERITY_COLOR[alert.severity];
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
          {showSituation ? ` · ${ALERT_SITUATION_LABEL[alert.situation ?? 'open']}` : ''}
        </Text>
      </Pressable>
      {showTopic ? (
        <Pressable
          onPress={() => onOpenTopic(alert)}
          style={alertsStyles.topicLink}
          accessibilityRole="button"
          accessibilityLabel={`Abrir tópico de ${alert.title}`}
        >
          <Text style={alertsStyles.topicLinkText}>Tópico</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

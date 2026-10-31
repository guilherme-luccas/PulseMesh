import { Text, View } from 'react-native';
import { ALERT_SEVERITY_LABEL, type EmergencyAlert } from '../types/alert.types';
import { SEVERITY_COLOR, alertsStyles } from '../styles/alerts.styles';

interface AlertCardProps {
  alert: EmergencyAlert;
}

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('pt-BR');
}

export function AlertCard({ alert }: AlertCardProps) {
  const color = SEVERITY_COLOR[alert.severity];
  const statusLabel = alert.syncStatus === 'pending' ? 'Na fila' : 'Sincronizado';

  return (
    <View style={alertsStyles.card}>
      <View style={alertsStyles.cardTop}>
        <Text style={alertsStyles.cardTitle}>{alert.title}</Text>
        <View style={[alertsStyles.badge, { backgroundColor: color }]}>
          <Text style={alertsStyles.badgeText}>{ALERT_SEVERITY_LABEL[alert.severity]}</Text>
        </View>
      </View>
      {alert.description ? <Text style={alertsStyles.cardDescription}>{alert.description}</Text> : null}
      <Text style={alertsStyles.cardMeta}>
        {formatCreatedAt(alert.createdAt)} · {statusLabel}
      </Text>
    </View>
  );
}

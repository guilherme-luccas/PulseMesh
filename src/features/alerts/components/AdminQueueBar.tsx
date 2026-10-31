import { Pressable, ScrollView, Text, View } from 'react-native';
import { ALERT_SITUATION_LABEL, type AlertSituation } from '../types/alert.types';
import { alertsStyles } from '../styles/alerts.styles';

interface AdminQueueBarProps {
  filter: AlertSituation | 'all';
  counts: Record<AlertSituation, number>;
  onChange: (filter: AlertSituation | 'all') => void;
}

const FILTERS: Array<AlertSituation | 'all'> = ['open', 'attending', 'closed', 'all'];

export function AdminQueueBar({ filter, counts, onChange }: AdminQueueBarProps) {
  const total = counts.open + counts.attending + counts.closed;

  return (
    <View style={alertsStyles.composer}>
      <Text style={alertsStyles.subtitle}>Filtre a fila e abra o tópico para responder ou dar baixa.</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={alertsStyles.queueRow}
      >
        {FILTERS.map((item) => {
          const selected = filter === item;
          const count = item === 'all' ? total : counts[item];
          const label = item === 'all' ? 'Todos' : ALERT_SITUATION_LABEL[item];
          return (
            <Pressable
              key={item}
              onPress={() => onChange(item)}
              style={[alertsStyles.severityChip, selected ? alertsStyles.adminButtonActive : null]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}, ${count}`}
            >
              <Text style={[alertsStyles.severityChipText, selected ? alertsStyles.adminButtonTextActive : null]}>
                {label} {count}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

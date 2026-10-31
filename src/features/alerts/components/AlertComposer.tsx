import { Pressable, Text, TextInput, View } from 'react-native';
import {
  ALERT_SEVERITIES,
  ALERT_SEVERITY_LABEL,
  type AlertSeverity,
} from '../types/alert.types';
import { SEVERITY_COLOR, alertsStyles } from '../styles/alerts.styles';

interface AlertComposerProps {
  title: string;
  description: string;
  severity: AlertSeverity;
  error: string | null;
  saving: boolean;
  onChangeTitle: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onChangeSeverity: (value: AlertSeverity) => void;
  onSubmit: () => void;
}

export function AlertComposer({
  title,
  description,
  severity,
  error,
  saving,
  onChangeTitle,
  onChangeDescription,
  onChangeSeverity,
  onSubmit,
}: AlertComposerProps) {
  return (
    <View style={alertsStyles.composer}>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Título do alerta"
        placeholderTextColor="#7E9088"
        style={alertsStyles.input}
        accessibilityLabel="Título do alerta"
      />
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder="O que está acontecendo?"
        placeholderTextColor="#7E9088"
        style={[alertsStyles.input, alertsStyles.inputMultiline]}
        multiline
        accessibilityLabel="Descrição do alerta"
      />
      <View style={alertsStyles.severityRow}>
        {ALERT_SEVERITIES.map((option) => {
          const selected = option === severity;
          return (
            <Pressable
              key={option}
              onPress={() => onChangeSeverity(option)}
              style={[
                alertsStyles.severityChip,
                selected ? { borderColor: SEVERITY_COLOR[option], backgroundColor: '#24332D' } : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={ALERT_SEVERITY_LABEL[option]}
            >
              <Text style={[alertsStyles.severityChipText, selected ? { color: SEVERITY_COLOR[option] } : null]}>
                {ALERT_SEVERITY_LABEL[option]}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? <Text style={alertsStyles.error}>{error}</Text> : null}
      <Pressable
        onPress={onSubmit}
        disabled={saving}
        style={[alertsStyles.submit, saving ? alertsStyles.syncButtonDisabled : null]}
        accessibilityRole="button"
        accessibilityLabel="Salvar alerta"
        accessibilityState={{ disabled: saving }}
      >
        <Text style={alertsStyles.submitText}>{saving ? 'Salvando' : 'Salvar alerta'}</Text>
      </Pressable>
    </View>
  );
}

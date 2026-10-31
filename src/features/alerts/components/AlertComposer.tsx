import { Pressable, Text, TextInput, View } from 'react-native';
import {
  ALERT_SEVERITIES,
  ALERT_SEVERITY_LABEL,
  type AlertSeverity,
} from '../types/alert.types';
import { useAlertsStyles } from '../styles/alerts.styles';
import { useThemeColors } from '../../../theme/useThemeColors';

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
  const alertsStyles = useAlertsStyles();
  const colors = useThemeColors();

  return (
    <View style={alertsStyles.composer}>
      <TextInput
        value={title}
        onChangeText={onChangeTitle}
        placeholder="Título do alerta"
        placeholderTextColor={colors.placeholder}
        style={alertsStyles.input}
        accessibilityLabel="Título do alerta"
      />
      <TextInput
        value={description}
        onChangeText={onChangeDescription}
        placeholder="O que está acontecendo?"
        placeholderTextColor={colors.placeholder}
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
                selected ? { borderColor: colors.severity[option], backgroundColor: colors.chipSelected } : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={ALERT_SEVERITY_LABEL[option]}
            >
              <Text style={[alertsStyles.severityChipText, selected ? { color: colors.severity[option] } : null]}>
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

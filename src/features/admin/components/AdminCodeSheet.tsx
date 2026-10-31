import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useState } from 'react';
import { adminStyles } from '../styles/admin.styles';

interface AdminCodeSheetProps {
  visible: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (code: string) => void;
}

export function AdminCodeSheet({ visible, error, onClose, onSubmit }: AdminCodeSheetProps) {
  const [code, setCode] = useState('');

  function submit() {
    onSubmit(code);
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={adminStyles.backdrop} onPress={onClose}>
        <Pressable style={adminStyles.sheet} onPress={() => undefined}>
          <Text style={adminStyles.title}>Código de acesso</Text>
          <Text style={adminStyles.hint}>A equipe de operação usa este código para assumir alertas.</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="Código"
            placeholderTextColor="#7E9088"
            style={adminStyles.input}
            accessibilityLabel="Código de admin"
          />
          {error ? <Text style={adminStyles.error}>{error}</Text> : null}
          <Pressable
            onPress={submit}
            style={adminStyles.submit}
            accessibilityRole="button"
            accessibilityLabel="Entrar como admin"
          >
            <Text style={adminStyles.submitText}>Entrar</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

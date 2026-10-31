import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAlertTopic } from '../hook/useAlertTopic';
import { useTopicStyles } from '../styles/alertTopic.styles';
import { useThemeColors } from '../../../theme/useThemeColors';
import type { AlertPost } from '../types/topic.types';
import { useMapFocusStore } from '../../map/store/useMapFocusStore';

interface AlertTopicScreenProps {
  alertId: string;
}

export function AlertTopicScreen({ alertId }: AlertTopicScreenProps) {
  const closeTopic = useMapFocusStore((state) => state.closeTopic);
  const {
    alert,
    posts,
    draft,
    error,
    unlocked,
    canPost,
    situations,
    events,
    situationLabel,
    setDraft,
    onPublish,
    onSituation,
  } = useAlertTopic(alertId);
  const topicStyles = useTopicStyles();
  const colors = useThemeColors();

  if (!alert) {
    return (
      <SafeAreaView style={topicStyles.screen} edges={['top']}>
        <View style={topicStyles.header}>
          <Pressable onPress={closeTopic} accessibilityRole="button" accessibilityLabel="Voltar">
            <Text style={topicStyles.back}>Voltar</Text>
          </Pressable>
          <Text style={topicStyles.title}>Alerta não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  const situation = alert.situation ?? 'open';

  return (
    <SafeAreaView style={topicStyles.screen} edges={['top']}>
      <View style={topicStyles.header}>
        <Pressable onPress={closeTopic} accessibilityRole="button" accessibilityLabel="Voltar">
          <Text style={topicStyles.back}>Voltar</Text>
        </Pressable>
        <Text style={topicStyles.title}>{alert.title}</Text>
        <Text style={topicStyles.meta}>
          {situationLabel[situation]}
          {alert.reporterCode ? ` · ${alert.reporterCode}` : ''}
          {alert.description ? `\n${alert.description}` : ''}
        </Text>
        {unlocked ? (
          <View style={topicStyles.situationRow}>
            {situations.map((item) => {
              const selected = situation === item;
              return (
                <Pressable
                  key={item}
                  onPress={() => onSituation(item)}
                  style={[topicStyles.situationChip, selected ? topicStyles.situationChipSelected : null]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={situationLabel[item]}
                >
                  <Text style={[topicStyles.situationText, selected ? topicStyles.situationTextSelected : null]}>
                    {situationLabel[item]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        {events.length > 0 ? (
          <Text style={topicStyles.meta}>
            {events
              .map((event) => {
                const when = new Date(event.createdAt);
                const clock = Number.isNaN(when.getTime()) ? event.createdAt : when.toLocaleString('pt-BR');
                return `${situationLabel[event.situation]} · ${clock}`;
              })
              .join('\n')}
          </Text>
        ) : null}
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={topicStyles.list}
        renderItem={({ item }) => <PostItem item={item} />}
        ListEmptyComponent={<Text style={topicStyles.empty}>Nenhuma mensagem nesta conversa.</Text>}
      />

      {canPost ? (
        <View style={topicStyles.composer}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={unlocked ? 'Resposta da operação' : 'Escreva na conversa'}
            placeholderTextColor={colors.placeholder}
            style={topicStyles.input}
            multiline
            accessibilityLabel="Mensagem da conversa"
          />
          {error ? <Text style={topicStyles.error}>{error}</Text> : null}
          <Pressable onPress={onPublish} style={topicStyles.submit} accessibilityRole="button" accessibilityLabel="Publicar">
            <Text style={topicStyles.submitText}>Publicar</Text>
          </Pressable>
        </View>
      ) : (
        <View style={topicStyles.composer}>
          <Text style={topicStyles.meta}>Só quem criou este alerta pode escrever aqui.</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

function PostItem({ item }: { item: AlertPost }) {
  const topicStyles = useTopicStyles();
  const createdAt = new Date(item.createdAt);
  const when = Number.isNaN(createdAt.getTime()) ? item.createdAt : createdAt.toLocaleString('pt-BR');

  return (
    <View style={topicStyles.post}>
      <Text style={topicStyles.postAuthor}>{item.authorRole === 'admin' ? 'Admin' : 'Morador'}</Text>
      <Text style={topicStyles.postBody}>{item.body}</Text>
      <Text style={topicStyles.postTime}>{when}</Text>
    </View>
  );
}

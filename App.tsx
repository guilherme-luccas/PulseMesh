import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from './src/theme/useThemeColors';
import type { ThemeColors } from './src/theme/colors';
import { AlertsScreen } from './src/features/alerts/screen/AlertsScreen';
import { AlertTopicScreen } from './src/features/alerts/screen/AlertTopicScreen';
import { useConnectivity } from './src/features/connectivity/hook/useConnectivity';
import { MapScreen } from './src/features/map/screen/MapScreen';
import { useMapFocusStore } from './src/features/map/store/useMapFocusStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const tab = useMapFocusStore((state) => state.tab);
  const topicAlertId = useMapFocusStore((state) => state.topicAlertId);
  const setTab = useMapFocusStore((state) => state.setTab);
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  useConnectivity();

  return (
    <View style={styles.root}>
      <View style={styles.body}>
        {topicAlertId ? (
          <AlertTopicScreen alertId={topicAlertId} />
        ) : tab === 'alerts' ? (
          <AlertsScreen />
        ) : (
          <MapScreen />
        )}
      </View>
      {topicAlertId ? null : (
        <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TabButton label="Alertas" selected={tab === 'alerts'} onPress={() => setTab('alerts')} styles={styles} />
          <TabButton label="Mapa" selected={tab === 'map'} onPress={() => setTab('map')} styles={styles} />
        </View>
      )}
    </View>
  );
}

function TabButton({
  label,
  selected,
  onPress,
  styles,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
    >
      <Text style={[styles.tabText, selected ? styles.tabTextSelected : null]}>{label}</Text>
    </Pressable>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.screen,
    },
    body: {
      flex: 1,
    },
    tabs: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.divider,
      backgroundColor: colors.screen,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    tabText: {
      color: colors.meta,
      fontSize: 14,
      fontWeight: '700',
    },
    tabTextSelected: {
      color: colors.accent,
    },
  });
}

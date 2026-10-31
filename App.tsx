import { Pressable, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AlertsScreen } from './src/features/alerts/screen/AlertsScreen';
import { useConnectivity } from './src/features/connectivity/hook/useConnectivity';
import { MapScreen } from './src/features/map/screen/MapScreen';
import { useMapFocusStore } from './src/features/map/store/useMapFocusStore';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppShell />
    </SafeAreaProvider>
  );
}

function AppShell() {
  const tab = useMapFocusStore((state) => state.tab);
  const setTab = useMapFocusStore((state) => state.setTab);
  const insets = useSafeAreaInsets();
  useConnectivity();

  return (
    <View style={styles.root}>
      <View style={styles.body}>{tab === 'alerts' ? <AlertsScreen /> : <MapScreen />}</View>
      <View style={[styles.tabs, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        <TabButton label="Alertas" selected={tab === 'alerts'} onPress={() => setTab('alerts')} />
        <TabButton label="Mapa" selected={tab === 'map'} onPress={() => setTab('map')} />
      </View>
    </View>
  );
}

function TabButton({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#101614',
  },
  body: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#24302B',
    backgroundColor: '#101614',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  tabText: {
    color: '#7E9088',
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextSelected: {
    color: '#E8F36A',
  },
});

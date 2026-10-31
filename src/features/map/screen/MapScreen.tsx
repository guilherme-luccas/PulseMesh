import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ConnectivityBanner } from '../../connectivity/components/ConnectivityBanner';
import { AlertsMap } from '../components/AlertsMap';
import { useMapScreen } from '../hook/useMapScreen';
import { useMapStyles } from '../styles/map.styles';

export function MapScreen() {
  const { alerts, camera, showUserLocation, locatedCount } = useMapScreen();
  const mapStyles = useMapStyles();

  return (
    <SafeAreaView style={mapStyles.screen} edges={['top']}>
      <View style={mapStyles.header}>
        <Text style={mapStyles.title}>Mapa</Text>
        <Text style={mapStyles.subtitle}>
          {locatedCount === 1 ? '1 alerta no mapa.' : `${locatedCount} alertas no mapa.`}
        </Text>
        <ConnectivityBanner />
      </View>
      <AlertsMap alerts={alerts} camera={camera} showUserLocation={showUserLocation} />
    </SafeAreaView>
  );
}

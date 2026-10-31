import { AppleMaps, GoogleMaps } from 'expo-maps';
import { useEffect, useMemo, useRef } from 'react';
import { Platform, Text } from 'react-native';
import { SEVERITY_COLOR } from '../../alerts/styles/alerts.styles';
import type { EmergencyAlert } from '../../alerts/types/alert.types';
import { mapStyles } from '../styles/map.styles';

interface AlertsMapProps {
  alerts: EmergencyAlert[];
  camera: { latitude: number; longitude: number; zoom: number };
  showUserLocation: boolean;
}

export function AlertsMap({ alerts, camera, showUserLocation }: AlertsMapProps) {
  const appleRef = useRef<AppleMaps.MapView>(null);
  const googleRef = useRef<GoogleMaps.MapView>(null);
  const skipInitialMove = useRef(true);
  const position = useMemo(
    () => ({
      coordinates: { latitude: camera.latitude, longitude: camera.longitude },
      zoom: camera.zoom,
    }),
    [camera.latitude, camera.longitude, camera.zoom],
  );

  useEffect(() => {
    if (skipInitialMove.current) {
      skipInitialMove.current = false;
      return;
    }

    const map = Platform.OS === 'ios' ? appleRef.current : googleRef.current;
    // ponytail: expo-maps rejects this if the native view is already gone (tab change). The prop sets the first camera.
    void map?.setCameraPosition(position).catch(() => undefined);
  }, [position]);

  if (Platform.OS === 'ios') {
    return (
      <AppleMaps.View
        ref={appleRef}
        style={mapStyles.map}
        cameraPosition={position}
        markers={toAppleMarkers(alerts)}
        colorScheme={AppleMaps.MapColorScheme.DARK}
        properties={{ isMyLocationEnabled: showUserLocation }}
        uiSettings={{ myLocationButtonEnabled: showUserLocation }}
      />
    );
  }

  if (Platform.OS === 'android') {
    return (
      <GoogleMaps.View
        ref={googleRef}
        style={mapStyles.map}
        cameraPosition={position}
        markers={toGoogleMarkers(alerts)}
        colorScheme={GoogleMaps.MapColorScheme.DARK}
        properties={{ isMyLocationEnabled: showUserLocation }}
        uiSettings={{ myLocationButtonEnabled: showUserLocation }}
      />
    );
  }

  return <Text style={mapStyles.fallback}>O mapa abre no iOS e no Android.</Text>;
}

function toAppleMarkers(alerts: EmergencyAlert[]): AppleMaps.Marker[] {
  return alerts.flatMap((alert) => {
    if (!alert.coordinate) {
      return [];
    }

    return [
      {
        id: alert.id,
        title: alert.title,
        coordinates: alert.coordinate,
        tintColor: SEVERITY_COLOR[alert.severity],
      },
    ];
  });
}

function toGoogleMarkers(alerts: EmergencyAlert[]): GoogleMaps.Marker[] {
  return alerts.flatMap((alert) => {
    if (!alert.coordinate) {
      return [];
    }

    return [
      {
        id: alert.id,
        title: alert.title,
        snippet: alert.description,
        coordinates: alert.coordinate,
      },
    ];
  });
}

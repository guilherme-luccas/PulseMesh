import { useEffect, useState } from 'react';
import { useAlertsStore } from '../../alerts/store/useAlertsStore';
import type { AlertCoordinate, EmergencyAlert } from '../../alerts/types/alert.types';
import { locationService } from '../../../services/location/locationService';
import { useMapFocusStore } from '../store/useMapFocusStore';

const DEFAULT_CAMERA = {
  latitude: -23.5614,
  longitude: -46.6558,
  zoom: 12,
};

const ALERT_ZOOM = 15;

function cameraFromCoordinate(coordinate: AlertCoordinate, zoom: number) {
  return { latitude: coordinate.latitude, longitude: coordinate.longitude, zoom };
}

export interface MapScreenViewModel {
  alerts: EmergencyAlert[];
  camera: typeof DEFAULT_CAMERA;
  showUserLocation: boolean;
  locatedCount: number;
}

export function useMapScreen(): MapScreenViewModel {
  const alerts = useAlertsStore((state) => state.alerts);
  const selectedAlertId = useMapFocusStore((state) => state.selectedAlertId);
  const focused = alerts.find((alert) => alert.id === selectedAlertId && alert.coordinate);
  const [camera, setCamera] = useState(() =>
    focused?.coordinate ? cameraFromCoordinate(focused.coordinate, ALERT_ZOOM) : DEFAULT_CAMERA,
  );
  const [showUserLocation, setShowUserLocation] = useState(false);

  const focusedLatitude = focused?.coordinate?.latitude;
  const focusedLongitude = focused?.coordinate?.longitude;

  useEffect(() => {
    if (focusedLatitude === undefined || focusedLongitude === undefined) {
      return;
    }

    setCamera(cameraFromCoordinate({ latitude: focusedLatitude, longitude: focusedLongitude }, ALERT_ZOOM));
  }, [focused?.id, focusedLatitude, focusedLongitude]);

  useEffect(() => {
    void locationService.current().then((coordinate) => {
      if (!coordinate) {
        return;
      }

      setShowUserLocation(true);
      if (useMapFocusStore.getState().selectedAlertId) {
        return;
      }

      setCamera(cameraFromCoordinate(coordinate, 14));
    });
  }, []);

  const locatedCount = alerts.filter((alert) => alert.coordinate).length;

  return { alerts, camera, showUserLocation, locatedCount };
}

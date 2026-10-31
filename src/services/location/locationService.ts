import * as Location from 'expo-location';
import type { AlertCoordinate } from '../../features/alerts/types/alert.types';

const LOCATION_WAIT_MS = 5000;

function toCoordinate(position: Location.LocationObject | null): AlertCoordinate | null {
  if (!position) {
    return null;
  }

  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };
}

export const locationService = {
  async current(): Promise<AlertCoordinate | null> {
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        return null;
      }

      const lastKnown = await Location.getLastKnownPositionAsync();
      if (lastKnown) {
        return toCoordinate(lastKnown);
      }

      // ponytail: the simulator GPS read can hang forever when Location is None. Give up after 5s and save without a pin.
      const position = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), LOCATION_WAIT_MS);
        }),
      ]);

      return toCoordinate(position);
    } catch {
      return null;
    }
  },
};

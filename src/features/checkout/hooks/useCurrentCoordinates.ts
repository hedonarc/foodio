import { useCallback, useState } from 'react';

import { usePermissionRequest } from '@/hooks/usePermissionRequest';
import { logError } from '@/lib/logger';
import { PermissionType } from '@/services/permissions';
import type { Coordinates } from '@/utils/distance';

type CoordinatesState = {
  coordinates: Coordinates | null;
  isLocating: boolean;
  /** i18n key, so the screen decides the wording. */
  errorKey: string | null;
};

const INITIAL: CoordinatesState = { coordinates: null, isLocating: false, errorKey: null };

/**
 * The device's position, for deciding which restaurants can reach an address.
 * This is what the location permission asked for during onboarding is for.
 */
export function useCurrentCoordinates() {
  const [state, setState] = useState<CoordinatesState>(INITIAL);
  const { request } = usePermissionRequest();

  const locate = useCallback(async () => {
    setState({ ...INITIAL, isLocating: true });

    try {
      const { status } = await request(PermissionType.Location);
      if (status !== 'granted') {
        setState({ ...INITIAL, errorKey: 'address.locationDenied' });
        return;
      }

      const Location = await import('expo-location');
      const position = await Location.getCurrentPositionAsync({});

      setState({
        coordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
        isLocating: false,
        errorKey: null,
      });
    } catch (error) {
      logError('checkout.locate', error);
      setState({ ...INITIAL, errorKey: 'address.locationFailed' });
    }
  }, [request]);

  return { ...state, locate };
}

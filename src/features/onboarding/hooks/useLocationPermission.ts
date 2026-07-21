import { useCallback } from 'react';

import * as Location from 'expo-location';

export function useLocationPermission() {
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  }, []);

  return { requestPermission };
}

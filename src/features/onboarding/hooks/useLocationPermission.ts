import * as Location from 'expo-location';
import { useCallback } from 'react';

export function useLocationPermission() {
  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  }, []);

  return { requestPermission };
}

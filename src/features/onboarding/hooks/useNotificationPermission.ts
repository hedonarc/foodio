import { useCallback } from 'react';

export function useNotificationPermission() {
  const requestPermission = useCallback(async () => {
    const Notifications = await import('expo-notifications');
    const { status } = await Notifications.requestPermissionsAsync();
    return status;
  }, []);

  return { requestPermission };
}

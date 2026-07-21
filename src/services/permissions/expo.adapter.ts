import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import type { PermissionPort, PermissionResult, PermissionType } from './types';

async function requestLocation(): Promise<PermissionResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return { status, type: 'location' };
}

async function requestNotification(): Promise<PermissionResult> {
  const { status } = await Notifications.requestPermissionsAsync();
  return { status, type: 'notification' };
}

const handlers: Record<PermissionType, () => Promise<PermissionResult>> = {
  location: requestLocation,
  notification: requestNotification,
};

export const expoPermissionAdapter: PermissionPort = {
  request: async (type) => {
    const handler = handlers[type];
    return handler();
  },
};

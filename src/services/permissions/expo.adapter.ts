import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';

import type { PermissionPort, PermissionResult } from './types';
import { PermissionType } from './types';

async function requestLocation(): Promise<PermissionResult> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  return { status, type: PermissionType.Location };
}

async function requestNotification(): Promise<PermissionResult> {
  const { status } = await Notifications.requestPermissionsAsync();
  return { status, type: PermissionType.Notification };
}

const handlers: Record<PermissionType, () => Promise<PermissionResult>> = {
  [PermissionType.Location]: requestLocation,
  [PermissionType.Notification]: requestNotification,
};

export const expoPermissionAdapter: PermissionPort = {
  request: async (type) => {
    const handler = handlers[type];
    return handler();
  },
};

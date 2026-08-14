import type { PermissionPort, PermissionResult } from './types';
import { PermissionType } from './types';

async function requestLocation(): Promise<PermissionResult> {
  const Location = await import('expo-location');
  const { status } = await Location.requestForegroundPermissionsAsync();
  return { status, type: PermissionType.Location };
}

async function requestNotification(): Promise<PermissionResult> {
  const Notifications = await import('expo-notifications');
  const { status } = await Notifications.requestPermissionsAsync();
  return { status, type: PermissionType.Notification };
}

async function requestPhotoLibrary(): Promise<PermissionResult> {
  const ImagePicker = await import('expo-image-picker');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return { status, type: PermissionType.PhotoLibrary };
}

const handlers: Record<PermissionType, () => Promise<PermissionResult>> = {
  [PermissionType.Location]: requestLocation,
  [PermissionType.Notification]: requestNotification,
  [PermissionType.PhotoLibrary]: requestPhotoLibrary,
};

export const expoPermissionAdapter: PermissionPort = {
  request: async (type) => {
    const handler = handlers[type];
    return handler();
  },
};

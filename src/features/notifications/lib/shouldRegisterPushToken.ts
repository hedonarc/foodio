import type { ExpoPermissionStatus } from '@/services/permissions';

/**
 * Registration needs both: permission the OS will actually deliver through,
 * and a person to register the device for. Either missing means don't call
 * the backend — a denied/undetermined status is not worth a token for, and
 * a signed-out device has no `/me` to register against.
 */
export function shouldRegisterPushToken(
  permissionStatus: ExpoPermissionStatus,
  isSignedIn: boolean,
): boolean {
  return permissionStatus === 'granted' && isSignedIn;
}

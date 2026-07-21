import type { PermissionPort, PermissionResult, PermissionType } from './types';

export async function requestPermission(
  port: PermissionPort,
  type: PermissionType,
): Promise<PermissionResult> {
  return port.request(type);
}

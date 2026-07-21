import { useCallback } from 'react';

import type { PermissionType } from '@/services/permissions';
import { expoPermissionAdapter } from '@/services/permissions';
import { requestPermission } from '@/services/permissions';

export function usePermissionRequest() {
  const request = useCallback(async (type: PermissionType) => {
    return requestPermission(expoPermissionAdapter, type);
  }, []);

  return { request };
}

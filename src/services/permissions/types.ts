export type PermissionType = 'location' | 'notification';

export type PermissionResult = {
  readonly status: 'granted' | 'denied' | 'undetermined';
  readonly type: PermissionType;
};

export type PermissionPort = {
  request: (type: PermissionType) => Promise<PermissionResult>;
};

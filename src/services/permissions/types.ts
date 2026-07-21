export enum PermissionType {
  Location = 'location',
  Notification = 'notification',
}

export type ExpoPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type PermissionResult = {
  readonly status: ExpoPermissionStatus;
  readonly type: PermissionType;
};

export type PermissionPort = {
  request: (type: PermissionType) => Promise<PermissionResult>;
};

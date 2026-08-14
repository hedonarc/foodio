export enum PermissionType {
  Location = 'location',
  Notification = 'notification',
  /** The photo library, for putting a picture on a restaurant or a dish. */
  PhotoLibrary = 'photoLibrary',
}

export type ExpoPermissionStatus = 'granted' | 'denied' | 'undetermined';

export type PermissionResult = {
  readonly status: ExpoPermissionStatus;
  readonly type: PermissionType;
};

export type PermissionPort = {
  request: (type: PermissionType) => Promise<PermissionResult>;
};

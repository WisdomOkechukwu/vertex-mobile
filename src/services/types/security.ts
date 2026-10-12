export interface Device {
  id: string;
  name: string;
  meta: string;
  current: boolean;
  trusted: boolean;
}

export interface SecurityAPI {
  listDevices(): Promise<Device[]>;
  revokeDevice(id: string): Promise<void>;
  changePassword(oldPassword: string, newPassword: string): Promise<void>;
  setupTwoFactor(): Promise<{ secret: string }>;
  confirmTwoFactor(code: string): Promise<{ backupCodes: string[] }>;
  disableTwoFactor(): Promise<void>;
}

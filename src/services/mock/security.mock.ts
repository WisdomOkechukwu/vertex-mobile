import { delay } from '@/services/mock/delay';
import { MOCK_DEVICES } from '@/services/mock/data/security';
import type { SecurityAPI } from '@/services/types/security';

const devices = [...MOCK_DEVICES];

export const securityMockApi: SecurityAPI = {
  async listDevices() {
    await delay();
    return devices;
  },
  async revokeDevice(id) {
    await delay(600);
    const idx = devices.findIndex((d) => d.id === id);
    if (idx >= 0) devices.splice(idx, 1);
  },
  async changePassword() {
    await delay(700);
  },
  async setupTwoFactor() {
    await delay(500);
    return { secret: 'JBSW Y3DP EHPK 3PXP' };
  },
  async confirmTwoFactor() {
    await delay(600);
    // Verbatim from `design/security/2fa-4.png`, in its reading order.
    return { backupCodes: ['4F2K-9QT1', '8XPB-3MW7', 'ZC61-JD48', 'H7RN-2VE9', 'QK83-LT50', 'M9DA-6BY2'] };
  },
  async disableTwoFactor() {
    await delay(400);
  },
};

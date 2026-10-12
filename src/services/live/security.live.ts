import { http } from '@/services/live/http';
import type { SecurityAPI } from '@/services/types/security';

export const securityLiveApi: SecurityAPI = {
  listDevices: () => http.get('/security/devices'),
  revokeDevice: (id: string) => http.delete(`/security/devices/${id}`),
  changePassword: (oldPassword: string, newPassword: string) =>
    http.post('/security/change-password', { oldPassword, newPassword }),
  setupTwoFactor: () => http.post('/security/2fa/setup'),
  confirmTwoFactor: (code: string) => http.post('/security/2fa/confirm', { code }),
  disableTwoFactor: () => http.post('/security/2fa/disable'),
};

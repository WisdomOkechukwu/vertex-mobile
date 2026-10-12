import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { Device } from '@/services/types/security';
import type { VerificationStep } from '@/services/types/verification';

interface SecurityState extends AsyncSlice {
  devices: Device[];
  verificationSteps: VerificationStep[];
  twoFactorEnabled: boolean;
  /**
   * The one-time codes from the last successful `confirmTwoFactor`. Held here rather than passed
   * through the route so the final step of the wizard shows the codes the server actually issued —
   * it used to render a hardcoded set and discard these.
   */
  backupCodes: string[];
  fetchDevices: () => Promise<void>;
  revokeDevice: (id: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  fetchVerification: () => Promise<void>;
  submitVerificationStep: (key: string, fields: Record<string, string>) => Promise<void>;
  setupTwoFactor: () => Promise<{ secret: string }>;
  confirmTwoFactor: (code: string) => Promise<{ backupCodes: string[] }>;
  disableTwoFactor: () => Promise<void>;
}

export const useSecurityStore = create<SecurityState>((set, get) => ({
  status: 'idle',
  error: null,
  devices: [],
  verificationSteps: [],
  twoFactorEnabled: false,
  backupCodes: [],
  fetchDevices: async () => {
    set({ status: 'loading', error: null });
    try {
      const devices = await api.security.listDevices();
      set({ devices, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  revokeDevice: async (id) => {
    await api.security.revokeDevice(id);
    set({ devices: get().devices.filter((d) => d.id !== id) });
  },
  changePassword: (oldPassword, newPassword) => api.security.changePassword(oldPassword, newPassword),
  fetchVerification: async () => {
    set({ status: 'loading', error: null });
    try {
      const verificationSteps = await api.verification.listSteps();
      set({ verificationSteps, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  submitVerificationStep: async (key, fields) => {
    const step = await api.verification.submitStep(key, fields);
    set({ verificationSteps: get().verificationSteps.map((s) => (s.key === step.key ? step : s)) });
  },
  setupTwoFactor: () => api.security.setupTwoFactor(),
  confirmTwoFactor: async (code) => {
    const result = await api.security.confirmTwoFactor(code);
    set({ twoFactorEnabled: true, backupCodes: result.backupCodes });
    return result;
  },
  disableTwoFactor: async () => {
    await api.security.disableTwoFactor();
    set({ twoFactorEnabled: false, backupCodes: [] });
  },
}));

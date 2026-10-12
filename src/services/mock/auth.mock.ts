import { delay } from '@/services/mock/delay';
import { MOCK_USER } from '@/services/mock/data/user';
import { ApiError } from '@/services/types/common';
import type { AuthAPI, AuthSession } from '@/services/types/auth';

function buildSession(): AuthSession {
  return {
    accessToken: `mock_access_${Date.now()}`,
    refreshToken: `mock_refresh_${Date.now()}`,
    expiresAt: Date.now() + 1000 * 60 * 60,
    user: MOCK_USER,
  };
}

export const authMockApi: AuthAPI = {
  async login({ email, password }) {
    await delay();
    if (!email || password.length < 4) throw new ApiError('INVALID_CREDENTIALS', 'Incorrect email or password.');
    return buildSession();
  },
  async refresh() {
    await delay(300);
    return buildSession();
  },
  async signUpDetails() {
    await delay();
    return { pendingUserId: `pend_${Date.now()}` };
  },
  async verifyEmail() {
    await delay(900);
    return { verified: true };
  },
  async requestOtpResend() {
    await delay(300);
  },
  async verifyPhoneOtp(_pendingUserId, code) {
    await delay();
    if (code.length !== 6) throw new ApiError('INVALID_OTP', 'Enter the 6-digit code.');
    return buildSession();
  },
  async verifyTwoFactorCode(_userId, code) {
    await delay();
    if (code.length !== 6) throw new ApiError('INVALID_2FA', 'Enter the 6-digit code.');
    return buildSession();
  },
  async logout() {
    await delay(200);
  },
  async deleteAccount({ reason }) {
    await delay(700);
    if (!reason) throw new ApiError('INVALID_REQUEST', 'Tell us why you are leaving.');
  },
};

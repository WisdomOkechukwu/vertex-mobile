import { http } from '@/services/live/http';
import type { AuthAPI, DeleteAccountPayload, AuthSession, LoginPayload, SignUpDetailsPayload } from '@/services/types/auth';

export const authLiveApi: AuthAPI = {
  login: (payload: LoginPayload) => http.post<AuthSession>('/auth/login', payload),
  refresh: (refreshToken: string) => http.post<AuthSession>('/auth/refresh', { refreshToken }),
  signUpDetails: (payload: SignUpDetailsPayload) => http.post('/auth/sign-up', payload),
  verifyEmail: (pendingUserId: string) => http.get(`/auth/sign-up/${pendingUserId}/email-status`),
  requestOtpResend: (pendingUserId: string) => http.post(`/auth/sign-up/${pendingUserId}/otp/resend`),
  verifyPhoneOtp: (pendingUserId: string, code: string) =>
    http.post<AuthSession>(`/auth/sign-up/${pendingUserId}/otp/verify`, { code }),
  verifyTwoFactorCode: (userId: string, code: string) =>
    http.post<AuthSession>(`/auth/${userId}/2fa/verify`, { code }),
  logout: () => http.post('/auth/logout'),
  deleteAccount: (payload: DeleteAccountPayload) => http.post('/auth/delete', payload),
};

export interface User {
  id: string;
  profileName: string;
  profileTag: string;
  fullName: string;
  phone: string;
  email: string;
  avatarInitials: string;
  tier: string;
  cashbackBalance: number;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpDetailsPayload {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthAPI {
  login(payload: LoginPayload): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  signUpDetails(payload: SignUpDetailsPayload): Promise<{ pendingUserId: string }>;
  verifyEmail(pendingUserId: string): Promise<{ verified: boolean }>;
  requestOtpResend(pendingUserId: string): Promise<void>;
  verifyPhoneOtp(pendingUserId: string, code: string): Promise<AuthSession>;
  verifyTwoFactorCode(userId: string, code: string): Promise<AuthSession>;
  logout(): Promise<void>;
  /**
   * Closes the account for good. `reason` is one of the preset choices on the delete screen and
   * `detail` is the user's own words, which the reference flow asks for before it will proceed.
   */
  deleteAccount(payload: DeleteAccountPayload): Promise<void>;
}

export interface DeleteAccountPayload {
  reason: string;
  detail?: string;
}

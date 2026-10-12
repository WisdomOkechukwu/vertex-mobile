import { create } from 'zustand';

import { generateSalt, hashPin } from '@/lib/pin-hash';
import { clearSeenTours } from '@/lib/preferences';
import {
  clearAllSecureData,
  clearPinRecord,
  clearSession,
  getBiometricEnabled,
  getPinRecord,
  getSession,
  saveLastProfile,
  saveSession,
  savePinRecord,
  setBiometricEnabled,
} from '@/lib/secure-auth';
import { api } from '@/services';
import { API_MODE } from '@/services/config';
import type { AuthSession, DeleteAccountPayload, User } from '@/services/types/auth';
import { resetAccountStores } from '@/stores/reset-account-stores';
import { useToursStore } from '@/stores/tours-store';

/** The design uses a 4-digit transaction PIN throughout. */
export const TRANSACTION_PIN_LENGTH = 4;

interface AuthState {
  hydrated: boolean;
  isAuthenticated: boolean;
  user: User | null;
  session: AuthSession | null;
  biometricEnabled: boolean;
  loading: boolean;
  error: string | null;
  pendingUserId: string | null;
  pendingPhone: string | null;

  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithSession: (session: AuthSession) => Promise<void>;
  signUpDetails: (payload: { fullName: string; phone: string; email: string; password: string }) => Promise<void>;
  verifyEmail: () => Promise<boolean>;
  resendOtp: () => Promise<void>;
  verifyPhoneOtp: (code: string) => Promise<void>;
  verifyTwoFactorCode: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  /** Closes the account and wipes every trace of it from this device. */
  deleteAccount: (payload: DeleteAccountPayload) => Promise<void>;
  setBiometric: (enabled: boolean) => Promise<void>;
  setTransactionPin: (pin: string) => Promise<void>;
  verifyTransactionPin: (pin: string) => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  hydrated: false,
  isAuthenticated: false,
  user: null,
  session: null,
  biometricEnabled: false,
  loading: false,
  error: null,
  pendingUserId: null,
  pendingPhone: null,

  hydrate: async () => {
    // The root layout renders nothing until `hydrated` flips, so this must never throw — a storage
    // failure has to degrade to "signed out", not leave the app on a blank screen.
    try {
      const [session, biometricEnabled] = await Promise.all([getSession(), getBiometricEnabled()]);
      set({
        hydrated: true,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session,
        biometricEnabled,
      });
    } catch {
      set({ hydrated: true, session: null, user: null, isAuthenticated: false, biometricEnabled: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const session = await api.auth.login({ email, password });
      await get().loginWithSession(session);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Login failed.', loading: false });
      throw e;
    }
  },

  loginWithSession: async (session) => {
    await saveSession(session);
    // Outlives logout so Login can greet this user by name next time.
    await saveLastProfile({
      profileName: session.user.profileName,
      avatarInitials: session.user.avatarInitials,
    });
    set({ session, user: session.user, isAuthenticated: true, loading: false, error: null });
  },

  signUpDetails: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { pendingUserId } = await api.auth.signUpDetails(payload);
      set({ pendingUserId, pendingPhone: payload.phone, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Sign up failed.', loading: false });
      throw e;
    }
  },

  verifyEmail: async () => {
    const { pendingUserId } = get();
    if (!pendingUserId) return false;
    const { verified } = await api.auth.verifyEmail(pendingUserId);
    return verified;
  },

  resendOtp: async () => {
    const { pendingUserId } = get();
    if (!pendingUserId) return;
    await api.auth.requestOtpResend(pendingUserId);
  },

  verifyPhoneOtp: async (code) => {
    const { pendingUserId } = get();
    if (!pendingUserId) throw new Error('No pending sign-up.');
    set({ loading: true, error: null });
    try {
      const session = await api.auth.verifyPhoneOtp(pendingUserId, code);
      await get().loginWithSession(session);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Invalid code.', loading: false });
      throw e;
    }
  },

  verifyTwoFactorCode: async (code) => {
    const userId = get().user?.id ?? 'pending';
    set({ loading: true, error: null });
    try {
      const session = await api.auth.verifyTwoFactorCode(userId, code);
      await get().loginWithSession(session);
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Invalid code.', loading: false });
      throw e;
    }
  },

  /**
   * Sign out. Revokes server-side, then clears everything that identifies this session on the
   * device — session token, transaction-PIN record and the biometric opt-in, since Face ID must not
   * unlock the next person's account.
   *
   * `vertex.last_profile` deliberately survives: the Login screen greets a returning user by name
   * (see the note in `lib/secure-auth.ts`). Account *deletion* clears it.
   */
  logout: async () => {
    await api.auth.logout().catch(() => undefined);
    await Promise.all([clearSession(), clearPinRecord(), setBiometricEnabled(false)]);
    resetAccountStores();
    set({
      session: null,
      user: null,
      isAuthenticated: false,
      biometricEnabled: false,
      error: null,
      pendingUserId: null,
      pendingPhone: null,
    });
  },

  deleteAccount: async (payload) => {
    set({ loading: true, error: null });
    try {
      await api.auth.deleteAccount(payload);
      // Unlike sign-out, this leaves nothing behind — no last profile, no seen tours.
      await Promise.all([clearAllSecureData(), clearSeenTours()]);
      resetAccountStores();
      useToursStore.getState().reset();
      set({
        session: null,
        user: null,
        isAuthenticated: false,
        biometricEnabled: false,
        loading: false,
        error: null,
        pendingUserId: null,
        pendingPhone: null,
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not delete your account.', loading: false });
      throw e;
    }
  },

  setBiometric: async (enabled) => {
    await setBiometricEnabled(enabled);
    set({ biometricEnabled: enabled });
  },

  setTransactionPin: async (pin) => {
    const salt = await generateSalt();
    const hash = await hashPin(pin, salt);
    await savePinRecord(hash, salt);
  },

  verifyTransactionPin: async (pin) => {
    if (pin.length !== TRANSACTION_PIN_LENGTH) return false;

    const record = await getPinRecord();

    // No PIN has been chosen yet. The design prototype authorises any 4-digit entry, so in mock
    // mode we enrol the first PIN entered rather than dead-ending every money-movement flow behind
    // a PIN the user was never asked to set. Against a real backend an unset PIN is a hard failure:
    // the caller must send the user through Security → Change PIN first.
    if (!record) {
      if (API_MODE !== 'mock') return false;
      await get().setTransactionPin(pin);
      return true;
    }

    const hash = await hashPin(pin, record.salt);
    return hash === record.hash;
  },

  clearError: () => set({ error: null }),
}));

export async function resetTransactionPin() {
  await clearPinRecord();
}

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSession } from '@/services/types/auth';

const SERVICE = 'vertex.auth';
const SESSION_KEY = 'vertex.session';
const PIN_HASH_KEY = 'vertex.txpin_hash';
const PIN_SALT_KEY = 'vertex.txpin_salt';
const BIOMETRIC_KEY = 'vertex.biometric_enabled';
/**
 * Who signed in last. Deliberately **not** cleared on logout: the design's Login screen greets a
 * returning user by name ("Hello, Adaeze · Last signed in 16 Aug, 09:14 · Lagos"), which is only
 * possible if something outlives the session. Holds a display name and initials — no credentials.
 */
const LAST_PROFILE_KEY = 'vertex.last_profile';

const opts = { keychainService: SERVICE };

/**
 * `expo-secure-store` is native-only — on web its methods are undefined, and calling one throws.
 *
 * The product target is native (Keychain on iOS, Keystore on Android), but the web build is what we
 * run for preview and screenshot comparison, and an unhandled throw here leaves the whole app on a
 * blank screen because the root layout waits on hydration. So web falls back to `localStorage`.
 *
 * That fallback is **not secure storage** — it is readable by any script on the origin. It exists so
 * the preview build runs; do not ship the web target as a real banking client without replacing it.
 */
const isWeb = Platform.OS === 'web';

async function readItem(key: string): Promise<string | null> {
  if (isWeb) {
    try {
      return globalThis.localStorage?.getItem(key) ?? null;
    } catch {
      return null;
    }
  }
  return SecureStore.getItemAsync(key, opts);
}

async function writeItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.setItem(key, value);
    } catch {
      // Private-mode browsers can refuse writes; the session simply won't persist.
    }
    return;
  }
  await SecureStore.setItemAsync(key, value, opts);
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    try {
      globalThis.localStorage?.removeItem(key);
    } catch {
      // Nothing to clean up if storage is unavailable.
    }
    return;
  }
  await SecureStore.deleteItemAsync(key, opts);
}

export async function getSession(): Promise<AuthSession | null> {
  const raw = await readItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    // A corrupt entry should sign the user out, not crash the app on boot.
    await removeItem(SESSION_KEY);
    return null;
  }
}

export async function saveSession(session: AuthSession): Promise<void> {
  await writeItem(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await removeItem(SESSION_KEY);
}

export async function getPinRecord(): Promise<{ hash: string; salt: string } | null> {
  const [hash, salt] = await Promise.all([readItem(PIN_HASH_KEY), readItem(PIN_SALT_KEY)]);
  return hash && salt ? { hash, salt } : null;
}

export async function savePinRecord(hash: string, salt: string): Promise<void> {
  await Promise.all([writeItem(PIN_HASH_KEY, hash), writeItem(PIN_SALT_KEY, salt)]);
}

export async function clearPinRecord(): Promise<void> {
  await Promise.all([removeItem(PIN_HASH_KEY), removeItem(PIN_SALT_KEY)]);
}

export type LastProfile = { profileName: string; avatarInitials: string };

export async function getLastProfile(): Promise<LastProfile | null> {
  const raw = await readItem(LAST_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LastProfile;
  } catch {
    await removeItem(LAST_PROFILE_KEY);
    return null;
  }
}

export async function saveLastProfile(profile: LastProfile): Promise<void> {
  await writeItem(LAST_PROFILE_KEY, JSON.stringify(profile));
}

export async function getBiometricEnabled(): Promise<boolean> {
  return (await readItem(BIOMETRIC_KEY)) === '1';
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await writeItem(BIOMETRIC_KEY, enabled ? '1' : '0');
}

/**
 * Everything this module owns, gone — session, PIN record, biometric opt-in **and** the returning-user
 * profile that normally outlives a logout.
 *
 * Sign-out deliberately does not use this: it keeps `vertex.last_profile` so Login can still greet
 * the user by name. Account deletion should leave nothing behind, so it does.
 */
export async function clearAllSecureData(): Promise<void> {
  await Promise.all([
    removeItem(SESSION_KEY),
    removeItem(PIN_HASH_KEY),
    removeItem(PIN_SALT_KEY),
    removeItem(BIOMETRIC_KEY),
    removeItem(LAST_PROFILE_KEY),
  ]);
}

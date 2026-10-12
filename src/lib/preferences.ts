import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Device preferences that are **not** credentials — which feature tours the user has already been
 * shown, and their light/dark choice.
 *
 * It shares `secure-auth.ts`'s platform split (Keychain/Keystore on device, `localStorage` on the
 * web preview build, since `expo-secure-store` has no web implementation) but is deliberately a
 * separate module: nothing here is sensitive, and mixing it into the credential store would blur
 * what `clearSession` is allowed to wipe.
 */
const SERVICE = 'vertex.prefs';
const SEEN_TOURS_KEY = 'vertex.seen_tours';
const THEME_KEY = 'vertex.theme';

const isWeb = Platform.OS === 'web';

async function read(key: string): Promise<string | null> {
  try {
    if (isWeb) return globalThis.localStorage?.getItem(key) ?? null;
    return await SecureStore.getItemAsync(key, { keychainService: SERVICE });
  } catch {
    return null;
  }
}

async function write(key: string, value: string): Promise<void> {
  try {
    if (isWeb) globalThis.localStorage?.setItem(key, value);
    else await SecureStore.setItemAsync(key, value, { keychainService: SERVICE });
  } catch {
    // A preference that fails to persist just means the tour shows again next launch.
  }
}

export async function getSeenTours(): Promise<string[]> {
  const raw = await read(SEEN_TOURS_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

export async function saveSeenTours(seen: string[]): Promise<void> {
  await write(SEEN_TOURS_KEY, JSON.stringify(seen));
}

/**
 * Forget which tours have been shown. Used by account deletion, so a fresh account on this device
 * gets the first-run tours again. The theme choice is left alone — it is the device's, not the
 * account's.
 */
export async function clearSeenTours(): Promise<void> {
  await write(SEEN_TOURS_KEY, JSON.stringify([]));
}

/** `'system'` follows the OS; the other two pin the app regardless of the device setting. */
export type ThemePreference = 'system' | 'light' | 'dark';

const THEME_VALUES: ThemePreference[] = ['system', 'light', 'dark'];

export async function getThemePreference(): Promise<ThemePreference> {
  const raw = await read(THEME_KEY);
  return THEME_VALUES.find((v) => v === raw) ?? 'system';
}

export async function saveThemePreference(preference: ThemePreference): Promise<void> {
  await write(THEME_KEY, preference);
}

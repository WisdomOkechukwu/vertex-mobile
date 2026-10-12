import { create } from 'zustand';

import { getThemePreference, saveThemePreference, type ThemePreference } from '@/lib/preferences';

interface ThemeState {
  hydrated: boolean;
  preference: ThemePreference;
  hydrate: () => Promise<void>;
  setPreference: (preference: ThemePreference) => void;
}

/**
 * The user's light/dark choice. Defaults to `'system'`, which is also what renders while storage is
 * being read — so a cold start shows the OS scheme and then settles, rather than flashing light.
 *
 * `setPreference` applies immediately and persists in the background: the write is a preference, not
 * a transaction, and blocking the theme switch on the keychain would make the tap feel broken.
 */
export const useThemeStore = create<ThemeState>((set) => ({
  hydrated: false,
  preference: 'system',

  hydrate: async () => {
    const preference = await getThemePreference();
    set({ preference, hydrated: true });
  },

  setPreference: (preference) => {
    set({ preference });
    void saveThemePreference(preference);
  },
}));

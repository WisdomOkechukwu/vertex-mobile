/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeStore } from '@/stores/theme-store';

export type ResolvedScheme = 'light' | 'dark';

/**
 * The one place the app decides whether it is light or dark. The OS scheme is the default; the
 * user's stored preference overrides it unless that preference is `'system'`.
 *
 * Everything reads through here — `useTheme`, `useShadows`, and the navigation container theme in
 * `src/app/_layout.tsx` — so there is a single source of truth. Until the store hydrates its
 * preference is `'system'`, which is the right thing to render first anyway.
 */
export function useResolvedScheme(): ResolvedScheme {
  const osScheme = useColorScheme();
  const preference = useThemeStore((s) => s.preference);

  if (preference !== 'system') return preference;
  // RN 0.86 reports 'unspecified' when the platform has no opinion.
  return osScheme === 'dark' ? 'dark' : 'light';
}

export function useTheme() {
  return Colors[useResolvedScheme()];
}

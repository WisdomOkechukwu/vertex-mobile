/**
 * The app's colour palette, in light and dark mode. `ExtraColors` carries every Vertex design token
 * (`--bg`, `--fg`, `--card`, `--acc`, the washes, the `on*` inks) and supplies `background`/`text`
 * itself, so this file is now just the light/dark split.
 *
 * The Expo template's `backgroundElement`/`backgroundSelected`/`textSecondary` used to sit here for
 * "framework-level surfaces"; nothing ever used them, and they only widened `ThemeColor` with keys
 * no screen could meaningfully ask for.
 */

import '@/global.css';

import { Platform } from 'react-native';

import { ExtraColors } from '@/constants/colors';

export const Colors = {
  light: ExtraColors.light,
  dark: ExtraColors.dark,
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export * from '@/constants/colors';
export * from '@/constants/layout';
export * from '@/constants/radius';
export * from '@/constants/shadows';
export * from '@/constants/typography';

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

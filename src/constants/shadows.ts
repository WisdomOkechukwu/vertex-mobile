/**
 * Vertex design tokens — elevation.
 *
 * RN has no `box-shadow` with a spread/inset term, so each token below approximates one of the
 * mockup's actual shadows (quoted in the comments) using iOS shadow* props and an Android
 * elevation fallback.
 *
 * ## Why this is a function of the scheme
 *
 * The neutral shadows are all `#181211`, a near-black tuned to sit under a white surface. On the
 * dark surface (`#141313`) they are invisible, and on Android `shadow()` emits only `elevation`,
 * whose colour the OS picks — equally invisible. That silently removed three of the app's four
 * elevation cues in dark mode, including the one separating the floating bottom nav (`navbg`
 * `#272525`) from the background it sits on.
 *
 * Dark mode therefore swaps the drop shadow for a hairline. RN borders are drawn inside the box, so
 * this does not shift layout. `accentGlow` is accent-coloured rather than neutral and reads *better*
 * on dark, so it is unchanged in both schemes.
 */
import { Platform, ViewStyle } from 'react-native';

import { ExtraColors } from '@/constants/colors';

function shadow(color: string, opacity: number, radius: number, offsetY: number, elevation: number): ViewStyle {
  return Platform.select<ViewStyle>({
    android: { elevation },
    default: {
      shadowColor: color,
      shadowOpacity: opacity,
      shadowRadius: radius,
      shadowOffset: { width: 0, height: offsetY },
    },
  }) as ViewStyle;
}

/** A hairline in place of a shadow — what carries separation on the dark surface. */
function hairline(): ViewStyle {
  return { borderWidth: 1, borderColor: ExtraColors.dark.line };
}

export type ShadowTokens = {
  raised: ViewStyle;
  floating: ViewStyle;
  card: ViewStyle;
  accentGlow: (accent: string) => ViewStyle;
};

const LIGHT: ShadowTokens = {
  /** `0 6px 18px -8px rgba(24,20,18,.28)` — Home quick-action circles. */
  raised: shadow('#181211', 0.28, 12, 6, 4),
  /** `0 14px 34px -10px rgba(24,20,18,.4)` — the floating bottom nav. */
  floating: shadow('#181211', 0.4, 22, 14, 10),
  /** `0 20px 42px -20px rgba(24,20,18,.55)` — card visuals. */
  card: shadow('#181211', 0.45, 26, 16, 8),
  /** `0 8px 20px -8px color-mix(in srgb, var(--acc) 60%, transparent)` — accent FABs. */
  accentGlow: (accent: string) => shadow(accent, 0.6, 14, 8, 6),
};

const DARK: ShadowTokens = {
  raised: hairline(),
  floating: hairline(),
  card: hairline(),
  accentGlow: LIGHT.accentGlow,
};

export function shadowsFor(scheme: 'light' | 'dark'): ShadowTokens {
  return scheme === 'dark' ? DARK : LIGHT;
}

/**
 * The light-mode tokens, for the handful of places that are light in both schemes (a dark card face
 * over a dark gradient, say). Prefer `useShadows()` — it follows the theme.
 */
export const Shadows = LIGHT;

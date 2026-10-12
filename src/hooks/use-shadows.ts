import { shadowsFor, type ShadowTokens } from '@/constants/shadows';
import { useResolvedScheme } from '@/hooks/use-theme';

/**
 * Elevation for the current scheme — a drop shadow in light, a hairline in dark. Every call site
 * already calls `useTheme()`, so this sits alongside it rather than threading the scheme through.
 */
export function useShadows(): ShadowTokens {
  return shadowsFor(useResolvedScheme());
}

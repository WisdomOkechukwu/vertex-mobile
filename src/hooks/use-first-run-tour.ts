import { router } from 'expo-router';
import { useEffect } from 'react';

import type { TourVariant } from '@/constants/content';
import { useToursStore } from '@/stores/tours-store';

/**
 * Shows a feature's tour the first time its screen is opened, then never again. Each feature entry
 * screen calls this with its own variant — that is what the design's per-feature `onboarding.png`
 * screens are: a first-visit explainer, not a route the user navigates to.
 */
export function useFirstRunTour(variant: TourVariant) {
  const hydrated = useToursStore((s) => s.hydrated);
  const hydrate = useToursStore((s) => s.hydrate);
  const claim = useToursStore((s) => s.claim);

  useEffect(() => {
    if (!hydrated) {
      void hydrate();
      return;
    }
    if (claim(variant)) router.push({ pathname: '/tour', params: { variant } });
  }, [hydrated, hydrate, claim, variant]);
}

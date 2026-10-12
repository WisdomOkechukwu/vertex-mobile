import { create } from 'zustand';

import { getSeenTours, saveSeenTours } from '@/lib/preferences';
import type { TourVariant } from '@/constants/content';

interface ToursState {
  hydrated: boolean;
  seen: TourVariant[];
  hydrate: () => Promise<void>;
  /** Returns false if this tour has already been shown (or we have not read storage yet). */
  claim: (variant: TourVariant) => boolean;
  reset: () => Promise<void>;
}

/**
 * Which feature tours the user has already seen. `claim` is synchronous and marks the tour as seen
 * before the caller navigates, so a screen that mounts twice (a re-render, a back-navigation) cannot
 * open the same tour twice.
 */
export const useToursStore = create<ToursState>((set, get) => ({
  hydrated: false,
  seen: [],

  hydrate: async () => {
    const seen = (await getSeenTours()) as TourVariant[];
    set({ seen, hydrated: true });
  },

  claim: (variant) => {
    const { hydrated, seen } = get();
    if (!hydrated || seen.includes(variant)) return false;
    const next = [...seen, variant];
    set({ seen: next });
    void saveSeenTours(next);
    return true;
  },

  reset: async () => {
    set({ seen: [] });
    await saveSeenTours([]);
  },
}));

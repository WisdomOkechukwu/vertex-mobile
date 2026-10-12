import { create } from 'zustand';

import { errorMessage, type AsyncSlice } from '@/lib/api-status';
import { api } from '@/services';
import type { LinkDraft, PaymentLink } from '@/services/types/links';

interface LinksState extends AsyncSlice {
  links: PaymentLink[];
  fetchLinks: () => Promise<void>;
  createLink: (payload: LinkDraft) => Promise<PaymentLink>;
  updateLink: (id: string, payload: LinkDraft) => Promise<PaymentLink>;
  toggleActive: (id: string) => Promise<void>;
  deleteLink: (id: string) => Promise<void>;
}

/** Replaces one link in place, keeping list order — used by both `updateLink` and `toggleActive`. */
function splice(links: PaymentLink[], next: PaymentLink): PaymentLink[] {
  return links.map((l) => (l.id === next.id ? next : l));
}

export const useLinksStore = create<LinksState>((set, get) => ({
  status: 'idle',
  error: null,
  links: [],
  fetchLinks: async () => {
    set({ status: 'loading', error: null });
    try {
      const links = await api.links.listLinks();
      set({ links, status: 'success' });
    } catch (e) {
      set({ status: 'error', error: errorMessage(e) });
    }
  },
  createLink: async (payload) => {
    const link = await api.links.createLink(payload);
    set({ links: [link, ...get().links] });
    return link;
  },
  updateLink: async (id, payload) => {
    const link = await api.links.updateLink(id, payload);
    set({ links: splice(get().links, link) });
    return link;
  },
  toggleActive: async (id) => {
    const link = await api.links.toggleActive(id);
    set({ links: splice(get().links, link) });
  },
  deleteLink: async (id) => {
    await api.links.deleteLink(id);
    set({ links: get().links.filter((l) => l.id !== id) });
  },
}));

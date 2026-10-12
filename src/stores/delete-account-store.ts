import { create } from 'zustand';

/**
 * Carries the reason from the delete screen to the PIN screen that submits it.
 *
 * A store rather than route params: the reason can be a sentence the user typed, and it should not
 * end up in a URL that Expo Router logs and the web build puts in the address bar.
 */
interface DeleteAccountState {
  reason: string | null;
  detail?: string;
  set: (payload: { reason: string; detail?: string }) => void;
  clear: () => void;
}

export const useDeleteAccountStore = create<DeleteAccountState>((set) => ({
  reason: null,
  detail: undefined,
  set: ({ reason, detail }) => set({ reason, detail }),
  clear: () => set({ reason: null, detail: undefined }),
}));

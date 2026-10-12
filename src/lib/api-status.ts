/** Shared async-status shape used by every zustand store (auth/wallet/etc.). */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncSlice {
  status: AsyncStatus;
  error: string | null;
}

export const initialAsyncSlice: AsyncSlice = { status: 'idle', error: null };

/**
 * Whether a screen should be showing a skeleton.
 *
 * `'idle'` counts: a store that has not been asked yet is *also* not ready, and treating it as loaded
 * is what made the app render empty lists and zeroed counters on first paint. Nine screens each wrote
 * `status === 'loading' || status === 'idle'` by hand before this existed.
 */
export function isLoading(status: AsyncStatus): boolean {
  return status === 'loading' || status === 'idle';
}

export function errorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return 'Something went wrong. Please try again.';
}

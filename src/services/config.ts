/**
 * Single seam for swapping the mock API layer for the real backend: flip API_MODE (and once a
 * backend exists, fill in the `live/*.ts` adapter bodies) — no store or screen changes required.
 */
export const API_MODE: 'mock' | 'live' = 'mock';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.vertex.example.com';

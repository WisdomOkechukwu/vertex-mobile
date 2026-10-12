import { useBillsStore } from '@/stores/bills-store';
import { useCardsStore } from '@/stores/cards-store';
import { useCashbackStore } from '@/stores/cashback-store';
import { useGiftCardsStore } from '@/stores/gift-cards-store';
import { useLinksStore } from '@/stores/links-store';
import { useNotificationsStore } from '@/stores/notifications-store';
import { usePendingTxStore } from '@/stores/pending-tx-store';
import { useSecurityStore } from '@/stores/security-store';
import { useTransactionsStore } from '@/stores/transactions-store';
import { useWalletStore } from '@/stores/wallet-store';

/**
 * `replace: true` is the point: a shallow merge would leave the previous account's arrays in place.
 *
 * Taking the store as an argument rather than iterating an array of stores keeps the generic bound to
 * one state type per call — `setState` is overloaded, so a heterogeneous array of stores has no single
 * callable signature.
 */
function reset<T>(store: {
  setState: (state: T, replace: true) => void;
  getInitialState: () => T;
}): void {
  store.setState(store.getInitialState(), true);
}

/**
 * Every store holding account-scoped data. Deliberately excludes `theme-store` and `ui-store`, which
 * are device-level, and `auth-store`, which clears itself.
 *
 * Each entry is a thunk so the store is only dereferenced when a reset actually runs. There is a
 * require cycle here — `pending-tx-store` imports `auth-store`, which imports this module — and
 * reading `usePendingTxStore` at module scope would evaluate it before its own `create()` had run.
 */
const ACCOUNT_STORES: (() => void)[] = [
  () => reset(useWalletStore),
  () => reset(useTransactionsStore),
  () => reset(useNotificationsStore),
  () => reset(useCardsStore),
  () => reset(useLinksStore),
  () => reset(useBillsStore),
  () => reset(useCashbackStore),
  () => reset(useGiftCardsStore),
  () => reset(useSecurityStore),
  () => reset(usePendingTxStore),
];

/**
 * Drop one account's data out of memory on sign-out.
 *
 * Without this the next person to sign in on this device sees the previous account's balances and
 * transactions for as long as the first refetch takes. zustand v5 keeps each store's construction
 * state on the store API, so this needs no per-store `reset()` action — adding a store to the list
 * above is the whole change.
 */
export function resetAccountStores(): void {
  for (const run of ACCOUNT_STORES) run();
}

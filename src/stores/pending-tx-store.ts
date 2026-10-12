import { create } from 'zustand';

import { formatDate, formatMoney, formatTime, initialsOf } from '@/lib/format';

import { useAuthStore } from '@/stores/auth-store';
import { useBillsStore } from '@/stores/bills-store';
import { useCardsStore } from '@/stores/cards-store';
import { useCashbackStore } from '@/stores/cashback-store';
import { useGiftCardsStore } from '@/stores/gift-cards-store';
import { useWalletStore } from '@/stores/wallet-store';
import type { Transaction, TransactionStatus } from '@/services/types/transactions';

export type PendingTxKind =
  | 'send'
  | 'cryptoSend'
  | 'bill'
  | 'deposit'
  | 'vertex'
  | 'assetSend'
  | 'cardTopup'
  | 'cashbackWithdraw'
  | 'swap'
  | 'giftCard';

export interface PendingTx {
  kind: PendingTxKind;
  label: string;
  target: string;
  amount: number;
  fee: string;
  ctaLabel: string;
  needPin: boolean;
  asset?: string;
  meta?: Record<string, string>;
}

/** The rail's verdict is exactly a transaction's status — one type, named for both roles. */
export type SettlementStatus = TransactionStatus;

/**
 * Settlement follows the rail, matching what the review screen promised the user: on-chain
 * transfers, bill rails and inbound deposits settle later, while NIP, Vertex-to-Vertex and in-app
 * wallet moves are instant. A cross-currency send leaves the country's instant rail, so it is slow
 * too. This mirrors the design's `authorised()` logic exactly.
 */
export function settlementStatusFor(draft: PendingTx): SettlementStatus {
  const slowRail =
    draft.kind === 'cryptoSend' ||
    draft.kind === 'bill' ||
    draft.kind === 'deposit' ||
    (draft.kind === 'send' && !!draft.asset && draft.asset !== 'NGN');
  return slowRail ? 'pending' : 'success';
}

interface PendingTxState {
  draft: PendingTx | null;
  lastResult: Transaction | null;
  /** Settlement outcome of `lastResult`, derived from the rail the draft used. */
  lastStatus: SettlementStatus;
  setDraft: (d: PendingTx) => void;
  updateDraft: (patch: Partial<PendingTx>) => void;
  clear: () => void;
  submit: (pin: string) => Promise<Transaction>;
}

/**
 * Scratch store for in-flight money-movement flows (Send/Deposit/Bills/Swap → Amount → PIN → Result).
 * Routes carry only ids/kind; the actual payload lives here so an interrupted flow can be resumed
 * or safely discarded rather than serialized through URL params.
 */
/** Receipts show `18 Aug 2026, 10:24`, the same shape the transaction fixtures use. */
function stamp(): string {
  const now = new Date();
  return `${formatDate(now)}, ${formatTime(now)}`;
}

export const usePendingTxStore = create<PendingTxState>((set, get) => ({
  draft: null,
  lastResult: null,
  lastStatus: 'success',
  setDraft: (d) => set({ draft: d }),
  updateDraft: (patch) => set((s) => ({ draft: s.draft ? { ...s.draft, ...patch } : s.draft })),
  clear: () => set({ draft: null, lastResult: null, lastStatus: 'success' }),

  submit: async (pin) => {
    const { draft } = get();
    if (!draft) throw new Error('No pending transaction.');

    const pinOk = await useAuthStore.getState().verifyTransactionPin(pin);
    if (!pinOk) throw new Error('Incorrect PIN. Try again.');

    let result: Transaction;
    switch (draft.kind) {
      case 'swap': {
        // The pair travels in `meta`. It used to be encoded into `target` as `NGN->USDC` purely so
        // this line could split it back apart, which forced the PIN screen to hide `target` from view.
        const fromCode = draft.meta?.fromCode ?? draft.asset ?? 'NGN';
        const toCode = draft.meta?.toCode ?? fromCode;
        await useWalletStore.getState().swap(fromCode, toCode, draft.amount);
        result = {
          id: `tx_${Date.now()}`,
          mark: 'SW',
          name: draft.label,
          time: 'Just now',
          amt: formatMoney(-draft.amount, draft.asset ?? 'NGN'),
          kind: 'Swap',
          status: settlementStatusFor(draft),
          dir: 'out',
          tint: '#e2f4e6',
          ref: `VTX-${Date.now().toString().slice(-6)}`,
          channel: 'In-app swap',
          fee: draft.fee,
          date: stamp(),
          note: '',
          cashback: '',
        };
        break;
      }
      case 'cardTopup': {
        const cardId = draft.meta?.cardId;
        if (!cardId) throw new Error('No card selected.');
        await useCardsStore.getState().topUp(cardId, draft.amount);
        result = {
          id: `tx_${Date.now()}`,
          mark: 'TU',
          name: draft.target,
          time: 'Just now',
          amt: formatMoney(draft.amount, draft.asset ?? 'USD'),
          kind: 'Card',
          status: settlementStatusFor(draft),
          dir: 'in',
          tint: '#dfe7ff',
          ref: `VTX-${Date.now().toString().slice(-6)}`,
          channel: draft.label,
          fee: draft.fee,
          date: stamp(),
          note: draft.meta?.fromCode ? `From your ${draft.meta.fromCode} wallet` : '',
          cashback: '',
        };
        break;
      }
      case 'cashbackWithdraw': {
        await useCashbackStore.getState().withdraw(draft.amount);
        result = {
          id: `tx_${Date.now()}`,
          mark: 'NG',
          name: draft.target,
          time: 'Just now',
          amt: formatMoney(-draft.amount, 'NGN'),
          kind: 'Cashback',
          status: settlementStatusFor(draft),
          dir: 'out',
          tint: '#dfe7ff',
          ref: `RWD-${Date.now().toString().slice(-6)}`,
          channel: draft.label,
          fee: draft.fee,
          date: stamp(),
          note: 'Confirmed with your transaction PIN',
          cashback: '',
        };
        break;
      }
      case 'giftCard': {
        // Delegates, as `bill` does, rather than fabricating a record — the code has to come back
        // from the same call that issues it.
        const { transaction } = await useGiftCardsStore.getState().purchaseCard({
          brandId: draft.meta?.brandId ?? '',
          amount: Number(draft.meta?.face ?? 0),
          fromCode: draft.asset ?? 'NGN',
        });
        await useWalletStore.getState().debit(draft.asset ?? 'NGN', draft.amount);
        result = transaction;
        break;
      }
      case 'bill': {
        result = await useBillsStore.getState().payBill({
          billKey: draft.meta?.billKey ?? '',
          provider: draft.meta?.provider ?? draft.target,
          reference: draft.meta?.reference ?? '',
          amount: draft.amount,
          fromWalletCode: draft.asset ?? 'NGN',
        });
        break;
      }
      case 'vertex': {
        // A Vertex transfer used to fall through to `default`, so nothing left the wallet: the review
        // screen showed a conversion that was never applied and every balance stayed exactly put.
        await useWalletStore.getState().debit(draft.asset ?? 'NGN', draft.amount);
        const toCode = draft.meta?.toCode ?? draft.asset ?? 'NGN';
        const received = Number(draft.meta?.receiveAmount ?? 0) || draft.amount;
        result = {
          id: `tx_${Date.now()}`,
          mark: initialsOf(draft.target),
          name: draft.target,
          time: 'Just now',
          amt: formatMoney(-draft.amount, draft.asset ?? 'NGN'),
          kind: 'Vertex transfer',
          status: settlementStatusFor(draft),
          dir: 'out',
          tint: '#dfe7ff',
          ref: `VTX-${Date.now().toString().slice(-6)}`,
          channel: draft.meta?.tag ? `Vertex · ${draft.meta.tag}` : 'Vertex account',
          fee: draft.fee,
          date: stamp(),
          note:
            toCode === draft.asset
              ? ''
              : `They receive ${formatMoney(received, toCode)}`,
          cashback: '',
        };
        break;
      }
      default: {
        // send / deposit / crypto-send: single simulated settlement record — swap in the real
        // per-kind API call once the backend contract lands.
        result = {
          id: `tx_${Date.now()}`,
          mark: initialsOf(draft.target),
          name: draft.target,
          time: 'Just now',
          amt: formatMoney(-draft.amount, draft.asset ?? 'NGN'),
          kind: 'Sent',
          status: settlementStatusFor(draft),
          dir: 'out',
          tint: '#dfe7ff',
          ref: `VTX-${Date.now().toString().slice(-6)}`,
          channel: draft.label,
          fee: draft.fee,
          date: stamp(),
          note: '',
          cashback: '',
        };
      }
    }

    set({ lastResult: result, lastStatus: settlementStatusFor(draft) });
    return result;
  },
}));

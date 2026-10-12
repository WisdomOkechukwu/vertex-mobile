import { create } from 'zustand';

export type SheetType = 'picker' | 'share' | 'withdraw-cashback' | 'card-topup' | 'confirm' | null;

/** Props for a `'confirm'` sheet — a question, the stakes, and one destructive action. */
export type ConfirmSheetProps = {
  title: string;
  body: string;
  confirmLabel: string;
  /** `destructive` fills the CTA with `neg` instead of the accent. */
  tone?: 'destructive' | 'accent';
  onConfirm: () => void | Promise<void>;
};
export type ToastTone = 'success' | 'error' | 'neutral';
export type Toast = { id: string; message: string; tone: ToastTone };

/**
 * One mounted sheet. `id` is what `SheetHost` keys its layers on: without it, popping the top of a
 * stack whose two entries share a `type` would re-key the survivor and remount it, throwing away the
 * very state the stack exists to preserve.
 */
export type SheetEntry = { id: string; type: Exclude<SheetType, null>; props?: any };

interface UiState {
  /**
   * Mounted sheets, bottom first. A stack rather than a single slot because
   * `design/virtual card/fund-2.png` draws the wallet picker layered over a still-visible top-up
   * sheet — and because the parent sheet keeps its own local state (the typed amount) only for as
   * long as it stays mounted.
   */
  sheetStack: SheetEntry[];
  toasts: Toast[];
  openSheet: (type: SheetType, props?: any) => void;
  closeSheet: () => void;
  closeAllSheets: () => void;
  pushToast: (message: string, tone?: ToastTone) => void;
  dismissToast: (id: string) => void;
}

let toastSeq = 0;
let sheetSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  sheetStack: [],
  toasts: [],
  /**
   * Pushes a layer. Opened from a screen the stack is empty, so this behaves exactly as the old
   * single-slot version; opened from inside a sheet it layers on top. `null` clears the stack, which
   * is how the old signature spelled "close".
   */
  openSheet: (type, props) =>
    set((s) =>
      type === null
        ? { sheetStack: [] }
        : { sheetStack: [...s.sheetStack, { id: `sheet_${++sheetSeq}`, type, props }] }
    ),
  closeSheet: () => set((s) => ({ sheetStack: s.sheetStack.slice(0, -1) })),
  closeAllSheets: () => set({ sheetStack: [] }),
  pushToast: (message, tone = 'neutral') => {
    const id = `toast_${++toastSeq}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
    setTimeout(() => {
      useUiStore.getState().dismissToast(id);
    }, 3200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * One row in a `'picker'` sheet. `badge` is a rendered node so a caller can hand over whichever mark
 * the reference shows — a `CurrencyBadge` for wallets, a two-letter monogram for banks and bill
 * providers, a glyph for networks.
 */
export type PickerOption = {
  label: string;
  sublabel?: string;
  /** A fully-rendered mark that replaces the default disc — e.g. a tinted `CurrencyBadge`. */
  badge?: React.ReactNode;
  /** Initials to set in accent inside the default `key` disc — banks, bill providers, networks. */
  badgeLabel?: string;
  /** A glyph inside the default disc instead of initials — Lightning's bolt. */
  badgeIcon?: string;
  value: string;
};

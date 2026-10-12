/**
 * Vertex design tokens — colors.
 *
 * Extends (does not replace) the existing `Colors` export in `theme.ts`: every key here becomes a
 * sibling on `Colors.light`/`Colors.dark`, so `ThemedText`/`ThemedView`'s existing usage keeps
 * compiling.
 *
 * ## Do not "correct" the saturated values from the screenshots
 *
 * The `/design` PNGs are **Display-P3 captures of sRGB-authored colours**. Neutrals survive the
 * round trip untouched (`#f6f5f4`, `#f1f0ef`, `#1b1917` all sample back exactly), but saturated
 * colours read back desaturated:
 *
 *   accent  #ec3013  samples as  #de431e
 *   pos     #0f8a5f  samples as  #398861
 *
 * Converting sRGB→P3 reproduces those sampled values (neutrals Δ=0), which is what proves the
 * direction. Sampling a reference and pasting the result here would ship a duller brand red, so the
 * sRGB values below are the correct ones. `scripts/measure.py srgb <hex>` converts a sampled colour
 * back if you need one that isn't already in this file.
 */

export const AccentPresets = {
  vermillion: '#ec3013',
  orange: '#f4551d',
  blue: '#1f6feb',
  green: '#0f8a5f',
} as const;

export const DefaultAccent = AccentPresets.vermillion;

/**
 * Darkens each RGB channel. The 62% default is the accent-tinted gradient (e.g. the Welcome-aboard
 * hero); the payment-link initial disc uses a much shallower 95% → 79% ramp.
 */
export function shadeAccent(hex: string, factor = 0.62): string {
  const n = hex.replace('#', '');
  const r = Math.round(parseInt(n.slice(0, 2), 16) * factor);
  const g = Math.round(parseInt(n.slice(2, 4), 16) * factor);
  const b = Math.round(parseInt(n.slice(4, 6), 16) * factor);
  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * The payment-link initial disc: a shallow vertical ramp, sampled off
 * `design/payment links/home.png` as #e02d12 → #ba2510, i.e. the accent at 95% → 79%.
 */
export function accentDiscGradient(accent: string): [string, string] {
  return [shadeAccent(accent, 0.95), shadeAccent(accent, 0.79)];
}

/**
 * The red on the payment-link delete screens. Sampled off `design/payment links/delete.png` and
 * `delete-2.png` as #ce4330 / #c72a12 — a notch below the accent (#ec3013), which the folder does
 * use at full strength for the `₦` prefix and the "+" button. Derived rather than hard-coded so it
 * still tracks a swapped `AccentPresets` choice.
 */
export function deleteTone(accent: string): string {
  return shadeAccent(accent, 0.86);
}

/**
 * `#ec3013` + 0.13 → `rgba(236, 48, 19, 0.13)`. Used for the tinted icon tiles.
 *
 * Only hex parses. Several theme tokens are already `rgba()`/`rgb()` strings (`mut`, `line`,
 * `accentDeep`) and dark mode leans harder on those, so a non-hex input returns unchanged rather
 * than producing `rgba(NaN, NaN, NaN, …)` — which renders as transparent and is invisible to debug.
 */
/**
 * A tinted panel behind body copy — the rate card on Swap, the resolved-account panel on Send, an
 * info banner's fill.
 *
 * A single alpha cannot serve both schemes: 8% of `#ec3013` over white is a legible blush, but over
 * `#141313` it resolves to `#1c1413` and the panel disappears. Dark needs roughly double the alpha
 * to lift the same distance off its background, so the scheme picks the value.
 */
export function washTint(colour: string, scheme: 'light' | 'dark', strength: 'soft' | 'firm' = 'soft'): string {
  const alpha = scheme === 'dark' ? (strength === 'firm' ? 0.22 : 0.16) : strength === 'firm' ? 0.12 : 0.08;
  return withAlpha(colour, alpha);
}

export function withAlpha(colour: string, alpha: number): string {
  const n = colour.replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(n)) return colour;
  const r = parseInt(n.slice(0, 2), 16);
  const g = parseInt(n.slice(2, 4), 16);
  const b = parseInt(n.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * These are spread over the base palette in `theme.ts`, so `background` and `text` below
 * deliberately override the template's pure `#ffffff`/`#000000` pair: the design's surface is
 * `--bg` (a warm off-black in dark mode, not true black) and its ink is `--fg`.
 *
 * ## The `on*` tokens
 *
 * `onAccent*` and `onPastel` are the same value in both modes, and that is the point. Ink sitting on
 * an accent fill, a card-face gradient or one of the `AvatarTints` pastels does **not** flip with the
 * theme — the fill underneath it does not flip either. They exist so that intent is expressible:
 * before them, every such call site carried a bare `'#ffffff'` or `'#1b1917'`, indistinguishable
 * from a literal that had simply been forgotten.
 *
 * `chip`, `pendingTone`, `scrim` and the `toast*` pair genuinely do invert — see their comments.
 */
export const ExtraColors = {
  light: {
    background: '#ffffff',
    text: '#1b1917',
    card: '#f6f5f4',
    key: '#f1f0ef',
    line: 'rgba(24,20,18,0.09)',
    fg: '#1b1917',
    mut: 'rgba(27,25,23,0.55)',
    wash1: '#fdeee6',
    wash2: '#f0eefb',
    /** Unread rows — the accent at ~6% over the surface (`design/notifications/default.png`). */
    washAccent: '#fef2f0',
    navbg: '#f1f0ef',
    pos: '#0f8a5f',
    neg: '#c62a12',
    accent: DefaultAccent,
    accentDeep: shadeAccent(DefaultAccent),
    onAccent: '#ffffff',
    onAccentSoft: 'rgba(255,255,255,0.78)',
    /** A translucent white chip *on* an accent fill — the rewards icon tile, deposit asset badges. */
    onAccentFill: 'rgba(255,255,255,0.18)',
    onPastel: '#1b1917',
    chip: '#ffffff',
    pendingTone: '#bc622a',
    scrim: 'rgba(0,0,0,0.4)',
    toastSurface: 'rgba(27,25,23,0.94)',
    toastInk: '#ffffff',
  },
  dark: {
    background: '#141313',
    text: '#f5f3f2',
    card: '#1f1e1d',
    key: '#272525',
    line: 'rgba(245,243,242,0.12)',
    fg: '#f5f3f2',
    mut: 'rgba(245,243,242,0.58)',
    wash1: '#2a2320',
    wash2: '#221f24',
    washAccent: '#2b1c19',
    navbg: '#272525',
    pos: '#3ecf8e',
    neg: '#ff6b57',
    accent: DefaultAccent,
    accentDeep: shadeAccent(DefaultAccent),
    onAccent: '#ffffff',
    onAccentSoft: 'rgba(255,255,255,0.78)',
    /** A translucent white chip *on* an accent fill — the rewards icon tile, deposit asset badges. */
    onAccentFill: 'rgba(255,255,255,0.18)',
    onPastel: '#1b1917',
    /** `background` is *darker* than `card`, so a raised chip has to go the other way in dark. */
    chip: '#272525',
    /** Lifted from the light `#bc622a`, which disappears against `#141313`. */
    pendingTone: '#e08c4d',
    scrim: 'rgba(0,0,0,0.6)',
    /** The toast inverts: a light surface with dark ink, so it still reads as an overlay. */
    toastSurface: 'rgba(245,243,242,0.95)',
    toastInk: '#1b1917',
  },
} as const;

/** Per-currency wallet tint (falls back to accent for NGN). */
export const WalletTints: Record<string, string> = {
  NGN: DefaultAccent,
  USD: '#1f6feb',
  GBP: '#7c3aed',
  EUR: '#b45309',
  BTC: '#f7931a',
  USDT: '#0f8a5f',
  USDC: '#2775ca',
};

/** Rotating pastel tints for avatars/category badges. */
/**
 * Card-brand fills for the saved-debit-card rows and the gold of a card chip, sampled from
 * `design/add money/select debit card.png` and `add debit card.png` and converted back to sRGB.
 *
 * Brand colours, so they do not flip with the theme — the mark they fill is a picture of a card.
 */
export const DebitBrandTints: Record<string, string> = {
  Verve: '#118a5f',
  Mastercard: '#b4520a',
  Visa: '#1f6feb',
};

/**
 * The chip on a card face — a top-lit gold, sampled down the chip in
 * `design/add money/select debit card.png` and converted back to sRGB.
 */
export const CardChipGradient = ['#f2d28d', '#dab05c'] as const;

export const AvatarTints = ['#ffe3d8', '#dfe7ff', '#e2f4e6', '#f6e2f4', '#fff0cf'] as const;

/**
 * The account holder's own avatar is a fixed pink everywhere it appears (Home header, Login,
 * Security) rather than one of the hashed pastels — sampled from `design/home/default.png`.
 */
export const UserAvatarTint = '#fbd7de';

export function avatarTintFor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AvatarTints[hash % AvatarTints.length];
}

/**
 * The rewards card on the Security screen — a deep green gradient, distinct from the `pos` green
 * used for incoming amounts. Sampled from `design/security/default-2.png` and converted back to
 * sRGB (it reads as #377958 → #2c6147 in the P3 capture).
 */
export const RewardsGradient = ['#0c7b55', '#0d6345'] as const;

/** Gradient palette for virtual card visuals. */
export const CardGradients = ['#ec3013', '#4338ca', '#0f8a5f', '#b45309', '#1b1917', '#7c3aed'] as const;

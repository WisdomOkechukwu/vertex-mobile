/**
 * Vertex design tokens — corner radius.
 *
 * The mockup exposes a `softness` prop whose **default is "Very round"** (`R = 24`); the other
 * options are "Rounded" (16) and "Crisp" (10). `base` below is that default. The remaining values
 * are the concrete radii used by the mockup's inline styles.
 */
export const Radius = {
  /** softness: Crisp */
  crisp: 10,
  /** softness: Rounded */
  rounded: 16,
  /** softness: Very round — the mockup's default */
  veryRound: 24,
  /** The default `R` the mockup renders with. */
  base: 24,

  /** Text fields and picker triggers. */
  field: 18,
  /** Wallet cards / small tiles. */
  tile: 20,
  /** List + transaction row cards (the dominant surface). */
  card: 22,
  /** Larger tappable cards and banners. */
  cardLg: 24,
  /** Gradient hero panels. */
  hero: 28,
  /** Home header's bottom corners. */
  heroSheet: 36,
  /** Pills, chips, CTAs, progress tracks. */
  pill: 999,
} as const;

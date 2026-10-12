/**
 * Vertex design tokens — screen layout and motion, taken from the mockup's screen-level styles.
 *
 * Screens in the mockup are absolutely positioned inside a fixed 390×844 frame with
 * `padding: 62–70px 22–26px 26–30px`. On device the top value is handled by the safe-area inset
 * plus `Screen.top`, so `Screen.top` is the *additional* space below the inset rather than the
 * mockup's absolute 62px.
 */
export const Screen = {
  /** Horizontal screen padding — the mockup uses 22–26px; 24 is the median and most common. */
  horizontal: 24,
  /**
   * The signed-out flow is the exception: login, sign-up and onboarding all measure 26pt gutters in
   * the references, where every signed-in screen measures 24.
   */
  horizontalAuth: 26,
  /** Extra top space below the safe-area inset before the first header row. */
  top: 12,
  /** Bottom padding on screens without the floating nav. */
  bottom: 26,
  /** Bottom padding on screens that sit under the floating nav (mockup uses 130px). */
  bottomWithNav: 130,
  /** Gap between stacked form fields. */
  fieldGap: 14,
  /** Gap between stacked row cards — measured at 10pt on Home, the history list and Security. */
  rowGap: 10,
} as const;

/**
 * The mockup animates every screen with `cubic-bezier(.2,.9,.3,1)` — a fast-out, settled-in curve.
 * Durations: `vs-in` .30–.42s, `vs-slide` .36–.38s, `vs-bar` .5s.
 */
export const Motion = {
  easing: [0.2, 0.9, 0.3, 1] as const,
  enter: 400,
  slide: 380,
  quick: 300,
  bar: 500,
  /** Between staggered siblings. Small enough that a list of eight still settles inside a second. */
  stagger: 55,
  /** The most a stagger will ever wait, so a long list does not crawl in from the bottom. */
  staggerCap: 340,
} as const;

/**
 * Press feedback, in one place.
 *
 * There used to be six different hardcoded opacities across the primitives — 0.7, 0.75, 0.8, 0.85,
 * 0.86 — and four of them plus a couple of dozen screens had no feedback at all. A tap should feel the
 * same wherever it lands.
 */
export const Press = {
  scale: 0.97,
  dim: 0.72,
  /** Down is quicker than up: the press should feel immediate and the release should settle. */
  inDuration: 90,
  outDuration: 160,
} as const;

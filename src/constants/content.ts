/**
 * Product copy transcribed verbatim from the Claude Design mockup's `SLIDES` and `TOURS` objects,
 * including each panel's art gradient and ink colour. Keeping it here rather than inline in the
 * screens makes it obvious which strings are the design's and which are ours.
 */

export type SlideArt = {
  /** Gradient stops, outermost first, as the design declares them. */
  colors: [string, string];
  /** `radial` panels are the design's `radial-gradient(...)` art. */
  shape: 'linear' | 'radial';
  /** Foreground colour the design pairs with this art. */
  ink: string;
  /**
   * The dark-mode restatement: the same hue taken deep, with the ink lifted to match.
   *
   * These panels are full-bleed and butt straight up against the sheet below them, so leaving the
   * light pastel in place would put a bright band across the top of an otherwise dark screen. There
   * is no dark reference in `/design/`, so these are derived — same hue, inverted lightness.
   *
   * Omitted where the light art is already dark (the radial green slide).
   */
  dark?: { colors: [string, string]; ink: string };
};

/** The art for `scheme`, falling back to the light values when a slide needs no dark restatement. */
export function slideArtFor(art: SlideArt, scheme: 'light' | 'dark'): { colors: [string, string]; ink: string } {
  if (scheme === 'dark' && art.dark) return art.dark;
  return { colors: art.colors, ink: art.ink };
}

export type OnboardingSlide = {
  /** The design breaks each title across two lines with an explicit newline. */
  title: string;
  body: string;
  art: SlideArt;
};

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    title: 'Send money to\nanyone, anywhere',
    body: 'Free between Vertex accounts, flat ₦10 to any Nigerian bank, and on-chain for crypto. Names confirm before you send.',
    art: {
      colors: ['#fde5dc', '#f6cebf'],
      shape: 'linear',
      ink: '#b8210a',
      dark: { colors: ['#31201a', '#241511'], ink: '#ff8f70' },
    },
  },
  {
    title: 'Add money\nin seconds',
    body: 'A dedicated account number, your saved debit cards, or a swap from any wallet you already hold.',
    // Already a dark panel, so it needs no dark restatement.
    art: { colors: ['#2f4a3c', '#17251e'], shape: 'radial', ink: '#ffffff' },
  },
  {
    title: 'Get paid with\na payment link',
    body: 'Share one link and take card or bank payments from anyone. No app needed on their side.',
    art: {
      colors: ['#eae7fb', '#d5cff4'],
      shape: 'linear',
      ink: '#4338ca',
      dark: { colors: ['#211f33', '#191727'], ink: '#9c98ff' },
    },
  },
  {
    title: 'A card for every\ncorner of your life',
    body: 'Spin up a virtual card per merchant, choose its colour, freeze it the moment you are done.',
    art: {
      colors: ['#e7ecf9', '#cdd7ef'],
      shape: 'linear',
      ink: '#1f4faf',
      dark: { colors: ['#181f2e', '#131824'], ink: '#7aa6ff' },
    },
  },
  {
    title: 'Pay a bill without\nleaving the sofa',
    body: 'Electricity, airtime, data, cable and water. Prepaid tokens arrive by SMS in under a minute.',
    art: {
      colors: ['#fdf0d8', '#f7dfae'],
      shape: 'linear',
      ink: '#8a5a12',
      dark: { colors: ['#2c2416', '#211b10'], ink: '#e8b45f' },
    },
  },
  {
    title: 'Earn on money\nyou already spend',
    body: '1% back on every bill and 0.5% on card spend, paid into your wallet on the 15th.',
    art: {
      colors: ['#e2f4e8', '#c4e6d1'],
      shape: 'linear',
      ink: '#0b6c4a',
      dark: { colors: ['#16261e', '#101c16'], ink: '#5fd39f' },
    },
  },
];

export type TourVariant =
  | 'send'
  | 'internal'
  | 'deposit'
  | 'links'
  | 'cards'
  | 'bills'
  | 'loyalty'
  | 'gifts';

/**
 * The hero wash and ink for each tour, sampled from that flow's `onboarding.png` and converted back to
 * sRGB. The ink drives the wordmark, the Skip pill, the dotted texture and the vignette's accents.
 */
export type TourArtTheme = {
  wash: string;
  ink: string;
  /** See `SlideArt.dark` — derived, since `/design/` has no dark captures. */
  dark?: { wash: string; ink: string };
};

/** The hero wash and ink for `scheme`. */
export function tourArtFor(art: TourArtTheme, scheme: 'light' | 'dark'): { wash: string; ink: string } {
  if (scheme === 'dark' && art.dark) return art.dark;
  return { wash: art.wash, ink: art.ink };
}

export type FeatureTour = {
  title: string;
  art: TourArtTheme;
  /** Each point is a bold lead-in plus a supporting line. */
  points: { title: string; body: string }[];
};

export const FEATURE_TOURS: Record<TourVariant, FeatureTour> = {
  send: {
    title: 'Send money to anyone',
    art: { wash: '#fde1d7', ink: '#b8210b', dark: { wash: '#2e1d18', ink: '#ff8f70' } },
    points: [
      { title: 'Pick the wallet you’re sending from', body: 'Naira, dollars, or any of your seven currencies.' },
      { title: 'Enter the recipient', body: 'A Nigerian bank and NUBAN, a bank abroad, or a wallet address for crypto.' },
      { title: 'Review, then confirm with your PIN', body: 'You always see the fee and arrival time before you send.' },
    ],
  },
  internal: {
    title: 'Move between your wallets',
    // No reference exists for this tour; teal keeps it distinct from the card and link heroes.
    art: { wash: '#d9f0f2', ink: '#0e6a78', dark: { wash: '#152628', ink: '#5fd3e0' } },
    points: [
      { title: 'Convert any currency to another', body: 'Naira, dollars, pounds, euros, Bitcoin, USDT and USDC.' },
      { title: 'Live exchange rates', body: 'See the rate and fee before you confirm.' },
      { title: 'Instant, every time', body: 'Funds move between your wallets immediately.' },
    ],
  },
  deposit: {
    title: 'Add money in seconds',
    // No reference exists for this tour either.
    art: { wash: '#fbe4f0', ink: '#a41d64', dark: { wash: '#2b1823', ink: '#ff86bd' } },
    points: [
      { title: 'Your dedicated account number', body: 'Bank transfers credit your NGN wallet instantly.' },
      { title: 'Saved debit cards', body: 'Fund any wallet, including crypto, in one tap.' },
      { title: 'Swap from a wallet you hold', body: 'Convert between currencies at the live rate.' },
    ],
  },
  links: {
    title: 'Get paid with a link',
    art: { wash: '#e5e3fa', ink: '#413dca', dark: { wash: '#1e1d2e', ink: '#9c98ff' } },
    points: [
      { title: 'Create a link in seconds', body: 'Set a fixed amount, or let the payer decide.' },
      { title: 'Share it anywhere', body: 'No app needed on the other side — card or bank works.' },
      { title: 'Track who paid', body: 'See every payer and the total received, live.' },
    ],
  },
  cards: {
    title: 'Virtual cards, on demand',
    art: { wash: '#e2e8f7', ink: '#1a51ae', dark: { wash: '#161d2b', ink: '#7aa6ff' } },
    points: [
      { title: 'Spin one up per merchant', body: 'Give each subscription or store its own card.' },
      { title: 'Choose its colour', body: 'Set it once, when you create the card.' },
      { title: 'Freeze it any time', body: 'One tap stops it being charged, instantly.' },
    ],
  },
  bills: {
    title: 'Pay a bill from the sofa',
    art: { wash: '#fdecd0', ink: '#8b5a13', dark: { wash: '#2a2113', ink: '#e8b45f' } },
    points: [
      { title: 'Electricity, airtime, data, cable, water', body: 'Every provider you need, in one place.' },
      { title: 'Tokens arrive by SMS', body: 'Usually in under a minute.' },
      { title: 'Earn as you pay', body: '1% cashback on every bill, automatically.' },
    ],
  },
  gifts: {
    title: 'Gift cards, paid your way',
    // Violet — the eight tours each take a distinct hue, and this was the gap between the links
    // lavender and the cards blue.
    art: { wash: '#efe0f7', ink: '#6d2a99', dark: { wash: '#251a2d', ink: '#c99cf0' } },
    points: [
      { title: 'Nine brands, instant codes', body: 'Amazon, Apple, Netflix, Steam, Jumia and more.' },
      { title: 'Pay from any wallet', body: 'Naira, dollars or crypto — we convert at the live rate.' },
      { title: 'Codes stay in the app', body: 'Reveal and copy yours whenever you need it.' },
    ],
  },
  loyalty: {
    title: 'Get rewarded for spending',
    art: { wash: '#dcf2e4', ink: '#0e6b4b', dark: { wash: '#152520', ink: '#5fd39f' } },
    points: [
      { title: '1% back on every bill', body: 'Paid straight into your rewards balance.' },
      { title: '0.5% back on card spend', body: 'No enrolment, no minimum.' },
      { title: 'Paid out on the 15th', body: 'Move it to your NGN wallet whenever you like.' },
    ],
  },
};

/**
 * Appearance copy, shared by the "You" tab's Theme row and `/profile/appearance` so the two cannot
 * drift. No reference exists for this — `/design` has no appearance screen — so it follows the
 * grammar of the settings rows that do.
 */
export const THEME_CHOICES = [
  { value: 'system', label: 'System', sublabel: 'Match my device', icon: 'device' },
  { value: 'light', label: 'Light', sublabel: 'Always the light theme', icon: 'eye' },
  { value: 'dark', label: 'Dark', sublabel: 'Always the dark theme', icon: 'eyeOff' },
] as const;

/** The row's own subtitle, which states the effect rather than the option. */
export const THEME_SUBTITLES: Record<'system' | 'light' | 'dark', string> = {
  system: 'Follows your device setting',
  light: 'Always the light theme',
  dark: 'Always the dark theme',
};

/** Compliance strings the design repeats across screens. */
export const COMPLIANCE = {
  short: 'AES-256 encrypted · TLS 1.3 · CBN licensed',
  onboarding: 'Vertex MFB · CBN licensed · NDIC insured to ₦5,000,000',
  pin: 'Vertex will never ask for your PIN by call or message',
  deposits:
    'Vertex MFB is licensed by the Central Bank of Nigeria (RC 1489302) and deposits are insured by the NDIC up to ₦5,000,000 per customer',
} as const;

/**
 * The loyalty copy, verbatim from `design/security/rewards-default.png` and the rewards card on
 * `design/security/default-2.png` — one source so the two screens cannot drift.
 */
export const LOYALTY = {
  tier: 'Silver',
  nextTier: 'Gold',
  earnedThisMonth: 660,
  month: 'August',
  /**
   * The references disagree: `rewards-default.png` says the 1st while `rewards-onboarding.png` and
   * `utility/default.png` both say the 15th. Settled on the 15th, and every surface reads it from
   * here — the four of them used to carry the day as a literal and had already drifted apart.
   */
  payoutDay: '15th',
  toNextTier: 1_520,
  nextTierBlurb: 'Gold lifts card cashback to 2% and drops your transfer fee to zero.',
} as const;

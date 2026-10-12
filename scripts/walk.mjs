/**
 * Walk a money flow end to end against the running web build, clicking the real UI.
 *
 * Dev tooling only. `shoot.mjs` proves a screen renders; this proves the *flow* works — it caught an
 * unformatted amount and a raw ISO date on the receipt that a single screenshot would not have.
 *
 *   node scripts/walk.mjs send      # Send → Amount → Review → PIN → Result
 *   node scripts/walk.mjs bills     # Pay a bill → Amount → Review → PIN → Result (pending receipt)
 *   node scripts/walk.mjs links     # New link → Detail → Share sheet → Pause → PIN → Link deleted
 *   node scripts/walk.mjs internal  # Vertex user → currency → Amount → Review → PIN → Result
 *   node scripts/walk.mjs swap      # Swap → legs → Amount → Confirm → PIN → Result
 *   node scripts/walk.mjs carddeposit # Add money → debit cards → Amount → PIN → pending receipt
 *   node scripts/walk.mjs cardtopup # Cards → Top up sheet → PIN → Result
 *   node scripts/walk.mjs cashback  # Rewards → Move cashback out → PIN → Result
 *   node scripts/walk.mjs giftcard  # Gifts → brand → amount → pay-from → review → PIN → receipt
 *   node scripts/walk.mjs appearance # You → Appearance → Dark → Light → System, preview redrawing
 *   node scripts/walk.mjs twofactor # 2FA method → pairing → code → backup codes → You
 *   node scripts/walk.mjs revoke    # You → Revoke a session → PIN → Session revoked
 *   node scripts/walk.mjs logout    # You → Log out → confirm sheet → onboarding
 *   node scripts/walk.mjs delete    # You → Delete account → reason → PIN → Account deleted
 *
 * Each step is screenshotted to `.shots/walk-<flow>-<n>-<step>.png` and its on-screen text printed,
 * and every console/page error is reported at the end.
 *
 * Env: PORT (default 8200), BASE (default http://localhost:$PORT), SCHEME=dark for dark mode.
 */
import { chromium } from 'playwright';

const PORT = process.env.PORT ?? '8200';
const BASE = process.env.BASE ?? `http://localhost:${PORT}`;
const flow = process.argv[2] ?? 'send';
const SCHEME = process.env.SCHEME === 'dark' ? 'dark' : 'light';

const FLOWS = {
  send: {
    entry: '/(money)/send',
    steps: [
      // The bank picker already defaults to GTBank, so the rail only needs an account number.
      { name: 'recipient', run: (page) => page.getByPlaceholder('10-digit account number').fill('0123456789') },
      { name: 'amount', run: (page) => tap(page, 'Enter amount') },
      { name: 'amount-typed', run: (page) => keypad(page, '50000') },
      { name: 'review', run: (page) => tap(page, 'Continue') },
      { name: 'pin', run: (page) => tap(page, 'Confirm with PIN') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  links: {
    entry: '/links',
    steps: [
      { name: 'new', run: (page) => tap(page, 'Create a payment link') },
      {
        name: 'filled',
        run: async (page) => {
          await page.getByPlaceholder('Design retainer, Ankara dress, event ticket…').fill('Studio session');
          await page.getByPlaceholder('0', { exact: true }).fill('75000');
        },
      },
      { name: 'detail', run: (page) => tap(page, 'Create link') },
      { name: 'share', run: (page) => tap(page, 'Share') },
      // The sheet has no labelled close, so dismiss it by tapping the backdrop above it.
      { name: 'paused', run: async (page) => { await page.mouse.click(195, 90); await page.waitForTimeout(500); await tap(page, 'Pause'); } },
      { name: 'pin', run: (page) => tap(page, 'Delete') },
      { name: 'deleted', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  bills: {
    entry: '/(tabs)/bills',
    steps: [
      { name: 'amount', run: (page) => tap(page, 'Enter amount') },
      { name: 'amount-typed', run: (page) => keypad(page, '50000') },
      { name: 'review', run: (page) => tap(page, 'Review payment') },
      { name: 'pin', run: (page) => tap(page, 'Confirm and pay') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  internal: {
    entry: '/(money)/internal-transfer/recipient',
    steps: [
      { name: 'tag', run: (page) => page.getByPlaceholder('@nkem, 0801 234 5678 or 8012345678').fill('tundeb') },
      { name: 'amount', run: (page) => tap(page, 'Enter amount') },
      // The pair now lives here, beside the figures it governs. Tapping a leg's *label* takes the
      // caret; tapping its currency block opens the picker.
      { name: 'from-sheet', run: (page) => page.getByLabel('Change You send currency').click() },
      { name: 'usdc', run: (page) => tap(page, 'USD Coin · $85.00') },
      { name: 'amount-typed', run: (page) => keypad(page, '42.5') },
      { name: 'review', run: (page) => tap(page, 'Review transfer') },
      { name: 'pin', run: (page) => tap(page, 'Confirm with PIN') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  swap: {
    entry: '/(money)/swap',
    steps: [
      { name: 'amount-typed', run: (page) => keypad(page, '50000') },
      // Tap the receive leg and type into it, proving both legs take the keypad.
      { name: 'receive-focused', run: (page) => tap(page, 'You receive') },
      { name: 'receive-typed', run: (page) => keypad(page, '5') },
      // The CTA restates the pay side, which the receive-leg edit has just moved — match its prefix
      // rather than pinning the walk to a figure that is a rate away from changing.
      { name: 'review', run: (page) => tapStartingWith(page, 'Swap ₦') },
      { name: 'pin', run: (page) => tap(page, 'Confirm with PIN') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  carddeposit: {
    entry: '/(money)/deposit',
    steps: [
      { name: 'cards', run: (page) => tap(page, 'My debit cards') },
      { name: 'amount', run: (page) => tap(page, 'Top up with this card') },
      { name: 'amount-typed', run: (page) => keypad(page, '25') },
      { name: 'pin', run: (page) => tap(page, 'Charge my card') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  cardtopup: {
    entry: '/cards',
    steps: [
      { name: 'sheet', run: (page) => tap(page, 'Top up') },
      { name: 'amount', run: (page) => tap(page, '$50') },
      // `design/virtual card/fund-2.png`: the wallet picker layers over the top-up sheet. The two
      // steps after it are the point — the sheet is still there, and $50 is still in it.
      { name: 'fund-picker', run: (page) => tap(page, 'Fund it from') },
      { name: 'fund-picked', run: (page) => tap(page, 'EUR wallet') },
      { name: 'pin', run: (page) => tap(page, 'Top up $50') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  appearance: {
    entry: '/profile/appearance',
    steps: [
      // The preview is a miniature of Home rendered in the *chosen* scheme, so each tap redraws it.
      { name: 'dark', run: (page) => tap(page, 'Dark') },
      { name: 'light', run: (page) => tap(page, 'Light') },
      { name: 'system', run: (page) => tap(page, 'System') },
    ],
  },
  giftcard: {
    entry: '/gifts',
    steps: [
      { name: 'brand', run: (page) => tap(page, 'Netflix') },
      { name: 'denomination', run: (page) => tap(page, '$50') },
      // Pay for a dollar card out of the naira wallet — the point of "any currency".
      { name: 'pay-from', run: (page) => tap(page, 'NGN wallet') },
      { name: 'usdc', run: (page) => tap(page, 'USDC wallet') },
      { name: 'review', run: (page) => tapStartingWith(page, 'Buy for ') },
      { name: 'pin', run: (page) => tap(page, 'Confirm with PIN') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  twofactor: {
    entry: '/security/two-factor-setup/method',
    steps: [
      { name: 'pairing', run: (page) => tap(page, 'Continue') },
      { name: 'confirm', run: (page) => tap(page, 'I have scanned it') },
      { name: 'backup-codes', run: (page) => keypad(page, '481920', 1500) },
      { name: 'profile', run: (page) => tap(page, 'Done').then(() => page.waitForTimeout(1200)) },
    ],
  },
  revoke: {
    entry: '/profile',
    steps: [
      { name: 'revoke-pin', run: async (page) => { await scrollToEnd(page); await tap(page, 'Revoke'); } },
      { name: 'revoked', run: (page) => keypad(page, '1234', 2500) },
      { name: 'profile', run: (page) => tap(page, 'Back to security').then(() => page.waitForTimeout(1200)) },
    ],
  },
  cashback: {
    entry: '/cashback',
    steps: [
      { name: 'sheet', run: (page) => tap(page, 'Move to main wallet') },
      { name: 'amount', run: (page) => tap(page, '50%') },
      { name: 'pin', run: (page) => tap(page, 'Move ₦1,740') },
      { name: 'result', run: (page) => keypad(page, '1234', 2500) },
    ],
  },
  logout: {
    entry: '/profile',
    steps: [
      { name: 'sheet', run: async (page) => { await scrollToEnd(page); await tap(page, 'Log out'); } },
      // Two "Log out" nodes exist once the sheet is open — the row and the sheet's CTA.
      { name: 'onboarding', run: (page) => visible(page, 'Log out').click().then(() => page.waitForTimeout(2000)) },
    ],
  },
  delete: {
    entry: '/profile',
    steps: [
      { name: 'reason', run: async (page) => { await scrollToEnd(page); await tap(page, 'Delete account'); } },
      { name: 'reason-picked', run: (page) => tap(page, 'I am switching to another app') },
      { name: 'pin', run: (page) => tap(page, 'Continue') },
      { name: 'deleted', run: (page) => keypad(page, '1234', 3000) },
      { name: 'onboarding', run: (page) => tap(page, 'Back to start').then(() => page.waitForTimeout(1500)) },
    ],
  },
};

/** react-native-web scrolls an inner element, so reach the foot of a screen through that. */
async function scrollToEnd(page) {
  await page.evaluate(() => {
    const scrollers = Array.from(document.querySelectorAll('*')).filter(
      (el) => el.scrollHeight > el.clientHeight + 8 && /auto|scroll/.test(getComputedStyle(el).overflowY)
    );
    const target = scrollers.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (target) target.scrollTop = target.scrollHeight;
  });
  await page.waitForTimeout(500);
}

/** expo-router keeps prior screens mounted, so always target the one actually on screen. */
const visible = (page, text) => page.getByText(text, { exact: true }).locator('visible=true').last();
const tap = (page, text) => visible(page, text).click();
/** For CTAs whose label carries a live figure — "Swap ₦50,011.14 to USDC". */
const tapStartingWith = (page, prefix) =>
  page.getByText(new RegExp(`^${prefix}`)).locator('visible=true').last().click();

async function keypad(page, digits, settle = 0) {
  for (const d of digits) {
    await visible(page, d).click();
    await page.waitForTimeout(100);
  }
  if (settle) await page.waitForTimeout(settle);
}

const spec = FLOWS[flow];
if (!spec) {
  console.error(`unknown flow "${flow}" — expected one of: ${Object.keys(FLOWS).join(', ')}`);
  process.exit(1);
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: SCHEME });

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

const session = {
  accessToken: 'walk',
  refreshToken: 'walk',
  expiresAt: Date.now() + 3_600_000,
  user: {
    id: 'u_1', profileName: 'Adaeze', profileTag: 'adaeze', fullName: 'Adaeze Okonkwo',
    phone: '801 234 5678', email: 'adaeze@mail.com', avatarInitials: 'AO', tier: 'Tier 1', cashbackBalance: 3480,
  },
};
await page.addInitScript(([s, scheme]) => {
  window.localStorage.setItem('vertex.session', s);
  window.localStorage.setItem('vertex.theme', scheme);
  window.localStorage.setItem(
    'vertex.seen_tours',
    JSON.stringify(['send', 'internal', 'deposit', 'links', 'cards', 'bills', 'loyalty', 'gifts'])
  );
}, [JSON.stringify(session), SCHEME]);

const shot = async (i, name) => {
  await page.waitForTimeout(1000);
  const suffix = SCHEME === 'dark' ? '-dark' : '';
  await page.screenshot({ path: `.shots/walk-${flow}-${i}-${name}${suffix}.png` });
  const text = (await page.locator('#root').innerText()).replace(/\n+/g, ' | ').slice(0, 160);
  console.log(`[${i} ${name}] ${new URL(page.url()).pathname}  ${text}`);
};

await page.goto(`${BASE}${spec.entry}`, { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForFunction(() => (document.getElementById('root')?.innerText ?? '').trim().length > 0, { timeout: 30_000 });
await shot(0, 'entry');

for (const [i, step] of spec.steps.entries()) {
  await step.run(page);
  await shot(i + 1, step.name);
}

await browser.close();
console.log(errors.length ? `PAGE ERRORS (${errors.length}):\n  - ${errors.slice(0, 10).join('\n  - ')}` : 'no page errors');

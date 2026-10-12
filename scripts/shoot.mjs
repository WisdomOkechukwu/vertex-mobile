/**
 * Screenshot the running app so a build can be compared against `/design`.
 *
 * Dev tooling only — never imported by the app. The web build is a proxy for native: it catches
 * layout, colour, copy and structure, but fonts and shadows render slightly differently, so device
 * sign-off still matters.
 *
 *   node scripts/shoot.mjs <route> [outName]
 *   node scripts/shoot.mjs /            home
 *   node scripts/shoot.mjs /cards       cards
 *
 * Signed in by default, because most screens sit behind the auth gate. The session is seeded into
 * the same `localStorage` key the web build's storage fallback reads, so the app boots through its
 * real hydration path rather than a special-case bypass. Pass ANON=1 for the signed-out screens.
 *
 * Env: PORT (default 8200), BASE (default http://localhost:$PORT), SCHEME=dark for dark mode,
 * FULL=1 full-page, ANON=1 signed out, WAIT=<ms> settle delay (default 2500; lower it for screens that auto-advance),
 * TOURS=1 leave the first-run feature tours unseen (they are pre-dismissed by default),
 * SCROLL=<pt> scroll the tallest scroll container down before capturing (FULL=1 does not help —
 * react-native-web scrolls an inner element, so the page itself is never taller than the viewport).
 */
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const PORT = process.env.PORT ?? '8200';
const BASE = process.env.BASE ?? `http://localhost:${PORT}`;
const OUT_DIR = path.resolve('.shots');

// The design references are 390pt-wide phone screens.
const VIEWPORT = { width: 390, height: 844 };

// Dark mode has no reference in `/design/`, so it is verified by inspection — but it still has to be
// capturable. `SCHEME=dark` flips both the emulated OS preference and the app's own stored choice.
const SCHEME = process.env.SCHEME === 'dark' ? 'dark' : 'light';

const route = process.argv[2] ?? '/';
const name = process.argv[3] ?? (route === '/' ? 'home' : route.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, ''));

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: VIEWPORT,
  deviceScaleFactor: 2,
  colorScheme: SCHEME,
});

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(String(e)));

if (process.env.ANON !== '1') {
  // Mirrors MOCK_USER so the seeded session matches what the mock API would return.
  const session = {
    accessToken: 'shoot_access',
    refreshToken: 'shoot_refresh',
    expiresAt: Date.now() + 3_600_000,
    user: {
      id: 'u_1',
      profileName: 'Adaeze',
      profileTag: 'adaeze',
      fullName: 'Adaeze Okonkwo',
      phone: '801 234 5678',
      email: 'adaeze@mail.com',
      avatarInitials: 'AO',
      tier: 'Tier 1',
      cashbackBalance: 3480,
    },
  };
  // Feature screens push their tour on first visit, and every Playwright context starts with empty
  // storage — so mark them all seen unless the caller is deliberately shooting a tour.
  if (process.env.TOURS !== '1') {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        'vertex.seen_tours',
        JSON.stringify(['send', 'internal', 'deposit', 'links', 'cards', 'bills', 'loyalty', 'gifts'])
      );
    });
  }

  await page.addInitScript((s) => {
    window.localStorage.setItem('vertex.session', s);
    window.localStorage.setItem('vertex.biometric_enabled', '1');
  }, JSON.stringify(session));
}

// Pin the app's own preference too, not just the emulated OS one, so the capture is deterministic
// whichever way the stored preference happens to be left.
await page.addInitScript((scheme) => {
  window.localStorage.setItem('vertex.theme', scheme);
}, SCHEME);

await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle', timeout: 60_000 });

// The root layout renders null until fonts load and the auth store hydrates, and the mock API adds
// 400-900ms of latency on top — so wait for real content, not just for the network to settle.
await page
  .waitForFunction(() => (document.getElementById('root')?.innerText ?? '').trim().length > 0, { timeout: 30_000 })
  .catch(() => {});
// Some screens advance on a timer (splash redirects after 1.9s) — shorten the settle for those.
await page.waitForTimeout(Number(process.env.WAIT ?? 2500));

if (process.env.SCROLL) {
  const dy = Number(process.env.SCROLL);
  await page.evaluate((amount) => {
    const scrollers = Array.from(document.querySelectorAll('*')).filter(
      (el) => el.scrollHeight > el.clientHeight + 8 && /auto|scroll/.test(getComputedStyle(el).overflowY)
    );
    const target = scrollers.sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
    if (target) target.scrollTop = amount;
  }, dy);
  await page.waitForTimeout(400);
}

await mkdir(OUT_DIR, { recursive: true });
const file = path.join(OUT_DIR, `${name}.png`);
await page.screenshot({ path: file, fullPage: process.env.FULL === '1' });

await browser.close();

console.log(`shot: ${file}`);
if (errors.length) {
  console.log(`page errors (${errors.length}):`);
  for (const e of errors.slice(0, 10)) console.log(`  - ${e}`);
}

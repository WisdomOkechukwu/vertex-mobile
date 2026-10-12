# Design Reference

UI screenshots live in `/design/`.

## Folder & naming convention

This is a **mobile app**, so there are no desktop/tablet breakpoints — every reference is a 390pt-wide
phone screen.

- Each subfolder under `/design/` = one **flow**, not a single route:
  `home/`, `login/`, `splash/`, `signup/`, `onboarding/`, `send money/`, `add money/`,
  `vertex transfer/`, `utility/` (bill payment), `virtual card/`, `payment links/`, `security/`,
  `notifications/`.
- Each filename = one **screen or state** inside that flow, named for what it shows:
  - `default.png` — the flow's main screen
  - step/state names: `pin.png`, `reciept.png`, `review-payment.png`, `provider.png`
  - numbered steps: `page-1.png`, `send-btc-1.png`, `verification-2 on click of the nin and bvn.png`
  - `on click of X.png` — the state after tapping X
  - `onboarding.png` inside a feature folder = that feature's **first-run tour**, not signup
- Flow → route mapping is in the plan file; `security/` renders at `(tabs)/profile` (the screen is
  titled "Security" but its tab reads "You"), and `utility/` is the bills flow.

## Colour: read the source values, not the pixels, for saturated colours

The `/design` PNGs are **Display-P3 captures of sRGB-authored colours**. Greys round-trip exactly, but
saturated colours sample back desaturated — the brand red `#ec3013` reads as `#de431e`, and the green
`#0f8a5f` reads as `#398861`. Pasting a sampled value into the code ships a duller brand.

Use `.venv/bin/python scripts/measure.py srgb <sampled-hex>` to convert a sample back to sRGB, and
prefer the values already in `src/constants/colors.ts`.

## Before building or modifying any screen
1. View the matching screenshot(s) in `/design/<page>/` for that screen — check every breakpoint/state file present, not just one.
2. Match layout, spacing, colors, typography, and component placement as closely as possible.
3. If both mobile and desktop versions exist, implement both responsively in a single component (not separate pages) unless the codebase pattern says otherwise.
4. Map filenames to the exact route/component being built — if a folder is `/design/settings/`, it corresponds to the settings route, not a subcomponent, unless nested folders say otherwise.
5. After building, take a screenshot of the running app and visually compare it to the reference before considering the task done. Do not mark the task complete on code correctness alone — visual match is part of "done."

## Fidelity rules
- Colors: match exactly (inspect the screenshot's pixel values if unsure — don't eyeball).
- Spacing/layout: match closely; approximate is acceptable within a few px.
- Fonts: match weight/style family; exact font file isn't critical unless specified in the design system.
- Copy/text: use the exact text shown in the screenshot unless placeholder content is obviously intended.

# Self-Verification

Tooling is already set up — use it rather than rolling something new:

- `npx expo start --web --port 8200` — the harness expects port 8200.
- `node scripts/shoot.mjs <route> [name]` — screenshots the running app at 390×844 into `.shots/`.
  Signed in by default (it seeds a session into the storage key the web fallback reads); pass
  `ANON=1` for signed-out screens, `FULL=1` for full-page, `SCROLL=<pt>` to scroll below the fold
  (react-native-web scrolls an inner element, so `FULL=1` never captures it), `TOURS=1` to leave the
  first-run feature tours undismissed.
- `node scripts/walk.mjs <send|bills>` — clicks a whole money flow (entry → amount → review → PIN →
  receipt), screenshots every step and reports page errors. `shoot.mjs` proves a screen renders; this
  proves the flow works.
- `.venv/bin/python scripts/measure.py <cmd>` — `pick`/`palette`/`row`/`col`/`find`/`info`/`srgb`
  for sampling exact colours and measuring spacing off a reference.

After implementing a screen:
1. Start the dev server and wait until it is ready.
2. Screenshot the route with `shoot.mjs`. **Check its reported page errors** — a screenshot can look
   fine while the console is throwing.
3. View your screenshot and the `/design/<flow>/` reference together.
4. List concrete mismatches (spacing, colour, missing elements) rather than a vague pass/fail.
   Measure with `measure.py` instead of eyeballing.
5. Fix and re-screenshot. Repeat until the mismatch list is empty.
6. Only then mark the task complete.

Two things the web screenshots will always differ on, which are **not** bugs: the web viewport has no
status-bar safe-area inset, so content sits ~47pt higher than the references; and shadows/font
smoothing render slightly differently from native. Device sign-off stays with the user.

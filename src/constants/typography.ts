/**
 * Vertex design tokens — typography.
 *
 * Every value here is lifted from the `font:` shorthands in the Claude Design mockup
 * (`Vertex Soft.dc.html`), then checked against the `/design` captures: each string was rasterised
 * from the app's own Archivo TTFs at 4x and template-matched over weight x size x tracking. The
 * design system pairs "Archivo" for both the heading and body roles (see the design system's
 * `styles.css`), so the two roles differ only by weight: headings run at **800**, body text at
 * **400** with 600 for emphasis and 700/800 for numerals. Since React Native selects a custom font
 * by family name rather than by `fontWeight`, each weight maps to its own loaded family via
 * `archivo()` — do NOT add `fontWeight` alongside these, it would fight the family selection.
 *
 * Letter-spacing in the mockup is expressed in `em`; RN wants absolute units, so each value below is
 * the em value multiplied by its own font size.
 */

import { TextStyle } from 'react-native';

import { archivo } from '@/constants/fonts';

export type TypographyVariant =
  // headings (heading role, weight 800)
  | 'balance' // 800 40px/1  -.035em — Home account balance
  | 'display' // 800 34px/1  -.03em  — receipt figure
  | 'amountFigure' // 800 36px/1 -.035em — amount-entry figure, transaction-detail figure
  | 'amountSymbol' // 800 26px/1        — amount-entry currency symbol
  | 'artFigure' // 800 30px/1 -.03em — figure inside a marketing vignette
  | 'artSymbol' // 800 22px/1        — its currency symbol
  | 'screenTitle' // 800 28px/1.2 -.01em — screen titles ("Let's open your account")
  | 'slideTitle' // 800 26px/1.25 -.035em — onboarding slide headline (wraps to 2 lines)
  | 'stepHeader' // 800 24px/1.2 -.035em — secondary titles
  | 'logoWord' // 800 30px/1   -.02em — the splash wordmark
  | 'greeting' // 800 19px/1.2 -.02em — "Hello, {name}", transaction-detail name
  | 'sectionHeader' // 800 16.5px/1 -.01em — the centred nav title on a pushed screen
  | 'sectionLabel' // 800 15.5px/1 -.02em — an in-page section heading ("Sign-in", "Wallets")
  | 'tileValue' // 800 16px/1   -.02em — wallet-tile balance
  | 'statValue' // 800 24px/1   -.035em — Funded / Spent figures
  | 'cardTitle' // 800 15px/1   -.01em — card titles
  | 'alertTitle' // 800 13.5px/1 -.01em — the title line of an alert banner
  | 'codeLabel' // 800 13px/1   -.02em — currency code on a wallet tile
  | 'cardNumber' // 800 17px/1 .06em — the masked PAN on a card face
  | 'keypadDigit' // 800 22px/1        — a keypad key
  | 'tabLabel' // 800 13px/1   -.01em — active bottom-nav label
  | 'button' // 800 16px/1  -.035em — primary CTA
  // body role
  | 'inputText' // 600 15px/1          — text-field value
  | 'listTitle' // 700 14px/1.43 -.01em — dense list-card titles (notifications)
  | 'rowTitle' // 600 14px/1.2        — list / transaction row name
  | 'amountValue' // 800 14px/1  -.01em  — row-trailing amount
  | 'buttonGhost' // 600 14px/1          — secondary CTA
  | 'bodyLg' // 400 13px/1.6        — screen subtitles
  | 'labelStrong' // 600 12px/1          — "See all", chips, inline actions
  | 'microStrong' // 600 11px/1       — status-pill labels, history day headers
  | 'label' // 400 12px/1.4        — labels / captions
  | 'body' // 400 11.5px/1.4      — the dominant body size
  | 'fieldLabel' // 600 12px/1          — text-field labels and inline text actions
  | 'micro' // 400 11px/1.3        — row meta
  | 'nano'; // 400 10px/1          — smallest meta

export const Typography: Record<TypographyVariant, TextStyle> = {
  balance: { fontFamily: archivo('800'), fontSize: 40, lineHeight: 40, letterSpacing: -1.4 },
  display: { fontFamily: archivo('800'), fontSize: 34, lineHeight: 34, letterSpacing: -1.02 },
  amountFigure: { fontFamily: archivo('800'), fontSize: 36, lineHeight: 36, letterSpacing: -1.26 },
  amountSymbol: { fontFamily: archivo('800'), fontSize: 26, lineHeight: 26 },
  artFigure: { fontFamily: archivo('800'), fontSize: 30, lineHeight: 30, letterSpacing: -0.9 },
  artSymbol: { fontFamily: archivo('800'), fontSize: 22, lineHeight: 22 },
  screenTitle: { fontFamily: archivo('800'), fontSize: 28, lineHeight: 33.6, letterSpacing: -0.28 },
  slideTitle: { fontFamily: archivo('800'), fontSize: 26, lineHeight: 32.5, letterSpacing: -0.91 },
  stepHeader: { fontFamily: archivo('800'), fontSize: 24, lineHeight: 28.8, letterSpacing: -0.84 },
  logoWord: { fontFamily: archivo('800'), fontSize: 30, lineHeight: 30, letterSpacing: -0.6 },
  greeting: { fontFamily: archivo('800'), fontSize: 19, lineHeight: 22.8, letterSpacing: -0.38 },
  sectionHeader: { fontFamily: archivo('800'), fontSize: 16.5, lineHeight: 16.5, letterSpacing: -0.165 },
  sectionLabel: { fontFamily: archivo('800'), fontSize: 15.5, lineHeight: 15.5, letterSpacing: -0.31 },
  tileValue: { fontFamily: archivo('800'), fontSize: 16, lineHeight: 16, letterSpacing: -0.32 },
  statValue: { fontFamily: archivo('800'), fontSize: 24, lineHeight: 24, letterSpacing: -0.84 },
  cardTitle: { fontFamily: archivo('800'), fontSize: 15, lineHeight: 15, letterSpacing: -0.15 },
  alertTitle: { fontFamily: archivo('800'), fontSize: 13.5, lineHeight: 13.5, letterSpacing: -0.135 },
  codeLabel: { fontFamily: archivo('800'), fontSize: 13, lineHeight: 13, letterSpacing: -0.26 },
  cardNumber: { fontFamily: archivo('800'), fontSize: 17, lineHeight: 17, letterSpacing: 1.02 },
  keypadDigit: { fontFamily: archivo('800'), fontSize: 22, lineHeight: 22 },
  tabLabel: { fontFamily: archivo('800'), fontSize: 13, lineHeight: 13, letterSpacing: -0.13 },
  button: { fontFamily: archivo('800'), fontSize: 16, lineHeight: 16, letterSpacing: -0.56 },

  inputText: { fontFamily: archivo('600'), fontSize: 15, lineHeight: 15 },
  listTitle: { fontFamily: archivo('700'), fontSize: 14, lineHeight: 20, letterSpacing: -0.14 },
  rowTitle: { fontFamily: archivo('600'), fontSize: 14, lineHeight: 16.8 },
  amountValue: { fontFamily: archivo('800'), fontSize: 14, lineHeight: 14, letterSpacing: -0.14 },
  buttonGhost: { fontFamily: archivo('600'), fontSize: 14, lineHeight: 14 },
  bodyLg: { fontFamily: archivo('400'), fontSize: 13, lineHeight: 20.8 },
  labelStrong: { fontFamily: archivo('600'), fontSize: 12, lineHeight: 12 },
  microStrong: { fontFamily: archivo('600'), fontSize: 11, lineHeight: 11 },
  label: { fontFamily: archivo('400'), fontSize: 12, lineHeight: 16.8 },
  body: { fontFamily: archivo('400'), fontSize: 11.5, lineHeight: 16.1 },
  fieldLabel: { fontFamily: archivo('600'), fontSize: 12, lineHeight: 12 },
  micro: { fontFamily: archivo('400'), fontSize: 11, lineHeight: 14.3 },
  nano: { fontFamily: archivo('400'), fontSize: 10, lineHeight: 10 },
};

/**
 * Line-icon path data, 24x24 viewBox, ported/approximated from the design's hand-drawn `ICONS` map
 * (~1.7-2.4px stroke, round caps, no fill). Add new names here as screens need them.
 */
export const IconPaths: Record<string, string[]> = {
  send: ['M4 20 20 4', 'M20 4 20 11', 'M20 4 13 4'],
  recv: ['M20 4 4 20', 'M4 20 4 13', 'M4 20 11 20'],
  plus: ['M12 5v14', 'M5 12h14'],
  minus: ['M5 12h14'],
  grid: ['M4 4h7v7H4z', 'M13 4h7v7h-7z', 'M4 13h7v7H4z', 'M13 13h7v7h-7z'],
  home: ['M4 11 12 4l8 7', 'M6 10v9h12v-9'],
  card: ['M3 7h18v12H3z', 'M3 11h18'],
  bills: ['M6 3h12v18l-3-2-3 2-3-2-3 2z', 'M9 8h6', 'M9 12h6'],
  user: ['M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z', 'M4 20c1.5-4 5-6 8-6s6.5 2 8 6'],
  bank: ['M3 10 12 4l9 6', 'M5 10v9', 'M19 10v9', 'M9 10v9', 'M15 10v9', 'M3 21h18'],
  phone: ['M8 3h8v18H8z', 'M11 18h2'],
  bolt: ['M13 3 5 14h6l-1 7 8-11h-6z'],
  wifi: ['M2 9c6-5 14-5 20 0', 'M5.5 13c4-3 9-3 13 0', 'M9 17c2-1.5 4-1.5 6 0', 'M12 20.5v.01'],
  tv: ['M3 5h18v12H3z', 'M9 21h6', 'M12 17v4'],
  water: ['M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z'],
  globe: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z', 'M3 12h18', 'M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z'],
  face: ['M6 8V6a6 6 0 0 1 12 0v2', 'M6 16v2a6 6 0 0 0 12 0v-2', 'M6 5v2', 'M18 5v2', 'M6 17v2', 'M18 17v2', 'M9 11v2', 'M15 11v2', 'M10 16c.7.6 1.3.9 2 .9s1.3-.3 2-.9'],
  lock: ['M6 11h12v9H6z', 'M8 11V7a4 4 0 1 1 8 0v4'],
  bell: ['M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 2 6.5H4c.5-1 2-2.5 2-6.5z', 'M10 19a2 2 0 0 0 4 0'],
  shield2: ['M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9 12l2 2 4-4'],
  shieldAlert: ['M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M12 8v4', 'M12 15.6h.01'],
  /** A shield struck through — `design/security/revoke-session-a.png` crosses it out, not warns. */
  shieldX: ['M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M9.5 9.5l5 5', 'M14.5 9.5l-5 5'],
  // A proper chain link — the Request action's glyph. The previous path read as a loose squiggle.
  link: [
    'M10.6 13.4a5 5 0 0 0 7.1 0l2.8-2.8a5 5 0 0 0-7.1-7.1l-1.4 1.4',
    'M13.4 10.6a5 5 0 0 0-7.1 0l-2.8 2.8a5 5 0 0 0 7.1 7.1l1.4-1.4',
  ],
  keypad: ['M6 6h.01', 'M12 6h.01', 'M18 6h.01', 'M6 12h.01', 'M12 12h.01', 'M18 12h.01', 'M6 18h.01', 'M12 18h.01', 'M18 18h.01'],
  chevronDown: ['M6 9l6 6 6-6'],
  chevronRight: ['M9 6l6 6-6 6'],
  chevronLeft: ['M15 6l-6 6 6 6'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  check: ['M5 13l4 4 10-10'],
  eye: ['M2 12c2.5-4.5 6.5-7 10-7s7.5 2.5 10 7c-2.5 4.5-6.5 7-10 7s-7.5-2.5-10-7z', 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z'],
  eyeOff: ['M3 3l18 18', 'M9.9 5.1A10.6 10.6 0 0 1 12 5c3.5 0 7.5 2.5 10 7-1 1.8-2.2 3.3-3.5 4.4', 'M6.5 6.6C4.9 7.9 3.6 9.7 2 12c2.5 4.5 6.5 7 10 7 1.1 0 2.2-.2 3.3-.6', 'M9.5 10.5a3 3 0 0 0 4 4'],
  copy: ['M9 9h11v11H9z', 'M5 15V4h11'],
  // Viewfinder — four corner brackets, no crossbar (the header scan button).
  scan: ['M4 9V5a1 1 0 0 1 1-1h4', 'M15 4h4a1 1 0 0 1 1 1v4', 'M20 15v4a1 1 0 0 1-1 1h-4', 'M9 20H5a1 1 0 0 1-1-1v-4'],
  search: ['M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z', 'M21 21l-4.3-4.3'],
  filter: ['M4 5h16', 'M7 12h10', 'M10 19h4'],
  menu: ['M5 8h14', 'M5 12h14', 'M5 16h14'],
  // Backspace — the tag-shaped delete key on the keypad.
  backspace: ['M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7z', 'M12 10l4 4', 'M16 10l-4 4'],
  info: ['M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z', 'M12 11v5', 'M12 8v.4'],
  camera: ['M4 8h3l2-3h6l2 3h3v11H4z', 'M12 18a4 4 0 1 0 0-8 4 4 0 0 0 0 8z'],
  gift: ['M4 9h16v11H4z', 'M2 9h20v4H2z', 'M12 9v11', 'M12 9C9 9 8 7 8 5.5A2.5 2.5 0 0 1 12 4c0 2-1 5-0 5', 'M12 9c3 0 4-2 4-3.5A2.5 2.5 0 0 0 12 4'],
  shield: ['M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z'],
  arrowRight: ['M5 12h13', 'M12 6l6 6-6 6'],
  arrowUpRight: ['M6 18 18 6', 'M9 6h9v9'],
  arrowDownLeft: ['M18 6 6 18', 'M15 18H6V9'],
  logout: ['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9'],
  settings: ['M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z', 'M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.6c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z'],
  device: ['M5 4h14v13H5z', 'M9 20h6'],
  /** A physical security key — the third 2FA method on `design/security/2fa-1.png`. */
  key: ['M15.5 8.5a3.5 3.5 0 1 0-3.4 4.4L7 18v3h3l1-1v-2h2v-2h1.6a3.5 3.5 0 0 0 .9-7.5z', 'M16.6 7.4h.01'],
  /** SMS — the speech bubble the same reference sets against "SMS code". */
  message: ['M4 5h16v11H9l-5 4z'],
  /**
   * A card with a bow — gift *cards*. The plain `gift` glyph is already the rewards/cashback mark
   * (`cashback/index.tsx`, `sign-up/welcome.tsx`), so reusing it would collide.
   */
  giftCard: ['M3 8h18v11H3z', 'M3 8h18v3H3z', 'M12 8v11', 'M12 8c-2 0-3-1.2-3-2.4A1.8 1.8 0 0 1 12 5.4', 'M12 8c2 0 3-1.2 3-2.4A1.8 1.8 0 0 0 12 5.4'],
  /** The rotating-code ring on `design/security/2fa-3.png`. */
  refresh: ['M20 12a8 8 0 1 1-2.4-5.7', 'M20 4v4h-4'],
  download: ['M12 3v13', 'M7 11l5 5 5-5', 'M5 21h14'],
  upload: ['M12 21V8', 'M7 13l5-5 5 5', 'M5 3h14'],
  clock: ['M12 21a9 9 0 100-18 9 9 0 000 18z', 'M12 7v5l3.2 1.9'],
  pin: ['M12 3a6 6 0 0 1 6 6c0 4.5-6 12-6 12S6 13.5 6 9a6 6 0 0 1 6-6z', 'M12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'],
  swap: ['M4 9h14l-3.5-3.5', 'M20 15H6l3.5 3.5'],
  // Vertical exchange arrows — the swap screen's flip button.
  swapVertical: ['M9 4v16l-3.5-3.5', 'M15 20V4l3.5 3.5'],
  /** Bills tab — the design uses a bookmark/receipt outline. */
  bookmark: ['M6 4h12v17l-6-4-6 4z'],
  star: ['M12 4l2.4 5.2 5.6.7-4.1 3.9 1.1 5.6-5-2.8-5 2.8 1.1-5.6L4 9.9l5.6-.7z'],
  /** Freeze — the six-point asterisk on the cards screen. */
  freeze: ['M12 3v18', 'M4.2 7.5l15.6 9', 'M19.8 7.5l-15.6 9'],
  /** Destructive actions — the payment-link delete badge. Lid, can, and two tick marks. */
  trash: ['M4 7h16', 'M10 4h4', 'M6 7l1 13h10l1-13', 'M10 11v6', 'M14 11v6'],
  /** Edit — the pencil on the payment-link detail header. */
  pencil: ['M4 20h4L20 8l-4-4L4 16z', 'M14.5 5.5 18.5 9.5'],
  /** Alert used inside the accent circle on the verification banner. */
  alert: ['M12 8.5v5', 'M12 16.6v.4', 'M12 3.4a8.6 8.6 0 1 0 0 17.2 8.6 8.6 0 0 0 0-17.2z'],
};

export type IconName = keyof typeof IconPaths | string;

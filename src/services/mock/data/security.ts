import type { Device } from '@/services/types/security';
import type { VerificationStep } from '@/services/types/verification';

/** Verbatim from the design's initial `state.devices`. */
export const MOCK_DEVICES: Device[] = [
  { id: 'd_iphone', name: 'iPhone 15 · Lagos', meta: 'This device · active now', current: true, trusted: true },
  { id: 'd_macbook', name: 'MacBook Pro · Lagos', meta: 'Chrome · 16 Aug, 09:14', current: false, trusted: true },
  { id: 'd_android', name: 'Android · Abuja', meta: 'Unrecognised · 02 Aug, 23:41', current: false, trusted: false },
];

/**
 * From the design's `VERIF` map plus its initial verification state
 * (`{email: true, identity: false, address: false}`).
 */
export const MOCK_VERIFICATION_STEPS: VerificationStep[] = [
  {
    key: 'email', label: 'Email address', desc: 'adaeze@mail.com', status: 'done',
    fields: [{ label: 'Email address', value: 'adaeze@mail.com', ph: 'you@mail.com' }],
  },
  {
    key: 'identity', label: 'BVN and NIN',
    desc: 'Bank Verification Number and National Identity Number', status: 'pending',
    fields: [
      { label: 'BVN', value: '221 348 907 61', ph: '11 digits' },
      { label: 'NIN', value: '', ph: '11 digits' },
      { label: 'Date of birth', value: '14 March 1994', ph: 'DD MMM YYYY' },
    ],
  },
  {
    key: 'address', label: 'Home address', desc: 'Proof of address', status: 'pending',
    fields: [
      { label: 'Street address', value: '', ph: '12 Bourdillon Road' },
      { label: 'City and state', value: '', ph: 'Ikoyi, Lagos' },
    ],
  },
];

/** Copy the design attaches to each verification step. */
export const VERIFICATION_COPY: Record<string, { head: string; blurb: string; note: string; cta: string }> = {
  email: {
    head: 'Confirm your email',
    blurb: 'We will send a link to the address below. Open it on this device.',
    note: 'Used for receipts and security alerts only.',
    cta: 'Send confirmation link',
  },
  identity: {
    head: 'Link your BVN and NIN',
    blurb: 'Both are required by the Central Bank of Nigeria. Together they complete Tier 2 and lift your daily limit to ₦1,000,000.',
    note: 'We read your name and date of birth only. We never see your bank balances. Checked against NIBSS and NIMC records.',
    cta: 'Verify both',
  },
  address: {
    head: 'Confirm your address',
    blurb: 'A utility bill or bank statement from the last three months.',
    note: 'Reviewed by a person, usually within one business day.',
    cta: 'Submit for review',
  },
};

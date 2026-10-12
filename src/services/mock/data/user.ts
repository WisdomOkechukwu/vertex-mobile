import type { User } from '@/services/types/auth';

/** From the design's initial state: `profileName: 'Adaeze'`, `profileTag: 'adaeze'`, phone `801 234 5678`. */
export const MOCK_USER: User = {
  id: 'u_1',
  profileName: 'Adaeze',
  profileTag: 'adaeze',
  fullName: 'Adaeze Okonkwo',
  phone: '801 234 5678',
  email: 'adaeze@mail.com',
  avatarInitials: 'AO',
  // The design's verification state is `{email: true, identity: false, address: false}` — email
  // done, BVN/NIN outstanding — which is Tier 1 with Tier 2 still to unlock.
  tier: 'Tier 1',
  // ₦3,480 — the figure the Security screen shows in `design/security/default-2.png`.
  cashbackBalance: 3480,
};

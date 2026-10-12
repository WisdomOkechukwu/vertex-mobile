import { linkSlug } from '@/lib/format';
import { delay } from '@/services/mock/delay';
import { MOCK_LINKS } from '@/services/mock/data/links';
import { MOCK_USER } from '@/services/mock/data/user';
import { ApiError } from '@/services/types/common';
import type { LinksAPI, PaymentLink } from '@/services/types/links';

const links = [...MOCK_LINKS];

/** The seed data writes `01 Aug 2026`, so a link created today has to read the same way. */
function today(): string {
  return new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

let seq = 0;

export const linksMockApi: LinksAPI = {
  async listLinks() {
    await delay();
    // A copy, not the backing array: the store prepends a freshly created link to whatever
    // `listLinks` gave it, and handing out the live array made the new link appear twice.
    return [...links];
  },
  async createLink({ title, amount, collectName = true, allowReuse = true, notify = true }) {
    await delay(600);
    const link: PaymentLink = {
      id: `l_${++seq}`,
      title,
      slug: linkSlug(MOCK_USER.profileTag, title),
      amount: amount ?? 0,
      paid: 0,
      count: 0,
      active: true,
      created: today(),
      payers: [],
      collectName,
      allowReuse,
      notify,
    };
    links.unshift(link);
    return link;
  },
  async updateLink(id, { title, amount, collectName, allowReuse, notify }) {
    await delay(600);
    const link = links.find((l) => l.id === id);
    if (!link) throw new ApiError('NOT_FOUND', 'Link not found.');
    // The slug is deliberately left alone: it is minted once and may already be out in the world,
    // so renaming a link must not break the URL people were given.
    Object.assign(link, {
      title,
      amount: amount ?? 0,
      collectName,
      allowReuse,
      notify,
    });
    return { ...link };
  },
  async toggleActive(id) {
    await delay(300);
    const link = links.find((l) => l.id === id);
    if (!link) throw new ApiError('NOT_FOUND', 'Link not found.');
    link.active = !link.active;
    return { ...link };
  },
  async deleteLink(id) {
    await delay(500);
    const idx = links.findIndex((l) => l.id === id);
    if (idx >= 0) links.splice(idx, 1);
  },
};

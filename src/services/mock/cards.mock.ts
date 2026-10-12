import { delay } from '@/services/mock/delay';
import { MOCK_DEBIT_CARDS, MOCK_VIRTUAL_CARDS } from '@/services/mock/data/cards';
import { CardGradients } from '@/constants/colors';
import { ApiError } from '@/services/types/common';
import type { CardsAPI } from '@/services/types/cards';

const virtualCards = [...MOCK_VIRTUAL_CARDS];
const debitCards = [...MOCK_DEBIT_CARDS];

export const cardsMockApi: CardsAPI = {
  async listVirtualCards() {
    await delay();
    return virtualCards;
  },
  async listDebitCards() {
    await delay();
    return debitCards;
  },
  async createVirtualCard({ name, color }) {
    await delay(700);
    const card = {
      id: `vc_${Date.now()}`,
      name,
      color: color || CardGradients[virtualCards.length % CardGradients.length],
      currency: 'USD',
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      full: `5399 0000 0000 ${String(Math.floor(1000 + Math.random() * 9000))}`,
      exp: '12/29',
      cvv: '000',
      frozen: false,
      spent: 0,
      funded: 0,
      limit: 0,
    };
    virtualCards.push(card);
    return card;
  },
  async toggleFreeze(cardId) {
    await delay(300);
    const card = virtualCards.find((c) => c.id === cardId);
    if (!card) throw new ApiError('NOT_FOUND', 'Card not found.');
    card.frozen = !card.frozen;
    return card;
  },
  async topUp(cardId, amount) {
    await delay(600);
    const card = virtualCards.find((c) => c.id === cardId);
    if (!card) throw new ApiError('NOT_FOUND', 'Card not found.');
    card.funded += amount;
    card.limit += amount;
    return card;
  },
  async addDebitCard({ number, exp, name }) {
    await delay(700);
    const card = {
      id: `dc_${Date.now()}`,
      brand: number.startsWith('4') ? 'Visa' : 'Mastercard',
      bank: 'Vertex partner bank',
      last4: number.slice(-4),
      exp,
      tint: '#1f6feb',
      primary: debitCards.length === 0,
    };
    debitCards.push(card);
    return card;
  },
};

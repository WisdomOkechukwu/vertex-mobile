import type { GiftCardBrand, PurchasedGiftCard } from '@/services/types/gift-cards';

/**
 * The brand catalogue.
 *
 * Tints come from `AvatarTints`, so a gift card row sits in the same colour family as every other
 * monogrammed row in the app rather than importing a set of brand palettes the design never had.
 * Denominations are the ones each brand actually issues, which is why they are not a shared ladder.
 */
export const MOCK_GIFT_BRANDS: GiftCardBrand[] = [
  {
    id: 'gb_amazon', name: 'Amazon', tint: '#fff0cf', category: 'Shopping', currency: 'USD',
    denominations: [10, 25, 50, 100],
    blurb: 'Anything on amazon.com, including third-party sellers.',
    redeemAt: 'amazon.com/redeem',
  },
  {
    id: 'gb_apple', name: 'Apple', tint: '#dfe7ff', category: 'Shopping', currency: 'USD',
    denominations: [15, 25, 50, 100],
    blurb: 'App Store, iCloud storage, Apple Music and hardware.',
    redeemAt: 'Settings → Apple Account → Redeem',
  },
  {
    id: 'gb_netflix', name: 'Netflix', tint: '#ffe3d8', category: 'Streaming', currency: 'USD',
    denominations: [25, 50, 100],
    blurb: 'Tops up your Netflix balance. Works on any plan.',
    redeemAt: 'netflix.com/redeem',
  },
  {
    id: 'gb_spotify', name: 'Spotify', tint: '#e2f4e6', category: 'Streaming', currency: 'USD',
    denominations: [10, 30, 60],
    blurb: 'Premium, ad-free, on up to six devices.',
    redeemAt: 'spotify.com/redeem',
  },
  {
    id: 'gb_steam', name: 'Steam', tint: '#dfe7ff', category: 'Gaming', currency: 'USD',
    denominations: [20, 50, 100],
    blurb: 'Games, DLC and anything else in the Steam store.',
    redeemAt: 'Steam client → Games → Redeem',
  },
  {
    id: 'gb_playstation', name: 'PlayStation', tint: '#f6e2f4', category: 'Gaming', currency: 'USD',
    denominations: [10, 25, 50],
    blurb: 'PlayStation Store credit and PS Plus.',
    redeemAt: 'PlayStation Store → Redeem Codes',
  },
  {
    id: 'gb_uber', name: 'Uber', tint: '#e2f4e6', category: 'Travel', currency: 'USD',
    denominations: [15, 25, 50],
    blurb: 'Rides and Uber Eats on the same balance.',
    redeemAt: 'Uber app → Wallet → Add gift card',
  },
  {
    id: 'gb_jumia', name: 'Jumia', tint: '#fff0cf', category: 'Shopping', currency: 'NGN',
    denominations: [5_000, 10_000, 25_000, 50_000],
    blurb: 'Nigeria’s marketplace — electronics, fashion, groceries.',
    redeemAt: 'jumia.com.ng → Account → Vouchers',
  },
  {
    id: 'gb_chowdeck', name: 'Chowdeck', tint: '#ffe3d8', category: 'Food', currency: 'NGN',
    denominations: [5_000, 10_000, 20_000],
    blurb: 'Food delivery across Lagos, Abuja and Port Harcourt.',
    redeemAt: 'Chowdeck app → Wallet → Redeem',
  },
];

/** Two prior purchases, so the "Your gift cards" section is not empty on a first run. */
export const MOCK_PURCHASED_GIFT_CARDS: PurchasedGiftCard[] = [
  {
    id: 'pg_884210', brandId: 'gb_spotify', brandName: 'Spotify', tint: '#e2f4e6',
    amount: 30, currency: 'USD', paid: 45_990, paidCurrency: 'NGN',
    code: 'SPOT-9K4M-2XQ7-LT80', purchased: '12 Aug 2026, 19:04',
    redeemAt: 'spotify.com/redeem', status: 'active',
  },
  {
    id: 'pg_883104', brandId: 'gb_amazon', brandName: 'Amazon', tint: '#fff0cf',
    amount: 25, currency: 'USD', paid: 25, paidCurrency: 'USDC',
    code: 'AMZN-4F2K-9QT1-8XPB', pin: '4417', purchased: '02 Aug 2026, 11:26',
    redeemAt: 'amazon.com/redeem', status: 'redeemed',
  },
];

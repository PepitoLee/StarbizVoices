import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Stripe price IDs - configure these in your Stripe dashboard
export const STRIPE_PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY || 'price_monthly',
  annual: process.env.STRIPE_PRICE_ID_ANNUAL || 'price_annual',
} as const;

export type PricingPlan = 'monthly' | 'annual';

export const PRICING = {
  monthly: {
    priceId: STRIPE_PRICE_IDS.monthly,
    amount: 999, // $9.99
    interval: 'month' as const,
    name: 'Premium Mensual',
  },
  annual: {
    priceId: STRIPE_PRICE_IDS.annual,
    amount: 7999, // $79.99 (save ~33%)
    interval: 'year' as const,
    name: 'Premium Anual',
  },
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100);
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe, PRICING, type PricingPlan } from '@/lib/stripe';
import { z } from 'zod';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';

const checkoutSchema = z.object({
  plan: z.enum(['monthly', 'annual'] as const),
});

export async function POST(request: Request) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, RATE_LIMITS.strict);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate input with Zod
    const body = await request.json();
    const parseResult = checkoutSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid plan', details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { plan } = parseResult.data;

    if (!PRICING[plan]) {
      return NextResponse.json({ error: 'Plan not available' }, { status: 400 });
    }

    // Get or create Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      });

      customerId = customer.id;

      // Store customer ID in profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICING[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/premium`,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

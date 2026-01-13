import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import {
  checkRateLimit,
  getClientIdentifier,
  createRateLimitHeaders,
  RATE_LIMITS,
} from '@/lib/rate-limit';

// Use service role for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  // Rate limiting for webhooks (high throughput)
  const identifier = getClientIdentifier(request);
  const rateLimitResult = checkRateLimit(identifier, RATE_LIMITS.webhook);

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: createRateLimitHeaders(rateLimitResult),
      }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.subscription
    ? (
        await stripe.subscriptions.retrieve(session.subscription as string)
      ).metadata.supabase_user_id
    : null;

  if (!userId) {
    console.error('No user ID found in session');
    return;
  }

  // Update user role to premium
  await supabaseAdmin
    .from('profiles')
    .update({ role: 'premium' })
    .eq('id', userId);
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    console.error('No user ID in subscription metadata');
    return;
  }

  const status = subscription.status;
  const priceId = subscription.items.data[0]?.price.id;

  // Access current_period_end using type assertion (property exists at runtime)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (subscription as any).current_period_end as number;
  const currentPeriodEnd = new Date(periodEnd * 1000);

  // Update subscription record
  await supabaseAdmin.from('subscriptions').upsert({
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    status,
    current_period_end: currentPeriodEnd.toISOString(),
    updated_at: new Date().toISOString(),
  });

  // Update user role based on subscription status
  const role = ['active', 'trialing'].includes(status) ? 'premium' : 'user';

  await supabaseAdmin.from('profiles').update({ role }).eq('id', userId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.supabase_user_id;

  if (!userId) {
    console.error('No user ID in subscription metadata');
    return;
  }

  // Update subscription status
  await supabaseAdmin
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  // Downgrade user to free tier
  await supabaseAdmin.from('profiles').update({ role: 'user' }).eq('id', userId);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Payment succeeded for invoice:', invoice.id);
  // Could send confirmation email or add credits here
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Payment failed for invoice:', invoice.id);
  // Could send notification email here
}

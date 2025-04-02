// pages/api/webhooks/stripe.js
import { buffer } from 'micro';
import Stripe from 'stripe';
import { query } from '../../../lib/database';

// Disable Next.js body parsing (required for webhooks)
export const config = {
  api: {
    bodyParser: false,
  },
  runtime: 'nodejs',
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const signature = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  if (!signature || !webhookSecret) {
    return res.status(400).json({ error: 'Missing signature or webhook secret' });
  }

  try {
    // Get the raw body buffer
    const rawBody = await buffer(req);
    
    // Verify the webhook signature
    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );

    // Handle the event based on its type
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error(`Webhook error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}

// Handle successful checkout session
async function handleCheckoutSessionCompleted(session) {
  // Retrieve the customer's metadata from the session
  const { customer, client_reference_id, subscription } = session;
  
  if (!client_reference_id || !customer || !subscription) {
    console.error('Missing required data in checkout session');
    return;
  }
  
  // client_reference_id should be the user ID from your database
  const userId = client_reference_id;
  
  try {
    // Fetch subscription details from Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subscriptionDetails = await stripe.subscriptions.retrieve(subscription);
    
    // Get the plan information
    const planId = subscriptionDetails.items.data[0].price.id;
    let planName = 'premium'; // Default
    
    // Map Stripe price IDs to your plan names
    switch (planId) {
      case process.env.STRIPE_PREMIUM_PRICE_ID:
        planName = 'premium';
        break;
      case process.env.STRIPE_PROFESSIONAL_PRICE_ID:
        planName = 'professional';
        break;
      default:
        console.log(`Unknown plan ID: ${planId}`);
    }
    
    // Generate a unique access token for API access
    const accessToken = generateAccessToken();
    
    // Calculate expiration date
    const currentPeriodEnd = new Date(subscriptionDetails.current_period_end * 1000);
    
    // Update or create subscription in your database
    await query(`
      INSERT INTO subscriptions 
        (user_id, stripe_customer_id, stripe_subscription_id, plan, status, 
         current_period_start, current_period_end, access_token)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (user_id) DO UPDATE SET
        stripe_customer_id = $2,
        stripe_subscription_id = $3,
        plan = $4,
        status = $5,
        current_period_start = $6,
        current_period_end = $7,
        access_token = $8,
        updated_at = NOW()
    `, [
      userId,
      customer,
      subscription,
      planName,
      'active',
      new Date(subscriptionDetails.current_period_start * 1000).toISOString(),
      currentPeriodEnd.toISOString(),
      accessToken
    ]);
    
    console.log(`Subscription created for user ${userId}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    // Get user ID from metadata or customer ID mapping
    const stripeSubscriptionId = subscription.id;
    
    // Find the user ID associated with this subscription
    const userResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`No user found for subscription: ${stripeSubscriptionId}`);
      return;
    }
    
    const userId = userResult.rows[0].user_id;
    
    // Update the subscription details
    await query(`
      UPDATE subscriptions SET
        status = $1,
        current_period_start = $2,
        current_period_end = $3,
        updated_at = NOW()
      WHERE stripe_subscription_id = $4
    `, [
      subscription.status,
      new Date(subscription.current_period_start * 1000).toISOString(),
      new Date(subscription.current_period_end * 1000).toISOString(),
      stripeSubscriptionId
    ]);
    
    console.log(`Subscription updated for user ${userId}`);
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription deletions
async function handleSubscriptionDeleted(subscription) {
  try {
    const stripeSubscriptionId = subscription.id;
    
    // Update subscription status to cancelled
    await query(`
      UPDATE subscriptions SET
        status = 'cancelled',
        cancelled_at = NOW(),
        updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [stripeSubscriptionId]);
    
    console.log(`Subscription cancelled: ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('Error cancelling subscription:', error);
  }
}

// Handle successful invoice payments (renewals)
async function handleInvoicePaymentSucceeded(invoice) {
  if (!invoice.subscription) {
    return; // Not a subscription invoice
  }
  
  try {
    const stripeSubscriptionId = invoice.subscription;
    
    // Get the new period end date from the invoice
    const subscriptionResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found for invoice: ${invoice.id}`);
      return;
    }
    
    const userId = subscriptionResult.rows[0].user_id;
    
    // Fetch the latest subscription details from Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    
    // Update the subscription with new period dates
    await query(`
      UPDATE subscriptions SET
        status = 'active',
        current_period_start = $1,
        current_period_end = $2,
        updated_at = NOW()
      WHERE stripe_subscription_id = $3
    `, [
      new Date(subscription.current_period_start * 1000).toISOString(),
      new Date(subscription.current_period_end * 1000).toISOString(),
      stripeSubscriptionId
    ]);
    
    console.log(`Subscription renewed for user ${userId}`);
  } catch (error) {
    console.error('Error updating subscription after payment:', error);
  }
}

// Handle failed invoice payments
async function handleInvoicePaymentFailed(invoice) {
  if (!invoice.subscription) {
    return; // Not a subscription invoice
  }
  
  try {
    const stripeSubscriptionId = invoice.subscription;
    
    // Update subscription status to past_due
    await query(`
      UPDATE subscriptions SET
        status = 'past_due',
        updated_at = NOW()
      WHERE stripe_subscription_id = $1
    `, [stripeSubscriptionId]);
    
    console.log(`Subscription payment failed: ${stripeSubscriptionId}`);
  } catch (error) {
    console.error('Error updating subscription after payment failure:', error);
  }
}

// Generate a random access token
function generateAccessToken() {
  return Array(32)
    .fill(0)
    .map(() => Math.random().toString(36).charAt(2))
    .join('');
}
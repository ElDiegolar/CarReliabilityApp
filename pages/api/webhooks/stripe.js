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
    let planId = subscriptionDetails.items.data[0].price.id;
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
        console.log(`Unknown plan ID: ${planId}, using metadata or inferring from price`);
        // Try to get plan from session metadata
        if (session.metadata && session.metadata.plan) {
          planName = session.metadata.plan;
        } else {
          // Try to infer from price amount
          const priceAmount = subscriptionDetails.items.data[0].price.unit_amount;
          if (priceAmount === 1999) {
            planName = 'professional';
          }
        }
    }
    
    // First get the plan_id from subscription_plans table
    const planResult = await query(
      'SELECT id FROM subscription_plans WHERE name = $1',
      [planName]
    );
    
    if (planResult.rows.length === 0) {
      console.log(`Creating missing plan: ${planName}`);
      
      // Insert basic plan data, including the required features column
      const defaultFeatures = JSON.stringify([
        `All ${planName} features`,
        'Comprehensive reliability scores',
        'Detailed reports',
        planName === 'premium' ? 'Priority support' : 'Premium support'
      ]);
      
      const newPlanResult = await query(
        'INSERT INTO subscription_plans (name, price, features) VALUES ($1, $2, $3) RETURNING id',
        [planName, planName === 'premium' ? 9.99 : 19.99, defaultFeatures]
      );
      
      planId = newPlanResult.rows[0].id;
    } else {
      planId = planResult.rows[0].id;
    }
    
    // Generate a unique access token for API access
    const accessToken = generateAccessToken();
    
    // Calculate expiration date
    const currentPeriodEnd = new Date(subscriptionDetails.current_period_end * 1000);
    const currentPeriodStart = new Date(subscriptionDetails.current_period_start * 1000);
    
    // Start a database transaction to ensure both tables are updated consistently
    await query('BEGIN');
    
    try {
      // Update or create subscription in your database - use user_subscriptions instead of subscriptions
      await query(`
        INSERT INTO user_subscriptions 
          (user_id, plan_id, status, payment_session_id, 
           current_period_start, current_period_end, access_token,
           stripe_customer_id, stripe_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) DO UPDATE SET
          plan_id = $2,
          status = $3,
          payment_session_id = $4,
          current_period_start = $5,
          current_period_end = $6,
          access_token = $7,
          stripe_customer_id = $8,
          stripe_subscription_id = $9,
          updated_at = CURRENT_TIMESTAMP
      `, [
        userId,
        planId,
        'active',
        session.id,
        currentPeriodStart.toISOString(),
        currentPeriodEnd.toISOString(),
        accessToken,
        customer,
        subscription
      ]);
      
      // Update the user table with Stripe customer ID if needed
      await query(`
        UPDATE users SET
          stripe_customer_id = $1,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
      `, [
        customer,
        userId
      ]);
      
      // Commit the transaction
      await query('COMMIT');
      
      console.log(`Subscription created for user ${userId} with plan ${planName}`);
    } catch (error) {
      // If there's an error, roll back the transaction
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Error updating subscription:', error);
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    // Get user ID from metadata or customer ID mapping
    const stripeSubscriptionId = subscription.id;
    
    // Find the user ID associated with this subscription - using user_subscriptions
    const userResult = await query(
      'SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = $1',
      [stripeSubscriptionId]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`No user found for subscription: ${stripeSubscriptionId}`);
      return;
    }
    
    const userId = userResult.rows[0].user_id;
    
    // Update the subscription details - using user_subscriptions
    await query(`
      UPDATE user_subscriptions SET
        status = $1,
        current_period_start = $2,
        current_period_end = $3,
        updated_at = CURRENT_TIMESTAMP
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
    
    // Update subscription status to cancelled - using user_subscriptions
    await query(`
      UPDATE user_subscriptions SET
        status = 'cancelled',
        updated_at = CURRENT_TIMESTAMP
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
    
    // Get the user ID - using user_subscriptions
    const subscriptionResult = await query(
      'SELECT user_id FROM user_subscriptions WHERE stripe_subscription_id = $1',
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
    
    // Update the subscription with new period dates - using user_subscriptions
    await query(`
      UPDATE user_subscriptions SET
        status = 'active',
        current_period_start = $1,
        current_period_end = $2,
        updated_at = CURRENT_TIMESTAMP
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
    
    // Update subscription status to past_due - using user_subscriptions
    await query(`
      UPDATE user_subscriptions SET
        status = 'past_due',
        updated_at = CURRENT_TIMESTAMP
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
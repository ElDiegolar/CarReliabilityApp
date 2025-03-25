import Stripe from 'stripe';
import getRawBody from 'raw-body';
import { createPool } from '@vercel/postgres';
import { v4 as uuidv4 } from 'uuid';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mW5kSbWQ5RUKweAmuVKnDaJx', {
  apiVersion: '2024-06-20',
});

// Initialize database connection
const pool = createPool({
  connectionString: process.env.POSTGRES_URL,
});

// Configure Next.js API route to disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Main webhook handler function
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_g9iplz4O3eLpzGqDrc4rnS7QWwZMpwaH';
  const signature = req.headers['stripe-signature'];
  const isDebug = process.env.NODE_ENV !== 'production';
  
  if (!signature) {
    return res.status(400).json({ error: 'Missing stripe-signature header' });
  }

  let event;
  let logId = null;

  try {
    // Get the raw request body as a buffer
    const rawBody = await getRawBody(req, {
      length: req.headers['content-length'],
      limit: '1mb',
    });

    // Log incoming webhook request if in debug mode
    if (isDebug) {
      console.log('✅ Request Headers:', JSON.stringify(req.headers));
      console.log('✅ Signature Header:', signature);
      console.log('✅ Endpoint Secret:', endpointSecret ? '[SECRET PRESENT]' : '[SECRET MISSING]');
      console.log('✅ Raw Body Length:', rawBody.length);
    }

    // Log webhook receipt in database
    try {
      const logResult = await pool.query(`
        INSERT INTO webhook_logs (
          event_type, 
          event_object, 
          stripe_signature, 
          raw_body, 
          processing_status
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `, [
        'unknown',
        JSON.stringify({}),
        signature,
        rawBody.length > 10000 ? rawBody.toString('utf8').substring(0, 10000) + '...(truncated)' : rawBody.toString('utf8'),
        'received'
      ]);
      
      logId = logResult.rows[0].id;
      if (isDebug) console.log(`🔍 Webhook received and logged with ID: ${logId}`);
    } catch (logError) {
      console.error('Error logging webhook receipt:', logError);
      // Continue processing even if logging fails
    }

    // Construct and verify the event
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      endpointSecret
    );

    if (isDebug) console.log(`✅ Webhook verified: ${event.type}`);

    // Update log after successful signature verification
    if (logId) {
      try {
        await pool.query(`
          UPDATE webhook_logs 
          SET event_id = $1, 
              event_type = $2, 
              event_object = $3, 
              processing_status = $4,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $5
        `, [
          event.id,
          event.type,
          JSON.stringify(event.data.object),
          'verified',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log after verification:', updateError);
      }
    }

    // Update log to show we're starting processing
    if (logId) {
      try {
        await pool.query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [
          'processing',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log before processing:', updateError);
      }
    }

    // Handle different event types
    switch (event.type) {
      case 'customer.created':
        await handleCustomerCreated(event.data.object);
        break;
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
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
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Update log after successful processing
    if (logId) {
      try {
        await pool.query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [
          'completed',
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log after processing:', updateError);
      }
    }

    return res.status(200).json({ 
      received: true,
      logId: logId
    });
  } catch (err) {
    // Update log with error
    if (logId) {
      try {
        await pool.query(`
          UPDATE webhook_logs 
          SET processing_status = $1,
              error_message = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `, [
          'failed',
          err.message,
          logId
        ]);
      } catch (updateError) {
        console.error('Error updating webhook log with error:', updateError);
      }
    }

    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    
    console.error(`❌ Webhook error: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}

// Handle successful checkout completion
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed event');
    
    // Extract necessary data from the session
    const { client_reference_id, customer, metadata, id: sessionId } = session;
    const userId = client_reference_id;
    const plan = metadata?.plan || 'premium';
    const customerId = customer;
    
    if (!userId) {
      console.error('No client_reference_id (userId) found in checkout session');
      return;
    }
    
    // Calculate expiration date based on the plan
    const expiresAt = calculateExpirationDate(plan);
    
    // Check if user already has a subscription
    const existingSubResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await pool.query(`
        UPDATE subscriptions 
        SET plan = $1, 
            status = $2, 
            stripe_session_id = $3, 
            stripe_customer_id = $4,
            access_token = $5,
            expires_at = $6,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $7
      `, [
        plan, 
        'active', 
        sessionId, 
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt,
        existingSub.id
      ]);
      
      console.log(`Updated subscription for user ${userId} to ${plan} plan`);
    } else {
      // Create new subscription
      await pool.query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, stripe_customer_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        plan,
        'active',
        sessionId,
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt
      ]);
      
      console.log(`Created new subscription for user ${userId} with ${plan} plan`);
    }
    
    // Update user record with Stripe customer ID if needed
    await pool.query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 AND (stripe_customer_id IS NULL OR stripe_customer_id != $1)
    `, [customerId, userId]);
    
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

// Handle subscription creation
async function handleSubscriptionCreated(subscription) {
  try {
    console.log('Processing customer.subscription.created event');
    
    const { customer: customerId, id: subscriptionId, status, items } = subscription;
    
    // Get the plan from the subscription item
    const plan = items.data.length > 0 ? 
      (items.data[0].price.nickname || 'premium') : 
      'premium';
    
    // Calculate expiration date based on the billing cycle
    const expiresAt = calculateExpirationFromSubscription(subscription);
    
    // Find user by Stripe customer ID
    const userResult = await pool.query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`No user found with Stripe customer ID: ${customerId}`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if user already has a subscription
    const existingSubResult = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await pool.query(`
        UPDATE subscriptions 
        SET plan = $1, 
            status = $2, 
            stripe_subscription_id = $3,
            access_token = $4,
            expires_at = $5,
            updated_at = CURRENT_TIMESTAMP 
        WHERE id = $6
      `, [
        plan, 
        mapStripeStatus(status), 
        subscriptionId,
        uuidv4(), // Generate a new access token
        expiresAt,
        existingSub.id
      ]);
      
      console.log(`Updated subscription for user ${userId} with subscription ID ${subscriptionId}`);
    } else {
      // Create new subscription
      await pool.query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_subscription_id, stripe_customer_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        userId,
        plan,
        mapStripeStatus(status),
        subscriptionId,
        customerId,
        uuidv4(), // Generate a new access token
        expiresAt
      ]);
      
      console.log(`Created new subscription for user ${userId} with subscription ID ${subscriptionId}`);
    }
  } catch (error) {
    console.error('Error handling customer.subscription.created:', error);
    throw error;
  }
}

// Handle subscription updates
async function handleSubscriptionUpdated(subscription) {
  try {
    console.log('Processing customer.subscription.updated event');
    
    const { 
      customer: customerId, 
      id: subscriptionId, 
      status, 
      items, 
      cancel_at_period_end 
    } = subscription;
    
    // Get the plan from the subscription item
    const plan = items.data.length > 0 ? 
      (items.data[0].price.nickname || 'premium') : 
      'premium';
    
    // Calculate expiration date based on the current period end
    const expiresAt = calculateExpirationFromSubscription(subscription);
    
    // Find the subscription in our database
    const subscriptionResult = await pool.query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Determine the status to set
    let dbStatus = mapStripeStatus(status);
    
    // If the subscription is set to cancel at period end, but still active
    if (cancel_at_period_end && status === 'active') {
      dbStatus = 'canceling';
    }
    
    // Update the subscription
    await pool.query(`
      UPDATE subscriptions 
      SET plan = $1, 
          status = $2, 
          expires_at = $3,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4
    `, [plan, dbStatus, expiresAt, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${dbStatus}`);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

// Handle subscription deletion
async function handleSubscriptionDeleted(subscription) {
  try {
    console.log('Processing customer.subscription.deleted event');
    
    const { 
      customer: customerId, 
      id: subscriptionId 
    } = subscription;
    
    // Find the subscription in our database
    const subscriptionResult = await pool.query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Update the subscription status to canceled
    await pool.query(`
      UPDATE subscriptions 
      SET status = $1, 
          expires_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, ['canceled', subId]);
    
    console.log(`Canceled subscription for user ${userId}`);
    
    // Optionally, downgrade to a basic plan
    await pool.query(`
      INSERT INTO subscriptions 
      (user_id, plan, status) 
      VALUES ($1, $2, $3)
    `, [userId, 'basic', 'active']);
    
    console.log(`Created new basic subscription for user ${userId}`);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}

// Handle successful invoice payment
async function handleInvoicePaymentSucceeded(invoice) {
  try {
    console.log('Processing invoice.payment_succeeded event');
    
    const { 
      customer: customerId, 
      subscription: subscriptionId,
      paid,
      amount_paid
    } = invoice;
    
    if (!paid || amount_paid <= 0) {
      console.log('Invoice not paid or zero amount, ignoring');
      return;
    }
    
    // Find the subscription in our database
    const subscriptionResult = await pool.query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Get the subscription details from Stripe to update expiration
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const expiresAt = calculateExpirationFromSubscription(stripeSubscription);
    
    // Update the subscription status and expiration
    await pool.query(`
      UPDATE subscriptions 
      SET status = $1, 
          expires_at = $2,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $3
    `, ['active', expiresAt, subId]);
    
    console.log(`Updated subscription for user ${userId} after successful payment`);
    
    // Insert payment record
    await pool.query(`
      INSERT INTO payments 
      (user_id, subscription_id, amount, stripe_invoice_id) 
      VALUES ($1, $2, $3, $4)
    `, [userId, subId, amount_paid / 100, invoice.id]);
    
    console.log(`Recorded payment of ${amount_paid / 100} for user ${userId}`);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

// Handle failed invoice payment
async function handleInvoicePaymentFailed(invoice) {
  try {
    console.log('Processing invoice.payment_failed event');
    
    const { 
      customer: customerId, 
      subscription: subscriptionId,
      attempt_count
    } = invoice;
    
    // Find the subscription in our database
    const subscriptionResult = await pool.query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return;
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Update the subscription status based on attempt count
    // If multiple attempts have failed, mark as past_due or unpaid
    const status = attempt_count > 3 ? 'unpaid' : 'past_due';
    
    await pool.query(`
      UPDATE subscriptions 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${status} after failed payment`);
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

// Handle customer creation
async function handleCustomerCreated(customer) {
  try {
    console.log('Processing customer.created event');
    
    const { id: customerId, email } = customer;
    
    if (!email) {
      console.error('No email found in customer object');
      return;
    }
    
    // Find user by email
    const userResult = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`No user found with email: ${email}, potentially a new signup flow`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Update user with Stripe customer ID
    await pool.query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [customerId, userId]);
    
    console.log(`Updated user ${userId} with Stripe customer ID: ${customerId}`);
  } catch (error) {
    console.error('Error handling customer.created:', error);
    throw error;
  }
}

// Helper function to map Stripe subscription status to our database status
function mapStripeStatus(stripeStatus) {
  const statusMap = {
    'active': 'active',
    'past_due': 'past_due',
    'unpaid': 'unpaid',
    'canceled': 'canceled',
    'incomplete': 'pending',
    'incomplete_expired': 'canceled',
    'trialing': 'active',
    'paused': 'paused'
  };
  
  return statusMap[stripeStatus] || 'unknown';
}

// Helper function to calculate expiration date from a Stripe subscription
function calculateExpirationFromSubscription(subscription) {
  if (!subscription) return null;
  
  // Use current_period_end if available
  if (subscription.current_period_end) {
    return new Date(subscription.current_period_end * 1000).toISOString();
  }
  
  // If we have a cancel_at, use that
  if (subscription.cancel_at) {
    return new Date(subscription.cancel_at * 1000).toISOString();
  }
  
  // Otherwise, calculate based on plan interval
  const plan = subscription.items?.data[0]?.plan;
  if (plan) {
    const now = new Date();
    
    if (plan.interval === 'month') {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.interval === 'year') {
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.interval === 'week') {
      now.setDate(now.getDate() + 7);
    } else if (plan.interval === 'day') {
      now.setDate(now.getDate() + 1);
    }
    
    return now.toISOString();
  }
  
  // Fallback to 1 year from now
  return calculateExpirationDate('premium');
}

// Helper function to calculate expiration date based on plan details
function calculateExpirationDate(plan) {
  const now = new Date();
  
  if (typeof plan === 'string') {
    if (plan.includes('monthly')) {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.includes('yearly') || plan.includes('annual')) {
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.includes('weekly')) {
      now.setDate(now.getDate() + 7);
    } else if (plan.includes('quarterly')) {
      now.setMonth(now.getMonth() + 3);
    } else if (plan.includes('premium')) {
      // Default premium to 1 year
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan.includes('basic')) {
      // For free basic plans, we might set longer expiration or null
      now.setFullYear(now.getFullYear() + 10); // Effectively "forever"
      // Alternatively: return null; // No expiration
    } else {
      // Default to 1 year for unknown premium plans
      now.setFullYear(now.getFullYear() + 1);
    }
  } else {
    // Default to 1 year if plan type is unclear
    now.setFullYear(now.getFullYear() + 1);
  }
  
  return now.toISOString();
}
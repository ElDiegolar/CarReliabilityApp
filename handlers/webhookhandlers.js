// handlers/webhookHandlers.js - Separate module for webhook event handlers
const { v4: uuidv4 } = require('uuid');
const { query } = require('../api/database'); // Adjust path to your database module

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

// Handle successful checkout completion
async function handleCheckoutSessionCompleted(session) {
  try {
    console.log('Processing checkout.session.completed event');
    
    // Extract necessary data from the session
    const { client_reference_id, customer, metadata, id: sessionId } = session;
    
    // Get user ID from metadata or client_reference_id
    const userId = metadata?.userId || client_reference_id;
    
    // Get plan from metadata
    const plan = metadata?.plan || 'premium';
    
    // Get customer ID
    const customerId = customer;
    
    if (!userId) {
      console.error('No user ID found in checkout session');
      throw new Error('Missing user ID in checkout session');
    }
    
    // Log the data for debugging
    console.log(`Checkout completed - User: ${userId}, Plan: ${plan}, Customer: ${customerId}`);
    
    // Calculate expiration date based on the plan
    const expiresAt = calculateExpirationDate(plan);
    
    // Check if user already has a subscription
    const existingSubResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await query(`
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
      await query(`
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
    await query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2 AND (stripe_customer_id IS NULL OR stripe_customer_id != $1)
    `, [customerId, userId]);
    
    return { success: true, message: `Processed checkout.session.completed for user ${userId}` };
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
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length === 0) {
      console.error(`No user found with Stripe customer ID: ${customerId}`);
      throw new Error(`No user found with Stripe customer ID: ${customerId}`);
    }
    
    const userId = userResult.rows[0].id;
    
    // Check if user already has a subscription
    const existingSubResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubResult.rows[0];
      
      await query(`
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
      await query(`
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
    
    return { success: true, message: `Processed subscription creation for user ${userId}` };
  } catch (error) {
    console.error('Error handling customer.subscription.created:', error);
    throw error;
  }
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

// Handle subscription update
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
    const subscriptionResult = await query(
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
    await query(`
      UPDATE subscriptions 
      SET plan = $1, 
          status = $2, 
          expires_at = $3,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $4
    `, [plan, dbStatus, expiresAt, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${dbStatus}`);
    
    return { success: true, message: `Updated subscription for user ${userId}` };
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
    const subscriptionResult = await query(
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
    await query(`
      UPDATE subscriptions 
      SET status = $1, 
          expires_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, ['canceled', subId]);
    
    console.log(`Canceled subscription for user ${userId}`);
    
    // Optionally, downgrade to a basic plan
    await query(`
      INSERT INTO subscriptions 
      (user_id, plan, status) 
      VALUES ($1, $2, $3)
    `, [userId, 'basic', 'active']);
    
    console.log(`Created new basic subscription for user ${userId}`);
    
    return { success: true, message: `Canceled subscription for user ${userId}` };
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
      return { success: true, message: 'Invoice not paid or zero amount' };
    }
    
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return { success: false, message: 'Subscription not found' };
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Insert payment record
    await query(`
      INSERT INTO payments 
      (user_id, subscription_id, amount, stripe_invoice_id) 
      VALUES ($1, $2, $3, $4)
    `, [userId, subId, amount_paid / 100, invoice.id]);
    
    console.log(`Recorded payment of ${amount_paid / 100} for user ${userId}`);
    
    return { success: true, message: `Recorded payment for user ${userId}` };
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
    const subscriptionResult = await query(
      'SELECT id, user_id FROM subscriptions WHERE stripe_subscription_id = $1 OR stripe_customer_id = $2',
      [subscriptionId, customerId]
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.error(`No subscription found with Stripe subscription ID: ${subscriptionId} or customer ID: ${customerId}`);
      return { success: false, message: 'Subscription not found' };
    }
    
    const subId = subscriptionResult.rows[0].id;
    const userId = subscriptionResult.rows[0].user_id;
    
    // Update the subscription status based on attempt count
    // If multiple attempts have failed, mark as past_due or unpaid
    const status = attempt_count > 3 ? 'unpaid' : 'past_due';
    
    await query(`
      UPDATE subscriptions 
      SET status = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [status, subId]);
    
    console.log(`Updated subscription for user ${userId} to status: ${status} after failed payment`);
    
    return { success: true, message: `Updated subscription status for user ${userId}` };
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
      return { success: false, message: 'No email in customer object' };
    }
    
    // Find user by email
    const userResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`No user found with email: ${email}, potentially a new signup flow`);
      return { success: true, message: 'No matching user found' };
    }
    
    const userId = userResult.rows[0].id;
    
    // Update user with Stripe customer ID
    await query(`
      UPDATE users 
      SET stripe_customer_id = $1, 
          updated_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [customerId, userId]);
    
    console.log(`Updated user ${userId} with Stripe customer ID: ${customerId}`);
    
    return { success: true, message: `Updated user ${userId} with Stripe customer ID` };
  } catch (error) {
    console.error('Error handling customer.created:', error);
    throw error;
  }
}

// Export all handlers
module.exports = {
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCustomerCreated
};
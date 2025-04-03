// pages/api/payment/verify.js
import Stripe from 'stripe';
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { sessionId, plan = 'premium' } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription']
    });
    
    // Verify the session belongs to the current user
    if (session.client_reference_id && session.client_reference_id !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Get plan_id from subscription_plans table
    const planResult = await query(
      'SELECT id FROM subscription_plans WHERE name = $1',
      [plan]
    );
    
    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }
    
    const planId = planResult.rows[0].id;
    
    // Get subscription data from database
    const subscriptionResult = await query(
      'SELECT * FROM user_subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    // Generate access token
    const accessToken = Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
    const now = new Date();
    let currentPeriodEnd;
    
    if (session.subscription) {
      // If Stripe subscription is available, use its period end
      currentPeriodEnd = new Date(session.subscription.current_period_end * 1000);
    } else {
      // Otherwise, set a default period end (1 year from now)
      currentPeriodEnd = new Date();
      currentPeriodEnd.setFullYear(now.getFullYear() + 1);
    }
    
    let stripeCustomerId = session.customer;
    let stripeSubscriptionId = session.subscription ? session.subscription.id : null;
    
    if (subscriptionResult.rows.length === 0) {
      // Create new subscription
      await query(`
        INSERT INTO user_subscriptions 
          (user_id, plan_id, status, payment_session_id, 
           current_period_start, current_period_end, access_token,
           stripe_customer_id, stripe_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        req.user.id,
        planId,
        'active',
        sessionId,
        now.toISOString(),
        currentPeriodEnd.toISOString(),
        accessToken,
        stripeCustomerId,
        stripeSubscriptionId
      ]);
    } else {
      // Update existing subscription
      await query(`
        UPDATE user_subscriptions
        SET plan_id = $1,
            status = $2,
            payment_session_id = $3,
            current_period_start = $4,
            current_period_end = $5,
            access_token = $6,
            stripe_customer_id = $7,
            stripe_subscription_id = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $9
      `, [
        planId,
        'active',
        sessionId,
        now.toISOString(),
        currentPeriodEnd.toISOString(),
        accessToken,
        stripeCustomerId,
        stripeSubscriptionId,
        req.user.id
      ]);
    }
    
    // Get the updated subscription
    const updatedSubResult = await query(
      'SELECT us.*, sp.name as plan_name FROM user_subscriptions us ' +
      'JOIN subscription_plans sp ON us.plan_id = sp.id ' +
      'WHERE us.user_id = $1',
      [req.user.id]
    );
    
    if (updatedSubResult.rows.length === 0) {
      throw new Error('Failed to create or update subscription');
    }
    
    const subscriptionData = updatedSubResult.rows[0];
    
    // Return success response
    return res.status(200).json({
      success: true,
      accessToken: subscriptionData.access_token,
      subscription: {
        plan: subscriptionData.plan_name,
        status: subscriptionData.status,
        current_period_end: subscriptionData.current_period_end,
        expiresAt: subscriptionData.current_period_end
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Failed to verify payment', message: error.message });
  }
}

export default withAuth(handler);
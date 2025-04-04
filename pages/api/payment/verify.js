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

  // Check if user exists
  if (!req.user || !req.user.id) {
    return res.status(401).json({ 
      error: 'Authentication required', 
      message: 'Please log in again to continue' 
    });
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
    
    console.log('Session data:', {
      clientReferenceId: session.client_reference_id,
      userId: req.user.id,
      paymentStatus: session.payment_status
    });
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Get or create plan_id from subscription_plans table
    let planResult = await query(
      'SELECT id FROM subscription_plans WHERE name = $1',
      [plan]
    );
    
    // If plan doesn't exist yet, create it
    if (planResult.rows.length === 0) {
      console.log(`Creating missing plan: ${plan}`);
      
      // Insert basic plan data, including the required features column
      const defaultFeatures = JSON.stringify([
        `All ${plan} features`,
        'Comprehensive reliability scores',
        'Detailed reports',
        plan === 'premium' ? 'Priority support' : 'Premium support'
      ]);
      
      await query(
        'INSERT INTO subscription_plans (name, price, features) VALUES ($1, $2, $3)',
        [plan, plan === 'premium' ? 9.99 : 19.99, defaultFeatures]
      );
      
      // Get the newly created plan
      planResult = await query(
        'SELECT id FROM subscription_plans WHERE name = $1',
        [plan]
      );
      
      if (planResult.rows.length === 0) {
        return res.status(500).json({ error: 'Failed to create subscription plan' });
      }
    }
    
    const planId = planResult.rows[0].id;
    
    // Set subscription period
    const now = new Date();
    let currentPeriodEnd = new Date();
    currentPeriodEnd.setFullYear(now.getFullYear() + 1); // Default to 1 year
    
    if (session.subscription) {
      try {
        // If Stripe subscription is available, use its period end
        currentPeriodEnd = new Date(session.subscription.current_period_end * 1000);
      } catch (e) {
        console.error('Error parsing subscription period end:', e);
        // Keep the default if there's an error
      }
    }
    
    let stripeCustomerId = session.customer || null;
    let stripeSubscriptionId = session.subscription?.id || null;
    
    // Check if subscription already exists
    const existingSubResult = await query(
      'SELECT id FROM user_subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubResult.rows.length > 0) {
      // Subscription exists, update it
      await query(`
        UPDATE user_subscriptions SET
          plan_id = $1,
          status = $2,
          current_period_start = $3,
          current_period_end = $4,
          stripe_customer_id = $5,
          stripe_subscription_id = $6,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $7
      `, [
        planId,
        'active',
        now.toISOString(),
        currentPeriodEnd.toISOString(),
        stripeCustomerId,
        stripeSubscriptionId,
        req.user.id
      ]);
    } else {
      // No existing subscription, insert a new one
      await query(`
        INSERT INTO user_subscriptions 
          (user_id, plan_id, status, 
           current_period_start, current_period_end,
           stripe_customer_id, stripe_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [
        req.user.id,
        planId,
        'active',
        now.toISOString(),
        currentPeriodEnd.toISOString(),
        stripeCustomerId,
        stripeSubscriptionId
      ]);
    }
    
    console.log('Subscription created or updated successfully');
    
    // Generate an access token for API access
    const generatedAccessToken = Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
    // Return success response
    return res.status(200).json({
      success: true,
      accessToken: generatedAccessToken,
      subscription: {
        plan: plan,
        status: 'active',
        current_period_end: currentPeriodEnd.toISOString(),
        expiresAt: currentPeriodEnd.toISOString()
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Failed to verify payment', message: error.message });
  }
}

export default withAuth(handler);
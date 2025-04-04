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
    
    // Generate access token
    const accessToken = Array(32)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('');
    
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
    
    // Use UPSERT to either create or update the subscription in one query
    try {
      await query(`
        INSERT INTO user_subscriptions 
          (user_id, plan_id, status,
           current_period_start, current_period_end, access_token,
           stripe_customer_id, stripe_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          plan_id = EXCLUDED.plan_id,
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          access_token = EXCLUDED.access_token,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          updated_at = CURRENT_TIMESTAMP
      `, [
        req.user.id,
        planId,
        'active',
        now.toISOString(),
        currentPeriodEnd.toISOString(),
        accessToken,
        stripeCustomerId,
        stripeSubscriptionId
      ]);
      
      console.log('Subscription created or updated successfully');
    } catch (e) {
      console.error('Error upserting subscription:', e);
      
      // If the UPSERT fails (possibly due to ON CONFLICT constraint), 
      // try a simple INSERT as a fallback
      if (e.message.includes('constraint')) {
        console.log('Attempting fallback to simple insert...');
        
        // Try to delete existing subscription first
        await query('DELETE FROM user_subscriptions WHERE user_id = $1', [req.user.id]);
        
        // Then insert new one
        await query(`
          INSERT INTO user_subscriptions 
            (user_id, plan_id, status,
             current_period_start, current_period_end, access_token,
             stripe_customer_id, stripe_subscription_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          req.user.id,
          planId,
          'active',
          now.toISOString(),
          currentPeriodEnd.toISOString(),
          accessToken,
          stripeCustomerId,
          stripeSubscriptionId
        ]);
      } else {
        // If it's not a constraint error, rethrow
        throw e;
      }
    }
    
    // Get the updated subscription
    const updatedSubResult = await query(
      'SELECT us.*, sp.name as plan_name FROM user_subscriptions us ' +
      'JOIN subscription_plans sp ON us.plan_id = sp.id ' +
      'WHERE us.user_id = $1',
      [req.user.id]
    );
    
    if (updatedSubResult.rows.length === 0) {
      console.error('Unable to find subscription after creation/update');
      
      // Return a basic response with the access token we generated
      return res.status(200).json({
        success: true,
        accessToken: accessToken,
        subscription: {
          plan: plan,
          status: 'active',
          current_period_end: currentPeriodEnd.toISOString(),
          expiresAt: currentPeriodEnd.toISOString()
        }
      });
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
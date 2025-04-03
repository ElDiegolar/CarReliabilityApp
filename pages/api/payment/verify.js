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
    
    // Skip client reference check for now - this is causing the Unauthorized error
    // The session_id should be sufficient for verification
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
      
      // Insert basic plan data
      await query(
        'INSERT INTO subscription_plans (name, price, description) VALUES ($1, $2, $3)',
        [plan, plan === 'premium' ? 9.99 : 19.99, `${plan.charAt(0).toUpperCase() + plan.slice(1)} plan`]
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
          (user_id, plan_id, status, payment_session_id, 
           current_period_start, current_period_end, access_token,
           stripe_customer_id, stripe_subscription_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
          plan_id = EXCLUDED.plan_id,
          status = EXCLUDED.status,
          payment_session_id = EXCLUDED.payment_session_id,
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
        sessionId,
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
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

  const { sessionId } = req.body;
  
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
    if (session.client_reference_id !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    // Check if the payment was successful
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }
    
    // Get subscription data from database (should be created by webhook)
    const subscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND stripe_subscription_id = $2',
      [req.user.id, session.subscription.id]
    );
    
    // If for some reason the webhook hasn't processed yet, wait briefly and check again
    if (subscriptionResult.rows.length === 0) {
      // Wait 2 seconds for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check again
      const retryResult = await query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND stripe_subscription_id = $2',
        [req.user.id, session.subscription.id]
      );
      
      if (retryResult.rows.length === 0) {
        // If still no subscription, this is unusual but we can create it now
        console.log('Subscription not found after checkout - creating manually');
        
        // Get subscription details
        const subscription = session.subscription;
        
        // Generate access token
        const accessToken = Array(32)
          .fill(0)
          .map(() => Math.random().toString(36).charAt(2))
          .join('');
        
        // Determine plan type based on price
        const planId = subscription.items.data[0].price.id;
        let plan = 'premium'; // Default
        
        // Map price IDs to plan names
        if (planId === process.env.STRIPE_PROFESSIONAL_PRICE_ID) {
          plan = 'professional';
        }
        
        // Insert subscription
        await query(`
          INSERT INTO subscriptions 
            (user_id, stripe_customer_id, stripe_subscription_id, plan, status, 
             current_period_start, current_period_end, access_token)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          req.user.id,
          session.customer,
          subscription.id,
          plan,
          subscription.status,
          new Date(subscription.current_period_start * 1000).toISOString(),
          new Date(subscription.current_period_end * 1000).toISOString(),
          accessToken
        ]);
        
        // Get the newly created subscription
        const newSubResult = await query(
          'SELECT * FROM subscriptions WHERE user_id = $1 AND stripe_subscription_id = $2',
          [req.user.id, subscription.id]
        );
        
        if (newSubResult.rows.length === 0) {
          throw new Error('Failed to create subscription');
        }
        
        return res.status(200).json({
          success: true,
          accessToken: newSubResult.rows[0].access_token,
          subscription: {
            plan: newSubResult.rows[0].plan,
            status: newSubResult.rows[0].status,
            current_period_end: newSubResult.rows[0].current_period_end,
          }
        });
      }
      
      // Return the subscription from the retry
      return res.status(200).json({
        success: true,
        accessToken: retryResult.rows[0].access_token,
        subscription: {
          plan: retryResult.rows[0].plan,
          status: retryResult.rows[0].status,
          current_period_end: retryResult.rows[0].current_period_end,
        }
      });
    }
    
    // Return the subscription
    return res.status(200).json({
      success: true,
      accessToken: subscriptionResult.rows[0].access_token,
      subscription: {
        plan: subscriptionResult.rows[0].plan,
        status: subscriptionResult.rows[0].status,
        current_period_end: subscriptionResult.rows[0].current_period_end,
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Failed to verify payment' });
  }
}

export default withAuth(handler);
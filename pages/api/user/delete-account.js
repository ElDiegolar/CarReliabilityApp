// pages/api/user/delete-account.js
import { withAuth } from '../../../lib/auth';
import { query } from '../../../lib/database';
import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Start a transaction to ensure all operations are atomic
    await query('BEGIN');

    try {
      // Get user subscription information
      const subscriptionResult = await query(`
        SELECT us.stripe_customer_id, us.stripe_subscription_id
        FROM user_subscriptions us
        WHERE us.user_id = $1 AND us.status = 'active'
      `, [req.user.id]);

      // If user has active subscription, mark it as cancelled in Stripe
      if (subscriptionResult.rows.length > 0) {
        const { stripe_customer_id, stripe_subscription_id } = subscriptionResult.rows[0];
        
        if (stripe_subscription_id) {
          try {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
            
            // Cancel the subscription at Stripe
            await stripe.subscriptions.cancel(stripe_subscription_id, {
              prorate: true
            });
            
            console.log(`Stripe subscription ${stripe_subscription_id} cancelled for user ${req.user.id}`);
          } catch (stripeError) {
            console.error('Stripe subscription cancellation error:', stripeError);
            // Continue with account deletion even if Stripe operation fails
          }
        }
      }
      
      // Delete user subscriptions
      await query('DELETE FROM user_subscriptions WHERE user_id = $1', [req.user.id]);
      
      // Delete search history
      await query('DELETE FROM searches WHERE user_id = $1', [req.user.id]);
      
      // Finally, delete the user account
      await query('DELETE FROM users WHERE id = $1', [req.user.id]);
      
      // Commit the transaction
      await query('COMMIT');
      
      return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Account deletion error:', error);
    return res.status(500).json({ error: 'Failed to delete account' });
  }
}

export default withAuth(handler);
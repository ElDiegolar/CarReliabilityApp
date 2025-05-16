// pages/api/create-billing-portal-session.js
import { withAuth } from '../../lib/auth';
import { query } from '../../lib/database';
import Stripe from 'stripe';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get the user's Stripe customer ID
    const userResult = await query(
      'SELECT stripe_customer_id FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    let stripeCustomerId = userResult.rows[0].stripe_customer_id;
    
    // If no customer ID exists, we can't proceed
    if (!stripeCustomerId) {
      return res.status(400).json({ 
        error: 'No active subscription found. Please subscribe first.' 
      });
    }

    // Create a billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/profile`,
    });

    // Return the URL to the client
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe billing portal error:', error);
    return res.status(500).json({ 
      error: 'Failed to create billing portal session',
      message: error.message 
    });
  }
}

export default withAuth(handler);
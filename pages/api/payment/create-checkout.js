// pages/api/payment/create-checkout.js
import Stripe from 'stripe';
import { withAuth } from '../../../lib/auth';

export const config = {
  runtime: 'nodejs',
};

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { priceId } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    // Get or create the customer
    let customerId;
    const customerSearch = await stripe.customers.search({
      query: `email:'${req.user.email}'`,
    });
    
    if (customerSearch.data.length > 0) {
      customerId = customerSearch.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: req.user.email,
        metadata: {
          userId: req.user.id,
        },
      });
      customerId = customer.id;
    }

    // Create the checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-cancel`,
      customer: customerId,
      client_reference_id: req.user.id.toString(),
    });

    return res.status(200).json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Create checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}

export default withAuth(handler);
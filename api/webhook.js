import Stripe from 'stripe';
import { buffer } from 'micro';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20', // Lock to a specific version for stability
});

// Disable Vercel's automatic body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Stripe Webhook Handler
 * @param {import('http').IncomingMessage} req - The incoming request
 * @param {import('http').ServerResponse} res - The response object
 */
export default async function handler(req, res) {
  // Restrict to POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  const isDebug = process.env.NODE_ENV !== 'production'; // Enable debug logs in dev

  try {
    // Validate required inputs
    if (!signature) {
      throw new Error('Missing stripe-signature header');
    }
    if (!endpointSecret) {
      throw new Error('Webhook secret not configured');
    }

    // Capture the raw body as a buffer
    const rawBody = await buffer(req);
    if (!rawBody || rawBody.length === 0) {
      throw new Error('Empty request body');
    }

    // Debug logging (optional, toggle with isDebug)
    if (isDebug) {
      console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
      console.log('✅ Raw body (Buffer):', rawBody);
      console.log('✅ Raw body (String):', rawBody.toString());
      console.log('✅ Signature Header:', signature);
      console.log('✅ Endpoint Secret:', endpointSecret);
    }

    // Verify and construct the Stripe event
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    if (isDebug) {
      console.log('✅ Webhook verified:', event.type);
    }

    // Handle specific event types
    switch (event.type) {
      case 'customer.created':
        if (isDebug) {
          console.log('✅ Customer Created:', event.data.object.id);
        }
        // Add your business logic here (e.g., save to database)
        break;
      case 'customer.subscription.created':
        if (isDebug) {
          console.log('✅ Subscription Created:', event.data.object.id);
        }
        // Add your business logic here
        break;
      case 'invoice.payment_succeeded':
        if (isDebug) {
          console.log('💰 Payment Succeeded:', event.data.object.id);
        }
        // Add your business logic here
        break;
      default:
        if (isDebug) {
          console.log(`Unhandled event type: ${event.type}`);
        }
        // Optionally log unhandled events to monitor new types
    }

    // Acknowledge successful receipt to Stripe
    return res.status(200).json({ received: true });
  } catch (err) {
    // Handle specific Stripe signature verification errors
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }

    // Handle other errors (e.g., missing body, misconfiguration)
    console.error('❌ Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}
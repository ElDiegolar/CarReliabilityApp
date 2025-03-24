import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

// Disable Vercel's automatic body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * Get raw body from request as a Buffer
 * @param {import('http').IncomingMessage} req
 * @returns {Promise<Buffer>}
 */
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', (err) => reject(err));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];
  const isDebug = true;

  try {
    // Validate inputs
    if (!signature) throw new Error('Missing stripe-signature header');
    if (!endpointSecret) throw new Error('Webhook secret not configured');

    // Get raw body as a Buffer
    const rawBody = await getRawBody(req);
    if (!rawBody || rawBody.length === 0) throw new Error('Empty request body');

    // Debug logs
    if (isDebug) {
      console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
      console.log('✅ Raw body (Buffer):', rawBody);
      console.log('✅ Raw body (String):', rawBody.toString());
      console.log('✅ Signature Header:', signature);
      console.log('✅ Endpoint Secret:', endpointSecret);
    }

    // Verify webhook event
    const event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    if (isDebug) console.log('✅ Webhook verified:', event.type);

    // Handle events
    switch (event.type) {
      case 'customer.created':
        if (isDebug) console.log('✅ Customer Created:', event.data.object.id);
        break;
      case 'customer.subscription.created':
        if (isDebug) console.log('✅ Subscription Created:', event.data.object.id);
        break;
      case 'invoice.payment_succeeded':
        if (isDebug) console.log('💰 Payment Succeeded:', event.data.object.id);
        break;
      default:
        if (isDebug) console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeSignatureVerificationError) {
      console.error('❌ Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook signature verification failed: ${err.message}` });
    }
    console.error('❌ Webhook error:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }
}
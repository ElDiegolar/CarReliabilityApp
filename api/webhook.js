import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    // Use micro's buffer utility to capture the raw body
    const rawBody = await buffer(req);

    console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
    console.log('✅ Raw body (Buffer):', rawBody);
    console.log('✅ Raw body (String):', rawBody.toString());
    console.log('✅ Signature Header:', signature);
    console.log('✅ Endpoint Secret:', endpointSecret);

    // Construct the Stripe event
    event = stripe.webhooks.constructEvent(
      rawBody,  // Raw body as a buffer
      signature,
      endpointSecret
    );
    console.log('✅ Webhook verified:', event.type);

    // Handle the event
    switch (event.type) {
      case 'customer.created':
        console.log('✅ Customer Created:', event.data.object.id);
        break;
      case 'customer.subscription.created':
        console.log('✅ Subscription Created:', event.data.object.id);
        break;
      case 'invoice.payment_succeeded':
        console.log('💰 Payment Succeeded:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}

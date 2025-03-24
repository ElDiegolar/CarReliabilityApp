// Import required modules
import { buffer } from 'micro';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers['stripe-signature'];

  let event;

  try {
    // Read the raw body from the incoming request using micro's buffer
    const rawBody = await buffer(req);

    console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
    console.log('✅ Raw body (Buffer):', rawBody);
    console.log('✅ Raw body (String):', rawBody.toString());
    console.log('✅ Signature Header:', signature);
    console.log('✅ Endpoint Secret:', endpointSecret);

    // Construct the Stripe event using the raw body and signature
    event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
    console.log('✅ Webhook verified:', event.type);

  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('💰 Payment succeeded:', event.data.object.id);
        break;
      case 'customer.subscription.created':
        console.log('✅ Subscription Created:', event.data.object.id);
        break;
      case 'customer.subscription.updated':
        console.log('🔄 Subscription Updated:', event.data.object.id);
        break;
      case 'customer.subscription.deleted':
        console.log('❌ Subscription Deleted:', event.data.object.id);
        break;
      case 'invoice.payment_succeeded':
        console.log('✅ Invoice Payment Succeeded:', event.data.object.id);
        break;
      case 'invoice.payment_failed':
        console.log('❗ Invoice Payment Failed:', event.data.object.id);
        break;
      case 'customer.created':
        console.log('✅ Customer Created:', event.data.object.id);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error(`❌ Error processing webhook event: ${err.message}`);
    res.status(500).send(`Server Error: ${err.message}`);
  }
}

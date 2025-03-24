// Disable Vercel's default body parsing
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  import { buffer } from 'micro';
  import Stripe from 'stripe';
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      return res.status(405).send('Method Not Allowed');
    }
  
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
  
    try {
      // Read the raw body from the incoming request
      const rawBody = await buffer(req);
      
      // Only log these in development environment
      if (process.env.NODE_ENV !== 'production') {
        console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
        console.log('✅ Signature Header:', signature);
        console.log('✅ Endpoint Secret present:', !!endpointSecret);
      }
  
      // Construct the event using the raw body and signature
      // IMPORTANT: Pass the raw buffer directly without transforming it
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
          // Add your business logic here
          break;
          
        case 'customer.subscription.created':
          console.log('✅ Subscription Created:', event.data.object.id);
          // Handle new subscription
          break;
          
        case 'customer.subscription.updated':
          console.log('🔄 Subscription Updated:', event.data.object.id);
          // Handle subscription update
          break;
          
        case 'customer.subscription.deleted':
          console.log('❌ Subscription Deleted:', event.data.object.id);
          // Handle subscription cancellation
          break;
          
        case 'invoice.payment_succeeded':
          console.log('✅ Invoice Payment Succeeded:', event.data.object.id);
          // Handle successful payment
          break;
          
        case 'invoice.payment_failed':
          console.log('❗ Invoice Payment Failed:', event.data.object.id);
          // Handle failed payment
          break;
          
        case 'customer.created':
          console.log('✅ Customer Created:', event.data.object.id);
          // Handle new customer
          break;
          
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
  
      // Return a 200 response to acknowledge receipt of the event
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`❌ Error processing webhook event: ${err.message}`);
      res.status(500).send(`Server Error: ${err.message}`);
    }
  }
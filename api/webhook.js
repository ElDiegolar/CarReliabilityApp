// Disable Vercel's default body parsing
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  import Stripe from 'stripe';
  import { buffer } from 'micro';
  
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Method Not Allowed');
    }
  
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    
    console.log('✅ endpointSecret:', endpointSecret);
  
    let event;
    let rawBody;
  
    try {
      // Use micro's buffer to get the raw body
      rawBody = await buffer(req);
  
      // Validate if rawBody is a Buffer
      console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
  
      // Explicitly convert raw body to buffer
      const buf = Buffer.from(rawBody);
  
      console.log('✅ Raw body (Buffer):', buf);
      console.log('✅ Raw body (String):', buf.toString());
      console.log('✅ Signature Header:', signature);
  
      // Construct the event using the raw body and signature
      event = stripe.webhooks.constructEvent(buf, signature, endpointSecret);
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
  
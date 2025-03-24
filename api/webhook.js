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
      res.setHeader('Allow', 'POST');
      return res.status(405).send('Method Not Allowed');
    }
  
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
    let rawBody;
  
    try {
      // Get the raw body as a buffer
      rawBody = await buffer(req);
  
      // Detailed logging
      console.log('🚀🚀🚀 Start Signature Verification 🚀🚀🚀');
      console.log('✅ Raw body (Buffer):', rawBody);
      console.log('✅ Raw body (String):', rawBody.toString());
      console.log('✅ Signature Header:', signature);
      console.log('✅ Endpoint Secret:', endpointSecret);
  
      // Check if the raw body is actually a buffer
      console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
  
      // Log the actual payload as string
      const payloadString = rawBody.toString('utf8');
      console.log('✅ Payload String:', payloadString);
  
      // Attempt signature verification
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
      console.log('✅ Webhook verified:', event.type);
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
  
      // Log the raw body as a hex dump to inspect its contents
      console.error('Hex dump of raw body:', rawBody.toString('hex'));
  
      // Log the headers in case of discrepancies
      console.error('Request Headers:', JSON.stringify(req.headers));
  
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
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
  
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`❌ Error processing webhook event: ${err.message}`);
      res.status(500).send(`Server Error: ${err.message}`);
    }
  }
  
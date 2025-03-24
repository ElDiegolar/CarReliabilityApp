// Disable Vercel's default body parsing
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  import express from 'express';
  import Stripe from 'stripe';
  
  const app = express();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Middleware to enforce raw body parsing for Stripe webhooks
  app.use('/api/webhook', express.raw({ type: 'application/json' }));
  
  // Webhook handler
  app.post('/api/webhook', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;
  
    try {
      // Directly using the raw body
      const rawBody = req.body;
      console.log('✅ Is Buffer:', Buffer.isBuffer(rawBody));
      console.log('✅ Raw body (Buffer):', rawBody);
      console.log('✅ Raw body (String):', rawBody.toString());
      console.log('✅ Signature Header:', signature);
      console.log('✅ Endpoint Secret:', endpointSecret);
  
      // Explicitly convert raw body to UTF-8 string and back to buffer to ensure encoding consistency
      const rawBodyString = rawBody.toString('utf8');
      const processedBody = Buffer.from(rawBodyString, 'utf8');
  
      // Log the processed buffer and its string representation
      console.log('✅ Processed raw body (String):', rawBodyString);
      console.log('✅ Processed raw body (Buffer):', processedBody);
  
      // Construct the event using the processed body and signature
      event = stripe.webhooks.constructEvent(processedBody, signature, endpointSecret);
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
  });
  
  export default app;
  
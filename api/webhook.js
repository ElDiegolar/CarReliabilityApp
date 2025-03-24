// Disable Vercel's default body parsing for this API route
export const config = {
    api: {
      bodyParser: false,
    },
  };
  
  import { buffer } from 'micro';
  import Stripe from 'stripe';
  import { query } from './database'; // Adjust path as needed
  
  // Initialize Stripe with your secret key
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  
  // Helper function to log webhook events
  async function logEvent(eventType, eventObject, signature, rawBody, status, errorMessage = null) {
    try {
      const log = await query(`
        INSERT INTO webhook_logs (
          event_type,
          event_object,
          stripe_signature,
          raw_body,
          processing_status,
          error_message
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        eventType,
        JSON.stringify(eventObject),
        signature,
        rawBody,
        status,
        errorMessage
      ]);
      return log.rows[0].id;
    } catch (err) {
      console.error('Error logging webhook event:', err.message);
      return null;
    }
  }
  
  // Main webhook handler function
  export default async function handler(req, res) {
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      res.status(405).send('Method Not Allowed');
      return;
    }
  
    const signature = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
    let event;
    let rawBody;
  
    try {
      // Use the micro buffer to get the raw body
      rawBody = await buffer(req);
  
      // Construct the event using the raw body and signature
      event = stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
      console.log('✅ Webhook verified:', event.type);
  
      // Log the verified event
      await logEvent(event.type, event.data.object, signature, rawBody.toString('utf8'), 'verified');
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err.message);
      await logEvent('unknown', {}, signature, rawBody ? rawBody.toString('utf8') : '', 'verification_failed', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }
  
    try {
      // Process the webhook event based on its type
      switch (event.type) {
        case 'checkout.session.completed':
          await handleCheckoutSessionCompleted(event.data.object);
          break;
          
        case 'customer.subscription.created':
          await handleSubscriptionCreated(event.data.object);
          break;
  
        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event.data.object);
          break;
  
        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event.data.object);
          break;
  
        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event.data.object);
          break;
  
        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event.data.object);
          break;
  
        case 'customer.created':
          await handleCustomerCreated(event.data.object);
          break;
  
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
  
      res.status(200).json({ received: true });
    } catch (err) {
      console.error(`❌ Error processing webhook event: ${err.message}`);
      await logEvent(event.type, event.data.object, signature, rawBody.toString('utf8'), 'processing_failed', err.message);
      res.status(500).send(`Server Error: ${err.message}`);
    }
  }
  
  // Webhook handler functions
  async function handleCheckoutSessionCompleted(data) {
    console.log('✅ Checkout Session Completed:', data.id);
    // Handle successful checkout session here
  }
  
  async function handleSubscriptionCreated(data) {
    console.log('✅ Subscription Created:', data.id);
    // Handle subscription creation here
  }
  
  async function handleSubscriptionUpdated(data) {
    console.log('✅ Subscription Updated:', data.id);
    // Handle subscription update here
  }
  
  async function handleSubscriptionDeleted(data) {
    console.log('❌ Subscription Deleted:', data.id);
    // Handle subscription deletion here
  }
  
  async function handleInvoicePaymentSucceeded(data) {
    console.log('✅ Invoice Payment Succeeded:', data.id);
    // Handle successful invoice payment here
  }
  
  async function handleInvoicePaymentFailed(data) {
    console.log('❌ Invoice Payment Failed:', data.id);
    // Handle failed invoice payment here
  }
  
  async function handleCustomerCreated(data) {
    console.log('✅ Customer Created:', data.id);
    // Handle customer creation here
  }
  
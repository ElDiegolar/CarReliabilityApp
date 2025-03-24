// api/webhook.js - Dedicated serverless function for Stripe webhooks
import Stripe from 'stripe';
import { query } from './database'; // Adjust path as needed

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Import handler functions
import {
  handleCheckoutSessionCompleted,
  handleSubscriptionCreated,
  handleSubscriptionUpdated,
  handleSubscriptionDeleted,
  handleInvoicePaymentSucceeded,
  handleInvoicePaymentFailed,
  handleCustomerCreated
} from '../webhookhandlers'; // Create this file with your handler functions

export const config = {
  api: {
    // Disable body parsing - crucial for Stripe signatures to work
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  
  // Get raw request body for signature verification
  const chunks = [];
  
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  
  const rawBody = Buffer.concat(chunks);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  // Debug logs
  console.log('Webhook received:', new Date().toISOString());
  console.log('Signature present:', !!sig);
  console.log('Secret configured:', !!endpointSecret);
  console.log('Body length:', rawBody.length);
  
  let event;
  let logId = null;
  
  try {
    // Log the webhook first
    try {
      // Try to parse the JSON for logging
      const parsedBody = JSON.parse(rawBody.toString('utf8'));
      
      const result = await query(`
        INSERT INTO webhook_logs (
          event_id,
          event_type, 
          event_object, 
          stripe_signature, 
          raw_body, 
          processing_status
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [
        parsedBody.id || `unknown_${Date.now()}`,
        parsedBody.type || 'unknown',
        JSON.stringify(parsedBody.data?.object || {}),
        sig,
        rawBody.length > 10000 ? rawBody.toString().substring(0, 10000) + '...' : rawBody.toString(),
        'received'
      ]);
      
      logId = result.rows[0].id;
      console.log(`Webhook logged with ID: ${logId}`);
    } catch (logError) {
      console.error('Error logging webhook:', logError);
      // Continue even if logging fails
    }
    
    // Verify the webhook signature
    if (process.env.NODE_ENV === 'production') {
      // Strict verification in production
      if (!endpointSecret) {
        throw new Error('Webhook secret not configured in production environment');
      }
      
      event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
      console.log('Webhook signature verified successfully');
      
      // Update log after successful verification
      if (logId) {
        await query(`
          UPDATE webhook_logs 
          SET processing_status = $1
          WHERE id = $2
        `, ['verified', logId]);
      }
    } else {
      // Development mode - try verification but don't require it
      try {
        if (endpointSecret) {
          event = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
          console.log('Webhook signature verified successfully');
        } else {
          throw new Error('No webhook secret configured');
        }
      } catch (verifyError) {
        console.warn("Webhook verification failed in dev mode:", verifyError.message);
        // Parse the JSON directly in development
        event = JSON.parse(rawBody.toString('utf8'));
        console.log('Using parsed JSON for development');
      }
      
      // Update log for dev mode
      if (logId) {
        await query(`
          UPDATE webhook_logs 
          SET processing_status = $1
          WHERE id = $2
        `, ['dev_mode', logId]);
      }
    }
    
    // Process the webhook based on event type
    console.log(`Processing webhook event: ${event.type}`);
    
    // Update log to processing
    if (logId) {
      await query(`
        UPDATE webhook_logs 
        SET processing_status = $1
        WHERE id = $2
      `, ['processing', logId]);
    }
    
    // Handle the event
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
    
    // Update log to completed
    if (logId) {
      await query(`
        UPDATE webhook_logs 
        SET processing_status = $1
        WHERE id = $2
      `, ['completed', logId]);
    }
    
    // Return a 200 response
    return res.status(200).json({ 
      received: true, 
      eventType: event.type,
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    console.error('Webhook error:', error.message);
    
    // Update log with error
    if (logId) {
      await query(`
        UPDATE webhook_logs 
        SET processing_status = $1,
            error_message = $2
        WHERE id = $3
      `, ['failed', error.message, logId]);
    }
    
    // Return appropriate status code
    // Return 400 for verification errors, 500 for server errors
    const statusCode = error.message.includes('signature') ? 400 : 500;
    
    return res.status(statusCode).json({
      error: error.message
    });
  }
}
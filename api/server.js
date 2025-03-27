const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, query } = require('./database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
dotenv.config();

const app = express();

// CORS middleware
app.use(cors({
  origin: "*", // Allow all domains (restrict in production)
  methods: "GET,POST,OPTIONS,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

// JSON body parsing for all routes
app.use(express.json());

// Initialize database tables if they don't exist
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', 
      [email, hashedPassword]
    );

    const userId = userResult.rows[0].id;
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: 'User registered successfully',
      user: { id: userId, email },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Example protected route using authenticateToken
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(userResult.rows[0]);
  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await query(`SELECT * FROM users WHERE id = $1`, [id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, password, stripe_customer_id } = req.body;

  try {
    const result = await query(`
      UPDATE users 
      SET email = $1, password = $2, stripe_customer_id = $3 
      WHERE id = $4 RETURNING *
    `, [email, password, stripe_customer_id, id]);

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'User update failed' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await query(`DELETE FROM users WHERE id = $1`, [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'User deletion failed' });
  }
});

// CRUD for Subscriptions
app.get('/api/subscriptions', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM subscriptions`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile', full_error: error });
  }
});

// Create a payment intent directly
app.post('/api/create-payment-intent', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Define plan prices
    const planPrices = {
      'premium': 149.99,
      'basic': 49.99
    };
    
    // Default to premium if plan not specified
    const selectedPlan = plan || 'premium';
    const amount = planPrices[selectedPlan] || planPrices['premium'];
    
    // Create or retrieve Stripe customer
    let stripeCustomerId = null;
    const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows[0]?.stripe_customer_id) {
      stripeCustomerId = userResult.rows[0].stripe_customer_id;
    } else {
      // Get user email
      const userEmailResult = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const email = userEmailResult.rows[0]?.email;
      
      if (!email) {
        return res.status(404).json({ error: 'User email not found' });
      }
      
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: req.user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user record
      await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
        [stripeCustomerId, req.user.id]);
    }
    
    // Calculate amount in cents
    const amountInCents = Math.round(amount * 100);
    
    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      metadata: {
        userId: req.user.id,
        plan: selectedPlan
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    // Save payment intent to database
    await query(`
      INSERT INTO payments (user_id, stripe_payment_id, amount, status, payment_method)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, paymentIntent.id, amount, 'pending', 'card']);
    
    // Return the client secret to the client
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amount
    });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    res.status(500).json({ error: 'Failed to create payment intent', message: error.message });
  }
});

// Check payment status and activate subscription
app.post('/api/check-payment-status', authenticateToken, async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    
    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID is required' });
    }
    
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // If payment is not successful, return current status
    if (paymentIntent.status !== 'succeeded') {
      return res.status(200).json({
        status: paymentIntent.status,
        success: false,
        message: `Payment status is ${paymentIntent.status}`
      });
    }
    
    // Get plan from payment intent metadata
    const plan = paymentIntent.metadata.plan || 'premium';
    
    // Update payment record in database
    await query(`
      UPDATE payments 
      SET status = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE stripe_payment_id = $2
    `, ['completed', paymentIntentId]);
    
    // Generate access token for subscription
    const accessToken = uuidv4();
    
    // Set subscription expiration date (e.g., 1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Check existing subscription
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, access_token = $3, updated_at = CURRENT_TIMESTAMP, expires_at = $4
        WHERE id = $5
      `, [plan, 'active', accessToken, expiryDate.toISOString(), existingSub.id]);
    } else {
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, plan, 'active', accessToken, expiryDate.toISOString()]);
    }
    
    res.status(200).json({
      success: true,
      status: 'completed',
      message: 'Payment verified and subscription activated',
      subscription: {
        plan: plan,
        status: 'active',
        accessToken: accessToken,
        expiresAt: expiryDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed', message: error.message });
  }
});

// Handle direct card payment
app.post('/api/process-card-payment', authenticateToken, async (req, res) => {
  try {
    const { 
      cardNumber, 
      expMonth, 
      expYear, 
      cvc, 
      plan 
    } = req.body;
    
    if (!cardNumber || !expMonth || !expYear || !cvc) {
      return res.status(400).json({ error: 'Card details are required' });
    }
    
    // Define plan prices
    const planPrices = {
      'premium': 149.99,
      'basic': 49.99
    };
    
    // Default to premium if plan not specified
    const selectedPlan = plan || 'premium';
    const amount = planPrices[selectedPlan] || planPrices['premium'];
    
    try {
      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: 'card',
        card: {
          number: cardNumber,
          exp_month: expMonth,
          exp_year: expYear,
          cvc: cvc
        }
      });
      
      // Create or retrieve Stripe customer
      let stripeCustomerId = null;
      const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
      
      if (userResult.rows[0]?.stripe_customer_id) {
        stripeCustomerId = userResult.rows[0].stripe_customer_id;
      } else {
        // Get user email
        const userEmailResult = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
        const email = userEmailResult.rows[0]?.email;
        
        if (!email) {
          return res.status(404).json({ error: 'User email not found' });
        }
        
        // Create Stripe customer
        const customer = await stripe.customers.create({
          email: email,
          payment_method: paymentMethod.id,
          metadata: {
            userId: req.user.id
          }
        });
        
        stripeCustomerId = customer.id;
        
        // Save Stripe customer ID to user record
        await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
          [stripeCustomerId, req.user.id]);
      }
      
      // Attach payment method to customer if not already attached
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId
      });
      
      // Calculate amount in cents
      const amountInCents = Math.round(amount * 100);
      
      // Create and confirm payment intent in one step
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd',
        customer: stripeCustomerId,
        payment_method: paymentMethod.id,
        confirm: true, // Confirm the payment immediately
        metadata: {
          userId: req.user.id,
          plan: selectedPlan
        }
      });
      
      // Handle payment intent status
      if (paymentIntent.status === 'succeeded') {
        // Save payment record to database
        await query(`
          INSERT INTO payments (user_id, stripe_payment_id, amount, status, payment_method)
          VALUES ($1, $2, $3, $4, $5)
        `, [req.user.id, paymentIntent.id, amount, 'completed', 'card']);
        
        // Generate access token for subscription
        const accessToken = uuidv4();
        
        // Set subscription expiration date (1 year from now)
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        
        // Check existing subscription
        const existingSubscriptionResult = await query(
          'SELECT * FROM subscriptions WHERE user_id = $1',
          [req.user.id]
        );
        
        if (existingSubscriptionResult.rows.length > 0) {
          const existingSub = existingSubscriptionResult.rows[0];
          await query(`
            UPDATE subscriptions 
            SET plan = $1, status = $2, access_token = $3, updated_at = CURRENT_TIMESTAMP, expires_at = $4
            WHERE id = $5
          `, [selectedPlan, 'active', accessToken, expiryDate.toISOString(), existingSub.id]);
        } else {
          await query(`
            INSERT INTO subscriptions 
            (user_id, plan, status, access_token, expires_at) 
            VALUES ($1, $2, $3, $4, $5)
          `, [req.user.id, selectedPlan, 'active', accessToken, expiryDate.toISOString()]);
        }
        
        res.status(200).json({
          success: true,
          status: 'completed',
          message: 'Payment processed and subscription activated',
          subscription: {
            plan: selectedPlan,
            status: 'active',
            accessToken,
            expiresAt: expiryDate.toISOString()
          }
        });
      } else if (paymentIntent.status === 'requires_action') {
        // Requires additional action like 3D Secure
        res.status(200).json({
          success: false,
          status: paymentIntent.status,
          requires_action: true,
          payment_intent_client_secret: paymentIntent.client_secret,
          message: 'Additional authentication required'
        });
      } else {
        // Payment failed or is in another state
        res.status(200).json({
          success: false,
          status: paymentIntent.status,
          message: `Payment status: ${paymentIntent.status}`
        });
      }
    } catch (stripeError) {
      console.error('Stripe payment processing error:', stripeError);
      res.status(400).json({ 
        error: 'Payment processing failed', 
        message: stripeError.message,
        code: stripeError.code
      });
    }
  } catch (error) {
    console.error('Card payment error:', error);
    res.status(500).json({ error: 'Failed to process card payment', message: error.message });
  }
});

// Create client-side payment method
app.post('/api/create-payment-method', authenticateToken, async (req, res) => {
  try {
    const { 
      paymentMethodId,
      plan
    } = req.body;
    
    if (!paymentMethodId) {
      return res.status(400).json({ error: 'Payment method ID is required' });
    }
    
    // Define plan prices
    const planPrices = {
      'premium': 149.99,
      'basic': 49.99
    };
    
    // Default to premium if plan not specified
    const selectedPlan = plan || 'premium';
    const amount = planPrices[selectedPlan] || planPrices['premium'];
    
    // Create or retrieve Stripe customer
    let stripeCustomerId = null;
    const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows[0]?.stripe_customer_id) {
      stripeCustomerId = userResult.rows[0].stripe_customer_id;
    } else {
      // Get user email
      const userEmailResult = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const email = userEmailResult.rows[0]?.email;
      
      if (!email) {
        return res.status(404).json({ error: 'User email not found' });
      }
      
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: req.user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user record
      await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
        [stripeCustomerId, req.user.id]);
    }
    
    // Attach payment method to customer if it's not already
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId
      });
    } catch (attachError) {
      // If error is because it's already attached, that's fine
      if (attachError.code !== 'payment_method_already_attached') {
        throw attachError;
      }
    }
    
    // Set as default payment method
    await stripe.customers.update(stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Calculate amount in cents
    const amountInCents = Math.round(amount * 100);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: stripeCustomerId,
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        userId: req.user.id,
        plan: selectedPlan
      }
    });
    
    // Handle payment intent status
    if (paymentIntent.status === 'succeeded') {
      // Save payment record to database
      await query(`
        INSERT INTO payments (user_id, stripe_payment_id, amount, status, payment_method)
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, paymentIntent.id, amount, 'completed', 'card']);
      
      // Generate access token for subscription
      const accessToken = uuidv4();
      
      // Set subscription expiration date (1 year from now)
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      
      // Check existing subscription
      const existingSubscriptionResult = await query(
        'SELECT * FROM subscriptions WHERE user_id = $1',
        [req.user.id]
      );
      
      if (existingSubscriptionResult.rows.length > 0) {
        const existingSub = existingSubscriptionResult.rows[0];
        await query(`
          UPDATE subscriptions 
          SET plan = $1, status = $2, access_token = $3, updated_at = CURRENT_TIMESTAMP, expires_at = $4
          WHERE id = $5
        `, [selectedPlan, 'active', accessToken, expiryDate.toISOString(), existingSub.id]);
      } else {
        await query(`
          INSERT INTO subscriptions 
          (user_id, plan, status, access_token, expires_at) 
          VALUES ($1, $2, $3, $4, $5)
        `, [req.user.id, selectedPlan, 'active', accessToken, expiryDate.toISOString()]);
      }
      
      res.status(200).json({
        success: true,
        status: 'completed',
        message: 'Payment processed and subscription activated',
        subscription: {
          plan: selectedPlan,
          status: 'active',
          accessToken,
          expiresAt: expiryDate.toISOString()
        }
      });
    } else if (paymentIntent.status === 'requires_action') {
      // Requires additional action like 3D Secure
      res.status(200).json({
        success: false,
        status: paymentIntent.status,
        requires_action: true,
        payment_intent_client_secret: paymentIntent.client_secret,
        message: 'Additional authentication required'
      });
    } else {
      // Payment failed or is in another state
      res.status(200).json({
        success: false,
        status: paymentIntent.status,
        message: `Payment status: ${paymentIntent.status}`
      });
    }
  } catch (error) {
    console.error('Payment method error:', error);
    res.status(500).json({ error: 'Failed to process payment method', message: error.message });
  }
});

// Legacy route for compatibility with existing code
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { sessionId, plan } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'Session ID is required' });
  }
  
  try {
    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return res.status(400).json({ 
        error: 'Payment not completed',
        status: session.payment_status
      });
    }
    
    // Generate access token for subscription
    const accessToken = uuidv4();
    
    // Set subscription expiration date (e.g., 1 year from now)
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    
    // Add payment record
    const paymentAmount = session.amount_total / 100; // Convert from cents
    await query(`
      INSERT INTO payments (user_id, stripe_payment_id, amount, status, payment_method)
      VALUES ($1, $2, $3, $4, $5)
    `, [req.user.id, session.payment_intent, paymentAmount, 'completed', 'card']);
    
    // Check existing subscription
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, stripe_session_id = $3, access_token = $4, 
        updated_at = CURRENT_TIMESTAMP, expires_at = $5
        WHERE id = $6
      `, [plan || 'premium', 'active', sessionId, accessToken, expiryDate.toISOString(), existingSub.id]);
    } else {
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [req.user.id, plan || 'premium', 'active', sessionId, accessToken, expiryDate.toISOString()]);
    }
    
    res.status(200).json({
      message: 'Payment verified successfully',
      accessToken,
      plan: plan || 'premium',
      expiresAt: expiryDate.toISOString()
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: 'Subscription creation failed' });
  }
});

// CRUD for Payments
app.get('/api/payments', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM payments`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

app.post('/api/payments', async (req, res) => {
  const { user_id, subscription_id, amount, stripe_invoice_id } = req.body;

  try {
    const result = await query(`
      INSERT INTO payments (user_id, subscription_id, amount, stripe_invoice_id) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [user_id, subscription_id, amount, stripe_invoice_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Payment creation failed' });
  }
});

// CRUD for Searches
app.get('/api/searches', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM searches`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching searches:', error);
    res.status(500).json({ error: 'Failed to fetch searches' });
  }
});

app.post('/api/searches', async (req, res) => {
  const { user_id, year, make, model, mileage } = req.body;

  try {
    const result = await query(`
      INSERT INTO searches (user_id, year, make, model, mileage) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `, [user_id, year, make, model, mileage]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating search:', error);
    res.status(500).json({ error: 'Search creation failed' });
  }
});

// CRUD for Webhook Logs
app.get('/api/webhook-logs', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM webhook_logs`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching webhook logs:', error);
    res.status(500).json({ error: 'Failed to fetch webhook logs' });
  }
});

// Default API Route
app.get('/api', (req, res) => {
  res.json({
    message: 'Subscription and User Management API',
    version: '1.0.0',
    endpoints: [
      "/api/register", 
      "/api/login", 
      "/api/profile", 
      "/api/create-payment-intent",
      "/api/check-payment-status",
      "/api/process-card-payment",
      "/api/create-payment-method",
      "/api/verify-token", 
      "/api/car-reliability",
      "/api/users",
      "/api/user/searches",
      "/api/db-test"
    ]
  });
});

// Create Checkout Session - For compatibility with existing integrations
app.post('/api/create-checkout-session', authenticateToken, async (req, res) => {
  try {
    const { plan } = req.body;
    
    // Define plan details
    const planDetails = {
      'premium': {
        name: 'Premium Plan',
        amount: 149.99
      },
      'basic': {
        name: 'Basic Plan',
        amount: 49.99
      }
    };
    
    // Default to premium if plan not specified
    const selectedPlan = planDetails[plan] || planDetails['premium'];
    
    // Create or retrieve Stripe customer
    let stripeCustomerId = null;
    const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    
    if (userResult.rows[0]?.stripe_customer_id) {
      stripeCustomerId = userResult.rows[0].stripe_customer_id;
    } else {
      // Get user email
      const userEmailResult = await query('SELECT email FROM users WHERE id = $1', [req.user.id]);
      const email = userEmailResult.rows[0]?.email;
      
      if (!email) {
        return res.status(404).json({ error: 'User email not found' });
      }
      
      // Create Stripe customer
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: req.user.id
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Save Stripe customer ID to user record
      await query('UPDATE users SET stripe_customer_id = $1 WHERE id = $2', 
        [stripeCustomerId, req.user.id]);
    }
    
    // Calculate amount in cents
    const amountInCents = Math.round(selectedPlan.amount * 100);
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: selectedPlan.name,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'https://car-reliability-app.vercel.app'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'https://car-reliability-app.vercel.app'}/payment-cancel`,
      customer: stripeCustomerId,
      metadata: {
        userId: req.user.id,
        plan: plan || 'premium'
      }
    });
    
    res.json({ url: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// Get payment methods for a user
app.get('/api/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    const stripeCustomerId = userResult.rows[0]?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      return res.status(200).json({ paymentMethods: [] });
    }
    
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: 'card',
    });
    
    // Format payment methods to only include necessary info
    const formattedPaymentMethods = paymentMethods.data.map(pm => ({
      id: pm.id,
      brand: pm.card.brand,
      last4: pm.card.last4,
      expMonth: pm.card.exp_month,
      expYear: pm.card.exp_year,
      isDefault: false // Will be set below if applicable
    }));
    
    // Get default payment method
    const customer = await stripe.customers.retrieve(stripeCustomerId);
    const defaultPaymentMethodId = customer.invoice_settings?.default_payment_method;
    
    if (defaultPaymentMethodId) {
      const defaultMethod = formattedPaymentMethods.find(pm => pm.id === defaultPaymentMethodId);
      if (defaultMethod) {
        defaultMethod.isDefault = true;
      }
    }
    
    res.status(200).json({ paymentMethods: formattedPaymentMethods });
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
});

// Delete payment method
app.delete('/api/payment-methods/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user owns this payment method
    const userResult = await query('SELECT stripe_customer_id FROM users WHERE id = $1', [req.user.id]);
    const stripeCustomerId = userResult.rows[0]?.stripe_customer_id;
    
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const paymentMethod = await stripe.paymentMethods.retrieve(id);
    
    if (paymentMethod.customer !== stripeCustomerId) {
      return res.status(403).json({ error: 'Payment method does not belong to this customer' });
    }
    
    // Detach payment method
    await stripe.paymentMethods.detach(id);
    
    res.status(200).json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({ error: 'Failed to delete payment method' });
  }
});

// Add endpoint to view payment history
app.get('/api/payment-history', authenticateToken, async (req, res) => {
  try {
    const paymentsResult = await query(`
      SELECT p.*, s.plan 
      FROM payments p
      LEFT JOIN subscriptions s ON p.user_id = s.user_id
      WHERE p.user_id = $1 
      ORDER BY p.created_at DESC
    `, [req.user.id]);
    
    res.status(200).json(paymentsResult.rows);
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

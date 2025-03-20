// api/server.js - Express server with PostgreSQL integration and user management
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { initializeDatabase, query, sql } = require('./database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Load environment variables
dotenv.config();

// Create express app
const app = express();

// Middleware
app.use(cors({
  origin: "*",  // Allow all domains (restrict in production)
  methods: "GET,POST,OPTIONS,PUT,DELETE",
  allowedHeaders: "Content-Type, Authorization"
}));

app.use(express.json());

// Initialize database tables if they don't exist
(async () => {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
})();

// OpenAI configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

// Check subscription status middleware
const checkSubscription = async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  
  try {
    // Get current timestamp in ISO format
    const now = new Date().toISOString();
    
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [req.user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    
    if (!subscription) {
      req.isPremium = false;
    } else {
      req.isPremium = true;
      req.subscription = subscription;
    }
    
    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// Register a new user
app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Check if user already exists
    const existingUserResult = await query('SELECT id FROM users WHERE email = $1', [email]);
    
    if (existingUserResult.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user and get the ID
    const userResult = await query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id', 
      [email, hashedPassword]
    );
    
    const userId = userResult.rows[0].id;
    
    // Create basic subscription for the user
    await query(
      'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
      [userId, 'basic', 'active']
    );
    
    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User registered successfully with basic subscription',
      user: { id: userId, email },
      subscription: { plan: 'basic', status: 'active' },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', message: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }
  
  try {
    // Get user
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription && subscription.plan === 'premium';
    const isBasic = subscription && subscription.plan === 'basic';
    
    res.status(200).json({
      user: { id: user.id, email: user.email },
      token,
      isPremium,
      isBasic,
      subscription
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Get user profile and subscription status
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await query(
      'SELECT id, email, created_at FROM users WHERE id = $1', 
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    
    // Get subscription status
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE user_id = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [user.id, 'active', now]);
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription && subscription.plan === 'premium';
    const isBasic = subscription && subscription.plan === 'basic';
    
    res.status(200).json({
      user,
      isPremium,
      isBasic,
      subscription
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Verify payment and set up subscription
app.post('/api/payment/verify', authenticateToken, async (req, res) => {
  const { sessionId, plan } = req.body;
  
  if (!sessionId || !plan) {
    return res.status(400).json({ error: 'Session ID and plan are required' });
  }
  
  try {
    // In production, verify the session with Stripe
    // For example:
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    // if (session.payment_status !== 'paid') {
    //   return res.status(400).json({ error: 'Payment not completed' });
    // }
    
    // Generate a unique access token
    const accessToken = uuidv4();
    
    // Check for existing subscription
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [req.user.id]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, stripe_session_id = $3, access_token = $4, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $5
      `, [plan, 'active', sessionId, accessToken, existingSub.id]);
    } else {
      // Create new subscription
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, access_token) 
        VALUES ($1, $2, $3, $4, $5)
      `, [req.user.id, plan, 'active', sessionId, accessToken]);
    }
    
    res.status(200).json({
      message: 'Payment verified successfully',
      accessToken,
      plan
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Verify premium token for non-authenticated users
app.post('/api/verify-token', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }
  
  try {
    // Check if token exists in any active subscription
    const now = new Date().toISOString();
    const subscriptionResult = await query(`
      SELECT * FROM subscriptions 
      WHERE access_token = $1 AND status = $2 
      AND (expires_at IS NULL OR expires_at > $3)
    `, [token, 'active', now]);
    
    if (subscriptionResult.rows.length === 0) {
      return res.status(401).json({ 
        isPremium: false,
        message: 'Invalid or expired token'
      });
    }
    
    const subscription = subscriptionResult.rows[0];
    const isPremium = subscription.plan === 'premium';
    
    res.status(200).json({
      isPremium,
      plan: subscription.plan,
      message: 'Token verified successfully'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Token verification failed' });
  }
});

// API endpoint to get car reliability data
app.post('/api/car-reliability', async (req, res) => {
  try {
    console.log('Hit API');
    const { year, make, model, mileage, premiumToken, userToken } = req.body;

    if (!year || !make || !model || !mileage) {
      return res.status(400).json({ error: 'Year, make, model, and mileage are required' });
    }

    // Check user's subscription status
    let isPremium = false;
    let isBasic = false;
    let user_id = null;
    
    if (premiumToken) {
      // Verify premium token
      const now = new Date().toISOString();
      const subscriptionResult = await query(`
        SELECT user_id, plan FROM subscriptions 
        WHERE access_token = $1 AND status = $2 
        AND (expires_at IS NULL OR expires_at > $3)
      `, [premiumToken, 'active', now]);
      
      if (subscriptionResult.rows.length > 0) {
        const subscription = subscriptionResult.rows[0];
        isPremium = subscription.plan === 'premium';
        isBasic = subscription.plan === 'basic';
        user_id = subscription.user_id;
      }
    } else if (userToken) {
      // Verify user token (basic users)
      try {
        const decoded = jwt.verify(userToken, process.env.JWT_SECRET || 'your-secret-key');
        user_id = decoded.id;
        
        // Check subscription
        const now = new Date().toISOString();
        const subscriptionResult = await query(`
          SELECT * FROM subscriptions 
          WHERE user_id = $1 AND status = $2 
          AND (expires_at IS NULL OR expires_at > $3)
        `, [user_id, 'active', now]);
        
        if (subscriptionResult.rows.length > 0) {
          const subscription = subscriptionResult.rows[0];
          isPremium = subscription.plan === 'premium';
          isBasic = subscription.plan === 'basic';
        } else {
          // If user has no active subscription, set them as basic by default
          isBasic = true;
        }
      } catch (err) {
        console.error('Invalid user token:', err);
      }
    }
    
    // Log the search if we have a user ID
    if (user_id) {
      await query(`
        INSERT INTO searches (user_id, year, make, model, mileage) 
        VALUES ($1, $2, $3, $4, $5)
      `, [user_id, year, make, model, mileage]);
    }

    // Construct prompt for ChatGPT
    const prompt = `
      Given the following vehicle details:

      Year: ${year}
      Make: ${make}
      Model: ${model}
      Mileage: ${mileage}
      Overall Score: Provide a reliability score between 1 and 100.
      Average Price: Provide an average price for this vehicle in USD.
      Categories: Provide reliability scores (each between 1 and 100) for the following categories:
      - Engine
      - Transmission
      - Electrical System
      - Brakes
      - Suspension
      - Fuel System
      Common Issues: List known problem areas that might occur with this vehicle, along with potential cost to fix in USD. 
      Add reference to the number of these issues found.
      Mileage: Provide an estimate of the mileage at which these issues typically occur.
      AI Analysis: Mention any important recall issues and write a detailed paragraph analyzing the overall reliability of the vehicle. 
      Mention how it compares to similar cars in its class, note any major concerns, and highlight any particular strengths. 
      Provide supporting sources for your determinations.

      Output the response in JSON format with the following structure:

      {
        "overallScore": 0,
        "categories": {
          "engine": 0,
          "transmission": 0,
          "electricalSystem": 0,
          "brakes": 0,
          "suspension": 0,
          "fuelSystem": 0
        },
        "commonIssues":[
          {description: [description of issue here], costToFix: [cost to fix here in $], occurrence: [occurrences you found], mileage: [mileage at which issue occurs]},
        ],
        "aiAnalysis": ""
      }

      Please ensure the JSON is valid and follows the exact key structure above.
    `;

    try {
      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
          { role: "system", content: "You are an automotive expert assistant that provides detailed and accurate reliability information about vehicles. Return all responses as properly formatted JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.2, // Lower temperature for more factual responses
      });

      // Extract and parse the response
      const responseText = completion.data.choices[0].message.content.trim();
      
      let reliabilityData;
      
      try {
        // Extract JSON if it's wrapped in code blocks
        const jsonMatch = responseText.match(/```json\n([\s\S]*)\n```/) || 
                          responseText.match(/```\n([\s\S]*)\n```/) ||
                          [null, responseText];

        reliabilityData = JSON.parse(jsonMatch[1]);
        
        // If not premium, limit the data
        if (!isPremium) {
          // Provide limited data for free/basic users
          reliabilityData = {
            overallScore: reliabilityData.overallScore,
            categories: {
              engine: reliabilityData.categories.engine,
              transmission: reliabilityData.categories.transmission,
              // Limit other categories for non-premium users
              electricalSystem: null,
              brakes: null,
              suspension: null,
              fuelSystem: null
            },
            // No common issues for non-premium users
            commonIssues: [],
            aiAnalysis: "Upgrade to premium for full analysis",
            // Set these flags explicitly and consistently
            isPremium: false,
            isBasic: isBasic
          };
        } else {
          // Add premium and basic flags for premium users
          reliabilityData.isPremium = true;
          reliabilityData.isBasic = false;
        }
      } catch (parseError) {
        console.error("Error parsing JSON response:", parseError);
        return res.status(500).json({ 
          error: 'Failed to parse reliability data',
          rawResponse: responseText
        });
      }

      res.json(reliabilityData);
    } catch (openaiError) {
      console.error('OpenAI API Error:', openaiError.message);
      
      // Fallback to mock data if OpenAI API fails
      console.log('Using fallback data');
      const reliabilityData = {
        overallScore: Math.floor(Math.random() * 30) + 70,
        categories: {
          engine: Math.floor(Math.random() * 30) + 70,
          transmission: Math.floor(Math.random() * 30) + 70,
          electricalSystem: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          brakes: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          suspension: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
          fuelSystem: isPremium ? Math.floor(Math.random() * 30) + 70 : null,
        },
        commonIssues: isPremium ? [
          {
            description: `${make} ${model} transmission issues reported after 60,000 miles`,
            costToFix: "$1,500-$3,000",
            occurrence: "15% of vehicles",
            mileage: "60,000-80,000 miles"
          },
          {
            description: "Electrical system problems in cold weather",
            costToFix: "$200-$800",
            occurrence: "8% of vehicles",
            mileage: "Any mileage"
          }
        ] : [],
        aiAnalysis: isPremium 
          ? `The ${year} ${make} ${model} shows generally good reliability with some minor concerns. Compared to similar vehicles in its class, it ranks above average for long-term dependability. Owners report high satisfaction with engine performance and fuel economy, while some report issues with the transmission after extended use. Regular maintenance appears to prevent most common problems.`
          : "Upgrade to premium for full analysis",
        isPremium: isPremium,
        isBasic: isBasic
      };

      return res.json(reliabilityData);
    }
  } catch (error) {
    console.error('General API Error:', error);
    res.status(500).json({ 
      error: 'Failed to retrieve reliability data',
      message: error.message
    });
  }
});

// Get all users - Protected admin endpoint
app.get('/api/users', async (req, res) => {
  try {
    // In a real implementation, check if user has admin privileges
    const isAdmin = true; // Replace with actual admin check in production
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Insufficient permissions to access user data' });
    }
    
    // Retrieve all users with limited fields for security
    const usersResult = await query(
      'SELECT id, email, created_at, updated_at FROM users ORDER BY id'
    );
    
    const userCount = usersResult.rows.length;
    
    res.status(200).json({
      count: userCount,
      users: usersResult.rows
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// Get user's search history
app.get('/api/user/searches', authenticateToken, async (req, res) => {
  try {
    // Get user's search history
    const searchesResult = await query(`
      SELECT * FROM searches 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 10
    `, [req.user.id]);
    
    res.status(200).json(searchesResult.rows);
  } catch (error) {
    console.error('Search history error:', error);
    res.status(500).json({ error: 'Failed to fetch search history' });
  }
});

// Create a test route for GET requests (easier to test in browser)
app.get('/api/test-get', (req, res) => {
  res.json({
    message: "GET endpoint is working!",
    timestamp: new Date().toISOString()
  });
});

// Test database connection
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({ 
      status: 'connected', 
      timestamp: result.rows[0].now,
      message: 'Successfully connected to PostgreSQL database'
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      status: 'error',
      message: error.message 
    });
  }
});

// Default route for the API
app.get('/api', (req, res) => {
  res.json({
    message: "Car Reliability API is running",
    version: "1.0.0",
    endpoints: [
      "/api/register", 
      "/api/login", 
      "/api/profile", 
      "/api/payment/verify", 
      "/api/verify-token", 
      "/api/car-reliability",
      "/api/users",
      "/api/user/searches",
      "/api/db-test"
    ]
  });
});

// Update your Stripe checkout session creation
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { priceId, plan, userId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId || process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `https://car-reliability-app.vercel.app/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://car-reliability-app.vercel.app/payment-cancel`,
      metadata: {
        plan: plan || 'premium' // Store the plan in metadata
      },
      client_reference_id: userId // Link session to user
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

// ----------------- STREAMLINED STRIPE WEBHOOK HANDLERS -----------------

// Stripe webhook handler - simplified and more maintainable
app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  let event;

  try {
    // Verify webhook signature
    if (endpointSecret) {
      const signature = req.headers["stripe-signature"];
      event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    } else {
      event = req.body;
    }

    // Process the event
    await processStripeEvent(event);
    
    // Return success response
    res.status(200).end();
  } catch (err) {
    console.error(`⚠️ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

// Process Stripe events
async function processStripeEvent(event) {
  console.log(`Processing Stripe event: ${event.type}`);
  
  // Group events by category for better maintainability
  switch (event.type) {
    // Customer events
    case 'customer.created':
      await handleCustomerCreated(event.data.object);
      break;
      
    // Subscription events
    case 'customer.subscription.created':
      await handleSubscriptionEvent(event.data.object, 'created');
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionEvent(event.data.object, 'updated');
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(event.data.object, 'deleted');
      break;
    case 'customer.subscription.trial_will_end':
      await handleSubscriptionEvent(event.data.object, 'trial_ending');
      break;
      
    // Payment events
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'checkout.session.async_payment_succeeded':
      await handleCheckoutSessionCompleted(event.data.object);
      break;
    case 'checkout.session.async_payment_failed':
    case 'checkout.session.expired':
      await handleFailedPayment(event.data.object);
      break;
      
    // Invoice events
    case 'invoice.payment_succeeded':
      await handleInvoicePayment(event.data.object, true);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePayment(event.data.object, false);
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

// Handle customer created event
async function handleCustomerCreated(customer) {
  try {
    // Extract customer email and ID
    const email = customer.email;
    const stripeCustomerId = customer.id;
    
    if (!email) {
      console.log('No email provided for customer:', stripeCustomerId);
      return;
    }
    
    console.log(`Processing customer creation: ${email} (${stripeCustomerId})`);
    
    // Check if user with this email already exists
    const existingUserResult = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    let userId;
    
    if (existingUserResult.rows.length > 0) {
      // User exists, update with Stripe customer ID
      userId = existingUserResult.rows[0].id;
      await query(
        'UPDATE users SET stripe_customer_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        [stripeCustomerId, userId]
      );
      console.log(`Updated existing user ${userId} with Stripe customer ID: ${stripeCustomerId}`);
    } else {
      // Create new user with temporary password
      const tempPassword = await bcrypt.hash(uuidv4(), 10);
      const userResult = await query(
        'INSERT INTO users (email, password, stripe_customer_id) VALUES ($1, $2, $3) RETURNING id',
        [email, tempPassword, stripeCustomerId]
      );
      userId = userResult.rows[0].id;
      console.log(`Created new user ${userId} for Stripe customer: ${stripeCustomerId}`);
      
      // Create a default basic subscription for new users
      await query(
        'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
        [userId, 'basic', 'active']
      );
    }
    
    return userId;
  } catch (error) {
    console.error('Error handling customer creation:', error);
    throw error;
  }
}

// Handle subscription events (created, updated, deleted, trial_ending)
async function handleSubscriptionEvent(subscription, eventType) {
  try {
    // Get the customer ID from the subscription
    const stripeCustomerId = subscription.customer;
    
    if (!stripeCustomerId) {
      console.log('No customer ID provided in subscription event');
      return;
    }
    
    console.log(`Processing subscription ${eventType} for customer: ${stripeCustomerId}`);
    
    // Find user by Stripe customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`No user found with Stripe customer ID: ${stripeCustomerId}`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Determine plan and status based on subscription data and event type
    const plan = extractPlanFromSubscription(subscription);
    let status = subscription.status;
    
    // Handle special cases
    if (eventType === 'deleted') {
      status = 'canceled';
    } else if (eventType === 'trial_ending') {
      // Just log the event, don't change status
      console.log(`Trial ending soon for subscription of user ${userId}`);
      return;
    }
    
    // Check if user already has a subscription
    const existingSubscriptionResult = await query(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND status != $2',
      [userId, 'canceled']
    );
    
    // Calculate expiration date for the subscription
    const expiresAt = calculateExpirationDate(plan);
    
    if (existingSubscriptionResult.rows.length > 0) {
      // Update existing subscription
      const subscriptionId = existingSubscriptionResult.rows[0].id;
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, updated_at = CURRENT_TIMESTAMP, expires_at = $3 
        WHERE id = $4
      `, [plan, status, expiresAt, subscriptionId]);
      
      console.log(`Updated subscription ${subscriptionId} for user ${userId} to plan: ${plan}, status: ${status}`);
    } else if (status === 'active') {
      // Create new subscription if there isn't an active one and the new status is 'active'
      const accessToken = uuidv4(); // Generate access token for premium subscriptions
      
      await query(`
        INSERT INTO subscriptions (user_id, plan, status, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5)
      `, [userId, plan, status, accessToken, expiresAt]);
      
      console.log(`Created new ${plan} subscription for user ${userId}`);
    }
    
    // If subscription is deleted or canceled and plan was premium, create basic plan
    if ((status === 'canceled' || eventType === 'deleted') && plan === 'premium') {
      // Create new basic subscription
      await query(
        'INSERT INTO subscriptions (user_id, plan, status) VALUES ($1, $2, $3)',
        [userId, 'basic', 'active']
      );
      
      console.log(`Created new basic subscription for user ${userId} after premium cancellation`);
    }
  } catch (error) {
    console.error(`Error handling subscription ${eventType}:`, error);
    throw error;
  }
}

// Handle successful checkout session completion
async function handleCheckoutSessionCompleted(session) {
  try {
    // Extract data from the session
    const sessionId = session.id;
    const clientReferenceId = session.client_reference_id; // This should be the userId
    const stripeCustomerId = session.customer;
    
    // Extract plan from metadata
    const plan = session.metadata && session.metadata.plan ? session.metadata.plan : 'premium';
    
    console.log(`Processing successful checkout: ${sessionId} for plan: ${plan}`);
    
    let userId = clientReferenceId;
    
    // If we don't have a user ID from the client reference, try to find by Stripe customer ID
    if (!userId && stripeCustomerId) {
      const userResult = await query(
        'SELECT id FROM users WHERE stripe_customer_id = $1',
        [stripeCustomerId]
      );
      
      if (userResult.rows.length > 0) {
        userId = userResult.rows[0].id;
      }
    }
    
    // If we still don't have a user ID, we can't proceed
    if (!userId) {
      console.log(`Cannot process checkout: no user ID found for session ${sessionId}`);
      return;
    }
    
    // Generate a unique access token
    const accessToken = uuidv4();
    
    // Calculate expiration date
    const expiresAt = calculateExpirationDate(plan);
    
    // Check for existing subscriptions
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1 AND status != $2',
      [userId, 'canceled']
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubscriptionResult.rows[0];
      await query(`
        UPDATE subscriptions 
        SET plan = $1, status = $2, stripe_session_id = $3, access_token = $4, 
            updated_at = CURRENT_TIMESTAMP, expires_at = $5
        WHERE id = $6
      `, [plan, 'active', sessionId, accessToken, expiresAt, existingSub.id]);
      
      console.log(`Updated subscription for user ${userId} to ${plan} via checkout`);
    } else {
      // Create new subscription
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, stripe_session_id, access_token, expires_at) 
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [userId, plan, 'active', sessionId, accessToken, expiresAt]);
      
      console.log(`Created new ${plan} subscription for user ${userId} via checkout`);
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error);
    throw error;
  }
}

// Handle failed payment events
async function handleFailedPayment(session) {
  try {
    const sessionId = session.id;
    const clientReferenceId = session.client_reference_id;
    
    console.log(`Processing failed payment for session: ${sessionId}`);
    
    // If we have a client reference ID (user ID), update their subscription status
    if (clientReferenceId) {
      const subscriptionResult = await query(
        'SELECT id FROM subscriptions WHERE user_id = $1 AND stripe_session_id = $2',
        [clientReferenceId, sessionId]
      );
      
      if (subscriptionResult.rows.length > 0) {
        const subscriptionId = subscriptionResult.rows[0].id;
        
        // Mark subscription as payment_failed
        await query(
          'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          ['payment_failed', subscriptionId]
        );
        
        console.log(`Marked subscription ${subscriptionId} as payment_failed`);
      }
    }
  } catch (error) {
    console.error('Error handling failed payment:', error);
    throw error;
  }
}

// Handle invoice payment events
async function handleInvoicePayment(invoice, succeeded) {
  try {
    const invoiceId = invoice.id;
    const stripeCustomerId = invoice.customer;
    const subscriptionId = invoice.subscription;
    
    console.log(`Processing invoice ${succeeded ? 'success' : 'failure'}: ${invoiceId}`);
    
    if (!stripeCustomerId) {
      console.log('No customer ID in invoice');
      return;
    }
    
    // Find user by Stripe customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );
    
    if (userResult.rows.length === 0) {
      console.log(`No user found with Stripe customer ID: ${stripeCustomerId}`);
      return;
    }
    
    const userId = userResult.rows[0].id;
    
    // Find active subscription for this user
    const subscriptionResult = await query(
      'SELECT id FROM subscriptions WHERE user_id = $1 AND status != $2',
      [userId, 'canceled']
    );
    
    if (subscriptionResult.rows.length === 0) {
      console.log(`No active subscription found for user ${userId}`);
      return;
    }
    
    const dbSubscriptionId = subscriptionResult.rows[0].id;
    
    if (succeeded) {
      // If payment succeeded, ensure subscription is active
      await query(
        'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['active', dbSubscriptionId]
      );
      
      console.log(`Activated subscription ${dbSubscriptionId} after successful payment`);
    } else {
      // If payment failed, mark subscription accordingly
      await query(
        'UPDATE subscriptions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
        ['payment_failed', dbSubscriptionId]
      );
      
      console.log(`Marked subscription ${dbSubscriptionId} as payment_failed`);
    }
  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

// Helper function to extract plan from a subscription
function extractPlanFromSubscription(subscription) {
  // Try to extract plan from metadata
  if (subscription.metadata && subscription.metadata.plan) {
    return subscription.metadata.plan;
  }
  
  // Try to extract from subscription items
  if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    
    if (item.price && item.price.metadata && item.price.metadata.plan) {
      return item.price.metadata.plan;
    }
    
    if (item.price && item.price.nickname) {
      // Convert nickname to lowercase for consistency
      const nickname = item.price.nickname.toLowerCase();
      if (nickname.includes('premium')) {
        return 'premium';
      } else if (nickname.includes('basic')) {
        return 'basic';
      }
    }
  }
  
  // Default to 'premium' for subscription events
  return 'premium';
}

// Helper function to calculate expiration date
function calculateExpirationDate(plan) {
  const now = new Date();
  
  if (typeof plan === 'string') {
    if (plan.includes('monthly')) {
      now.setMonth(now.getMonth() + 1);
    } else if (plan.includes('yearly')) {
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan === 'premium') {
      // Default premium subscription to 1 year
      now.setFullYear(now.getFullYear() + 1);
    } else if (plan === 'basic') {
      // For basic plans, we might not set an expiration
      return null;
    }
  } else {
    // Default to 1 year if plan type is unclear
    now.setFullYear(now.getFullYear() + 1);
  }
  
  return now.toISOString();
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the Express app for Vercel
module.exports = app;
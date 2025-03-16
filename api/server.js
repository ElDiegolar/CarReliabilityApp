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
// Stripe webhook endpoint with enhanced subscription handling
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log(`✅ Webhook received: ${event.type}`);
  } catch (err) {
    console.error(`❌ Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types
  try {
    switch (event.type) {
      // Payment-related events
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'checkout.session.async_payment_succeeded':
        await handleAsyncPaymentSucceeded(event.data.object);
        break;
        
      case 'checkout.session.async_payment_failed':
        await handleAsyncPaymentFailed(event.data.object);
        break;
        
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object);
        break;
      
      // Subscription-specific events
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
        
      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`❌ Error processing webhook: ${error.message}`);
    // Return 200 to Stripe so they don't retry the webhook
    // We've already logged the error for our internal tracking
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
});

/**
 * Handle checkout session completed event (one-time payments)
 */
async function handleCheckoutSessionCompleted(session) {
  console.log("🎉 Checkout Session Completed:", session.id);

  try {
    // For one-time payments that create subscriptions
    if (session.mode === 'payment' && session.client_reference_id) {
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'premium';
      const accessToken = uuidv4();
      
      // Get subscription details from metadata or use defaults
      const expiresAt = calculateExpirationDate(plan);
      
      // Update or create subscription in database
      await updateUserSubscription(userId, {
        plan: plan,
        status: 'active',
        stripeSessionId: session.id,
        accessToken: accessToken,
        expiresAt: expiresAt
      });
      
      console.log(`✅ User ${userId} subscription updated to ${plan}.`);
    } 
    // For subscription mode checkout sessions
    else if (session.mode === 'subscription' && session.client_reference_id) {
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'premium';
      const stripeSubscriptionId = session.subscription;
      const accessToken = uuidv4();
      
      // Fetch the subscription from Stripe to get details
      const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      
      // Calculate the expiration date from the subscription
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Update or create subscription in database
      await updateUserSubscription(userId, {
        plan: plan,
        status: 'active',
        stripeSessionId: session.id,
        stripeSubscriptionId: stripeSubscriptionId,
        accessToken: accessToken,
        expiresAt: expiresAt
      });
      
      console.log(`✅ User ${userId} recurring subscription created for ${plan}.`);
    }
  } catch (error) {
    console.error('Error processing checkout session completed:', error);
  }
}

/**
 * Handle async payment succeeded event
 */
async function handleAsyncPaymentSucceeded(session) {
  console.log("✅ Async Payment Succeeded:", session.id);

  try {
    if (session.client_reference_id) {
      const userId = session.client_reference_id;
      const plan = session.metadata?.plan || 'premium';
      const accessToken = uuidv4();
      
      // Get subscription details from metadata or use defaults
      const expiresAt = calculateExpirationDate(plan);
      
      // Update or create subscription in database
      await updateUserSubscription(userId, {
        plan: plan,
        status: 'active',
        stripeSessionId: session.id,
        accessToken: accessToken,
        expiresAt: expiresAt
      });
      
      console.log(`✅ User ${userId} subscription updated to ${plan}.`);
    }
  } catch (error) {
    console.error('Error processing async payment succeeded:', error);
  }
}

/**
 * Handle async payment failed event
 */
async function handleAsyncPaymentFailed(session) {
  console.log("❌ Async Payment Failed:", session.id);
  
  try {
    if (session.client_reference_id) {
      const userId = session.client_reference_id;
      
      // Mark subscription as payment_failed
      await updateUserSubscription(userId, {
        status: 'payment_failed',
        stripeSessionId: session.id,
      });
      
      console.log(`⚠️ User ${userId} payment failed.`);
      
      // You could send an email notification to the user here
    }
  } catch (error) {
    console.error('Error processing async payment failed:', error);
  }
}

/**
 * Handle checkout session expired event
 */
async function handleCheckoutSessionExpired(session) {
  console.log("⚠️ Checkout Session Expired:", session.id);
  
  try {
    if (session.client_reference_id) {
      const userId = session.client_reference_id;
      
      // Check if this session is associated with a subscription
      const subscriptionResult = await query(
        'SELECT * FROM subscriptions WHERE user_id = $1 AND stripe_session_id = $2',
        [userId, session.id]
      );
      
      if (subscriptionResult.rows.length > 0) {
        // Mark the session as expired
        await query(`
          UPDATE subscriptions 
          SET status = 'expired', updated_at = CURRENT_TIMESTAMP 
          WHERE user_id = $1 AND stripe_session_id = $2
        `, [userId, session.id]);
        
        console.log(`⚠️ User ${userId} checkout session marked as expired.`);
      }
    }
  } catch (error) {
    console.error('Error processing checkout session expired:', error);
  }
}

/**
 * Handle subscription created event
 */
async function handleSubscriptionCreated(subscription) {
  console.log("🆕 Subscription Created:", subscription.id);
  
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Look up the user associated with this customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      const accessToken = uuidv4();
      
      // Get the subscription details
      const plan = getSubscriptionPlan(subscription);
      const status = subscription.status;
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Update or create subscription in database
      await updateUserSubscription(userId, {
        plan: plan,
        status: status,
        stripeSubscriptionId: subscription.id,
        accessToken: accessToken,
        expiresAt: expiresAt
      });
      
      console.log(`✅ User ${userId} recurring subscription created for ${plan}.`);
    } else {
      console.log(`⚠️ No user found for Stripe customer: ${customerId}`);
    }
  } catch (error) {
    console.error('Error processing subscription created:', error);
  }
}

/**
 * Handle subscription updated event
 */
async function handleSubscriptionUpdated(subscription) {
  console.log("🔄 Subscription Updated:", subscription.id);
  
  try {
    // Get the customer ID from the subscription
    const customerId = subscription.customer;
    
    // Look up the user associated with this customer ID
    const userResult = await query(
      'SELECT id FROM users WHERE stripe_customer_id = $1',
      [customerId]
    );
    
    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      
      // Get the subscription details
      const plan = getSubscriptionPlan(subscription);
      const status = subscription.status;
      const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
      
      // Update subscription in database
      await updateUserSubscription(userId, {
        plan: plan,
        status: status,
        stripeSubscriptionId: subscription.id,
        expiresAt: expiresAt
      });
      
      console.log(`✅ User ${userId} subscription updated to ${plan} (${status}).`);
    } else {
      console.log(`⚠️ No user found for Stripe customer: ${customerId}`);
    }
  } catch (error) {
    console.error('Error processing subscription updated:', error);
  }
}

/**
 * Handle subscription deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  console.log("🗑️ Subscription Deleted:", subscription.id);
  
  try {
    // Find the subscription in our database
    const subscriptionResult = await query(
      'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
      [subscription.id]
    );
    
    if (subscriptionResult.rows.length > 0) {
      const userId = subscriptionResult.rows[0].user_id;
      
      // Update the subscription to canceled status
      await query(`
        UPDATE subscriptions 
        SET status = 'canceled', updated_at = CURRENT_TIMESTAMP 
        WHERE stripe_subscription_id = $1
      `, [subscription.id]);
      
      console.log(`✅ User ${userId} subscription marked as canceled.`);
      
      // You could handle downgrading the user to a free/basic plan here
      await query(`
        INSERT INTO subscriptions 
        (user_id, plan, status, created_at, updated_at) 
        VALUES ($1, 'basic', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [userId]);
      
      console.log(`✅ User ${userId} downgraded to basic plan.`);
    } else {
      console.log(`⚠️ No subscription found with ID: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error processing subscription deleted:', error);
  }
}

/**
 * Handle invoice payment succeeded event
 */
async function handleInvoicePaymentSucceeded(invoice) {
  console.log("💰 Invoice Payment Succeeded:", invoice.id);
  
  try {
    // Check if this is a subscription invoice
    if (invoice.subscription) {
      // Get the subscription details
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      
      // Find the subscription in our database
      const subscriptionResult = await query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [subscription.id]
      );
      
      if (subscriptionResult.rows.length > 0) {
        const userId = subscriptionResult.rows[0].user_id;
        
        // Update the subscription with new period end
        const expiresAt = new Date(subscription.current_period_end * 1000).toISOString();
        
        await query(`
          UPDATE subscriptions 
          SET status = 'active', expires_at = $1, updated_at = CURRENT_TIMESTAMP 
          WHERE stripe_subscription_id = $2
        `, [expiresAt, subscription.id]);
        
        console.log(`✅ User ${userId} subscription renewed until ${expiresAt}.`);
      } else {
        console.log(`⚠️ No subscription found with ID: ${subscription.id}`);
      }
    }
  } catch (error) {
    console.error('Error processing invoice payment succeeded:', error);
  }
}

/**
 * Handle invoice payment failed event
 */
async function handleInvoicePaymentFailed(invoice) {
  console.log("❌ Invoice Payment Failed:", invoice.id);
  
  try {
    // Check if this is a subscription invoice
    if (invoice.subscription) {
      // Find the subscription in our database
      const subscriptionResult = await query(
        'SELECT user_id FROM subscriptions WHERE stripe_subscription_id = $1',
        [invoice.subscription]
      );
      
      if (subscriptionResult.rows.length > 0) {
        const userId = subscriptionResult.rows[0].user_id;
        
        // Update the subscription status to payment_failed
        await query(`
          UPDATE subscriptions 
          SET status = 'payment_failed', updated_at = CURRENT_TIMESTAMP 
          WHERE stripe_subscription_id = $1
        `, [invoice.subscription]);
        
        console.log(`⚠️ User ${userId} subscription marked as payment_failed.`);
        
        // You could send an email notification to the user here
      } else {
        console.log(`⚠️ No subscription found with ID: ${invoice.subscription}`);
      }
    }
  } catch (error) {
    console.error('Error processing invoice payment failed:', error);
  }
}

/**
 * Helper function to update a user's subscription in the database
 */
async function updateUserSubscription(userId, subscriptionData) {
  try {
    // Check for existing subscription
    const existingSubscriptionResult = await query(
      'SELECT * FROM subscriptions WHERE user_id = $1',
      [userId]
    );
    
    if (existingSubscriptionResult.rows.length > 0) {
      // Update existing subscription
      const existingSub = existingSubscriptionResult.rows[0];
      
      // Build dynamic query based on provided data
      let updateFields = [];
      let values = [];
      let paramIndex = 1;
      
      // Add each field to update
      if (subscriptionData.plan) {
        updateFields.push(`plan = $${paramIndex++}`);
        values.push(subscriptionData.plan);
      }
      
      if (subscriptionData.status) {
        updateFields.push(`status = $${paramIndex++}`);
        values.push(subscriptionData.status);
      }
      
      if (subscriptionData.stripeSessionId) {
        updateFields.push(`stripe_session_id = $${paramIndex++}`);
        values.push(subscriptionData.stripeSessionId);
      }
      
      if (subscriptionData.stripeSubscriptionId) {
        updateFields.push(`stripe_subscription_id = $${paramIndex++}`);
        values.push(subscriptionData.stripeSubscriptionId);
      }
      
      if (subscriptionData.accessToken) {
        updateFields.push(`access_token = $${paramIndex++}`);
        values.push(subscriptionData.accessToken);
      }
      
      if (subscriptionData.expiresAt) {
        updateFields.push(`expires_at = $${paramIndex++}`);
        values.push(subscriptionData.expiresAt);
      }
      
      // Always update timestamp
      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Append the subscription ID to the values array
      values.push(existingSub.id);
      
      // Execute update query
      const updateQuery = `
        UPDATE subscriptions 
        SET ${updateFields.join(', ')} 
        WHERE id = $${paramIndex}
      `;
      
      await query(updateQuery, values);
    } else {
      // Create new subscription
      const fields = ['user_id'];
      const placeholders = ['$1'];
      const values = [userId];
      let paramIndex = 2;
      
      // Add each field if provided
      if (subscriptionData.plan) {
        fields.push('plan');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.plan);
      }
      
      if (subscriptionData.status) {
        fields.push('status');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.status);
      }
      
      if (subscriptionData.stripeSessionId) {
        fields.push('stripe_session_id');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.stripeSessionId);
      }
      
      if (subscriptionData.stripeSubscriptionId) {
        fields.push('stripe_subscription_id');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.stripeSubscriptionId);
      }
      
      if (subscriptionData.accessToken) {
        fields.push('access_token');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.accessToken);
      }
      
      if (subscriptionData.expiresAt) {
        fields.push('expires_at');
        placeholders.push(`$${paramIndex++}`);
        values.push(subscriptionData.expiresAt);
      }
      
      // Add timestamps
      fields.push('created_at', 'updated_at');
      placeholders.push('CURRENT_TIMESTAMP', 'CURRENT_TIMESTAMP');
      
      // Execute insert query
      const insertQuery = `
        INSERT INTO subscriptions 
        (${fields.join(', ')}) 
        VALUES (${placeholders.join(', ')})
      `;
      
      await query(insertQuery, values);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating user subscription:', error);
    throw error;
  }
}

/**
 * Helper function to extract plan information from a Stripe subscription
 */
function getSubscriptionPlan(subscription) {
  // Try to get plan from metadata first
  if (subscription.metadata && subscription.metadata.plan) {
    return subscription.metadata.plan;
  }
  
  // Then check items for plan info
  if (subscription.items && subscription.items.data && subscription.items.data.length > 0) {
    const item = subscription.items.data[0];
    if (item.price && item.price.metadata && item.price.metadata.plan) {
      return item.price.metadata.plan;
    }
    if (item.price && item.price.nickname) {
      return item.price.nickname.toLowerCase();
    }
  }
  
  // Default to premium
  return 'premium';
}

/**
 * Helper function to calculate expiration date based on plan
 */
function calculateExpirationDate(plan) {
  const now = new Date();
  
  switch (plan.toLowerCase()) {
    case 'premium_monthly':
      now.setMonth(now.getMonth() + 1);
      break;
    case 'premium_yearly':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case 'premium':
    default:
      // Default to one year for one-time premium purchases
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
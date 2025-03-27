const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { v4: uuidv4 } = require('uuid');
const { initializeDatabase, query } = require('./database');

dotenv.config();

const app = express();

// CORS middleware
app.use(cors({
  origin: '*',
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: 'Content-Type, Authorization'
}));

// JSON body parsing for all routes
app.use(express.json());

// CRUD for Users
app.post('/api/users', async (req, res) => {
  const { email, password, stripe_customer_id } = req.body;

  try {
    const result = await query(`
      INSERT INTO users (email, password, stripe_customer_id) 
      VALUES ($1, $2, $3) RETURNING *
    `, [email, password, stripe_customer_id]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'User creation failed' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await query(`SELECT * FROM users`);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
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
    console.error('Error fetching subscriptions:', error);
    res.status(500).json({ error: 'Failed to fetch subscriptions' });
  }
});

app.post('/api/subscriptions', async (req, res) => {
  const { user_id, plan, status, stripe_customer_id } = req.body;

  try {
    const result = await query(`
      INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id) 
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [user_id, plan, status, stripe_customer_id]);

    res.status(201).json(result.rows[0]);
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
      '/api/users',
      '/api/subscriptions',
      '/api/payments',
      '/api/searches',
      '/api/webhook-logs'
    ]
  });
});

// Server setup
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

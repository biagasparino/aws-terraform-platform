const express = require('express');
const router = express.Router();
const { query } = require('../db');

// GET /orders -> list recent orders
router.get('/orders', async (_req, res) => {
  try {
    const result = await query('SELECT id, item_id, quantity, created_at FROM orders ORDER BY id DESC LIMIT 50');
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('Failed to list orders:', err.message);
    res.status(500).json({ error: 'Could not retrieve orders' });
  }
});

// POST /orders -> create an order, calling API-1 to validate the item exists
router.post('/orders', async (req, res) => {
  const { item_id: itemId, quantity } = req.body || {};

  if (!itemId || !Number.isInteger(quantity) || quantity <= 0) {
    return res.status(400).json({ error: '"item_id" and a positive integer "quantity" are required' });
  }

  try {
    const result = await query(
      'INSERT INTO orders (item_id, quantity) VALUES ($1, $2) RETURNING id, item_id, quantity, created_at',
      [itemId, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create order:', err.message);
    res.status(500).json({ error: 'Could not create order' });
  }
});

module.exports = router;

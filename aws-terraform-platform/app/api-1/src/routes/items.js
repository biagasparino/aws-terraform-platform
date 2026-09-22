const express = require('express');
const router = express.Router();
const { query } = require('../db');
const { getClient } = require('../cache');

// GET /items -> list items, cached in Redis for 30s to reduce load on PostgreSQL
router.get('/items', async (_req, res) => {
  try {
    const redis = await getClient();
    const cached = await redis.get('items:all');
    if (cached) {
      return res.json({ source: 'cache', items: JSON.parse(cached) });
    }

    const result = await query('SELECT id, name, created_at FROM items ORDER BY id DESC LIMIT 50');
    await redis.set('items:all', JSON.stringify(result.rows), { EX: 30 });

    res.json({ source: 'database', items: result.rows });
  } catch (err) {
    console.error('Failed to list items:', err.message);
    res.status(500).json({ error: 'Could not retrieve items' });
  }
});

// POST /items -> create an item
router.post('/items', async (req, res) => {
  const { name } = req.body || {};
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Field "name" is required and must be a string' });
  }

  try {
    const result = await query(
      'INSERT INTO items (name) VALUES ($1) RETURNING id, name, created_at',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Failed to create item:', err.message);
    res.status(500).json({ error: 'Could not create item' });
  }
});

module.exports = router;

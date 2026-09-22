const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  // Prevents an unhandled error from crashing the whole process
  console.error('Unexpected PostgreSQL pool error:', err.message);
});

async function query(text, params) {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.error('Database query failed:', err.message);
    throw new Error('DATABASE_ERROR');
  }
}

module.exports = { query, pool };

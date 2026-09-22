require('dotenv').config();
const express = require('express');
const healthRouter = require('./routes/health');
const ordersRouter = require('./routes/orders');

const app = express();
app.use(express.json());
app.use(healthRouter);
app.use(ordersRouter);

const SERVICE_NAME = process.env.SERVICE_NAME || 'api-2';

app.get('/', (_req, res) => {
  res.json({ service: SERVICE_NAME, message: 'API-2 is running' });
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`${SERVICE_NAME} listening on port ${PORT}`));
}

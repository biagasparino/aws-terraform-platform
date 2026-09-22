const { createClient } = require('redis');

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT || 6379),
  },
});

client.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

let connected = false;
async function getClient() {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client;
}

module.exports = { getClient };

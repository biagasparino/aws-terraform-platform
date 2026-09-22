const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/index');

test('GET /health returns 200 and status ok', async () => {
  const server = app.listen(0);
  const { port } = server.address();

  await new Promise((resolve, reject) => {
    http.get(`http://localhost:${port}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        assert.strictEqual(res.statusCode, 200);
        const body = JSON.parse(data);
        assert.strictEqual(body.status, 'ok');
        resolve();
      });
    }).on('error', reject);
  });

  server.close();
});

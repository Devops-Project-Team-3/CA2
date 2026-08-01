import assert from 'node:assert/strict';
import test from 'node:test';

import app from '../app.js';
import { hasDatabaseConfig } from '../config/database.js';

function listenForTest() {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const address = server.address();
      resolve({ server, url: `http://127.0.0.1:${address.port}` });
    });
  });
}

async function request(path, options) {
  const { server, url } = await listenForTest();

  try {
    return await fetch(`${url}${path}`, options);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

test('backend health endpoint returns JSON', async () => {
  const response = await request('/');
  const payload = await response.json();

  assert.equal(response.status, 200);
  assert.equal(payload.message, 'StudySpark backend base server is running.');
});

test('database configuration helper returns a boolean', () => {
  assert.equal(typeof hasDatabaseConfig(), 'boolean');
});

test('protected planner endpoint rejects logged-out requests', async () => {
  const response = await request('/api/planner');
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.message, /login is required/i);
});

test('protected dashboard endpoint rejects logged-out requests', async () => {
  const response = await request('/api/dashboard');
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.message, /login is required/i);
});

test('protected notifications endpoint rejects logged-out requests', async () => {
  const response = await request('/api/notifications');
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.message, /login is required/i);
});

test('protected quiz result saving rejects logged-out requests', async () => {
  const response = await request('/api/quiz/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topicTitle: 'Container Test',
      score: 1,
      totalQuestions: 1
    })
  });
  const payload = await response.json();

  assert.equal(response.status, 401);
  assert.match(payload.error, /login is required/i);
});

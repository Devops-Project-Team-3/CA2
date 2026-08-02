import request from 'supertest';
import app from '../main.js'; // Import your Express app

describe('Express Route Integration Tests', () => {

  test('GET /health - should return 200 OK and status message', async () => {
    const response = await request(app).get('/health');

    // Verifies status code and response payload
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
  });

  test('GET /non-existent-route - should return 404 Not Found', async () => {
    const response = await request(app).get('/api/invalid-endpoint');
    expect(response.statusCode).toBe(404);
  });

});
import request from 'supertest';
import app from '../main.js'; 

describe('StudySpark API Integration Tests', () => {
  test('POST /api/login - should authenticate user and return JWT token', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'student@studyspark.com',
        password: 'testpassword123'
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body.user).toHaveProperty('email', 'student@studyspark.com');
  });
});
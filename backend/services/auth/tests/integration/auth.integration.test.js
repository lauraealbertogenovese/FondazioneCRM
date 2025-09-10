const request = require('supertest');
const app = require('../../src/app'); // We'll need to refactor to export app

describe('Auth API Integration Tests', () => {
  describe('POST /auth/login', () => {
    test('should login with valid credentials', async () => {
      const loginData = {
        username: 'admin2',
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username', loginData.username);
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    test('should reject invalid credentials', async () => {
      const loginData = {
        username: 'admin2',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid credentials');
    });

    test('should reject missing username', async () => {
      const loginData = {
        password: 'password123'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Username and password are required');
    });

    test('should reject missing password', async () => {
      const loginData = {
        username: 'admin2'
      };

      const response = await request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Username and password are required');
    });
  });

  describe('POST /auth/refresh', () => {
    let refreshToken;

    beforeEach(async () => {
      // Get a valid refresh token first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin2',
          password: 'password123'
        });

      refreshToken = loginResponse.body.refreshToken;
    });

    test('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body.accessToken).toBeDefined();
    });

    test('should reject invalid refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid.refresh.token' })
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid refresh token');
    });

    test('should reject missing refresh token', async () => {
      const response = await request(app)
        .post('/auth/refresh')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body.error).toContain('Refresh token is required');
    });
  });

  describe('GET /auth/profile', () => {
    let accessToken;

    beforeEach(async () => {
      // Get a valid access token first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin2',
          password: 'password123'
        });

      accessToken = loginResponse.body.accessToken;
    });

    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('username');
      expect(response.body.user).toHaveProperty('email');
      expect(response.body.user).not.toHaveProperty('password_hash');
    });

    test('should reject request without token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error', 'Invalid token');
    });
  });

  describe('POST /auth/logout', () => {
    let accessToken;

    beforeEach(async () => {
      // Get a valid access token first
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin2',
          password: 'password123'
        });

      accessToken = loginResponse.body.accessToken;
    });

    test('should logout successfully with valid token', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    test('should handle logout without token gracefully', async () => {
      const response = await request(app)
        .post('/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('success', false);
    });
  });
});

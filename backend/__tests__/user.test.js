import request from 'supertest';
import { app, server } from '../index.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

let token, testUser;

beforeAll(async () => {
  // Create a test user with hashed password
  const password_hash = await bcrypt.hash('password123', 10);
  testUser = await User.create({
    name: 'Test User',
    email: 'testuser@example.com',
    password_hash,
    role: 'customer',
  });

  // Generate a token
  const payload = { user_id: testUser.user_id, role: testUser.role };
  token = jwt.sign(payload, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
});

describe('User Profile Endpoints', () => {
  it('should fetch the user profile', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      name: 'Test User',
      email: 'testuser@example.com',
      role: 'customer',
    });
  });

  it('should update the user profile', async () => {
    const res = await request(app)
      .put('/api/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Name',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Name');
    expect(res.body).toMatchObject({
      email: 'testuser@example.com',
      role: 'customer',
    });
  });

  it('should delete the user profile', async () => {
    const res = await request(app)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User profile deleted successfully');
  });

  it('should return 401 for unauthorized access', async () => {
    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', 'Bearer invalid_token');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should return 404 for non-existent user', async () => {
    // Delete the test user first
    await User.destroy({ where: { user_id: testUser.user_id } });

    const res = await request(app)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

afterEach(async () => {
  // Cleanup the test user after each test
  await User.destroy({ where: {} });
});

afterAll(async () => {
  try {
    if (server) server.close(); // Stop the server after tests
  } catch (error) {
    console.error('Error during server shutdown:', error);
  }
});
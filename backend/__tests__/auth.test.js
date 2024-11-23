import request from 'supertest';
import { app, server } from '../index.js';
import { User } from '../models/index.js';

beforeAll(async () => {
  // Ensure test database is clean before starting
  await User.destroy({ where: {} });
});

describe('Authentication Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/registerUser')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'customer',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      name: 'John Doe',
      email: 'john@example.com',
      role: 'customer',
    });
  });

  it('should not register a user with an existing email', async () => {
    const res = await request(app)
      .post('/api/auth/registerUser')
      .send({
        name: 'Jane Doe',
        email: 'john@example.com', // Already registered
        password: 'password123',
        role: 'customer',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should login a user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/loginUser')
      .send({
        email: 'john@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
    expect(res.body.user).toMatchObject({
      email: 'john@example.com',
      role: 'customer',
    });
  });

  it('should not login a user with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/loginUser')
      .send({
        email: 'john@example.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('should not register a user with invalid input', async () => {
    const res = await request(app)
      .post('/api/auth/registerUser')
      .send({
        name: '', // Invalid name
        email: 'not-an-email', // Invalid email format
        password: 'short', // Password too short
        role: 'unknown', // Invalid role
      });

    expect(res.statusCode).toEqual(422);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'email' }));
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'password' }));
    expect(res.body.errors).toContainEqual(expect.objectContaining({ field: 'name' }));
  });
});

afterEach(async () => {
  // Cleanup database after each test
  await User.destroy({ where: {} });
});

afterAll(async () => {
  try {
    if (server) server.close(); // Stop the server after all tests
  } catch (error) {
    console.error('Error during server cleanup:', error);
  }
});
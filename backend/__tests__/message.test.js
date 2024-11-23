import request from 'supertest';
import { app, server } from '../index.js';
import { User, Message } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let senderToken, receiverToken, receiverUser, message;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a sender user
  const sender = await User.create({
    name: 'Sender Example',
    email: 'sender@example.com',
    password_hash: hashedPassword,
    role: 'customer',
  });

  // Create a receiver user
  receiverUser = await User.create({
    name: 'Receiver Example',
    email: 'receiver@example.com',
    password_hash: hashedPassword,
    role: 'doctor',
  });

  // Generate JWT tokens
  senderToken = jwt.sign(
    { user_id: sender.user_id, role: sender.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );

  receiverToken = jwt.sign(
    { user_id: receiverUser.user_id, role: receiverUser.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
});

describe('Message Endpoints', () => {
  it('should send a message', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${senderToken}`)
      .send({
        receiver_id: receiverUser.user_id,
        content: 'Hello, how are you?',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('message_id');
    expect(res.body).toMatchObject({
      sender_id: expect.any(Number),
      receiver_id: receiverUser.user_id,
      content: 'Hello, how are you?',
    });

    message = res.body; // Store message for subsequent tests
  });

  it('should get all messages for the user', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sender_id: expect.any(Number),
          receiver_id: receiverUser.user_id,
          content: 'Hello, how are you?',
        }),
      ])
    );
  });

  it('should mark a message as read', async () => {
    const res = await request(app)
      .put(`/api/messages/${message.message_id}/read`)
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('is_read', true);
  });

  it('should delete a message', async () => {
    const res = await request(app)
      .delete(`/api/messages/${message.message_id}`)
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Message deleted successfully');
  });

  it('should return 404 for a non-existent message', async () => {
    const res = await request(app)
      .get('/api/messages/9999') // Non-existent message ID
      .set('Authorization', `Bearer ${receiverToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Message not found');
  });
});

afterEach(async () => {
  // Cleanup created messages after each test
  await Message.destroy({ where: {} });
});

afterAll(async () => {
  try {
    // Cleanup created users
    await User.destroy({ where: {} });

    if (server) server.close(); // Stop the server after tests
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
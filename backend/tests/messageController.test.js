import request from 'supertest';
import { app, server } from '../index.js';
import { User, Message } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { mockSender, mockReceiver } from './mockData.js'; // Import mock users from mockData.js

// Mock the User and Message models
jest.mock('../models/index.js');

let senderToken, receiverToken;

beforeAll(() => {
  // Ensure JWT_SECRET is set for tests
  process.env.JWT_SECRET = 'ORIONHEALTH11';

  // Generate JWT tokens
  senderToken = jwt.sign(
    { user_id: mockSender.user_id, role: mockSender.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  receiverToken = jwt.sign(
    { user_id: mockReceiver.user_id, role: mockReceiver.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Mock User model behavior
  User.findByPk.mockImplementation((id) =>
    id === mockSender.user_id
      ? Promise.resolve(mockSender)
      : id === mockReceiver.user_id
      ? Promise.resolve(mockReceiver)
      : Promise.resolve(null)
  );

  // Mock Message model behavior
  Message.create.mockImplementation((data) => Promise.resolve({ message_id: 1, ...data }));
  Message.findAll.mockImplementation((query) =>
    query.where.receiver_id === mockReceiver.user_id
      ? Promise.resolve([
          {
            message_id: 1,
            sender_id: mockSender.user_id,
            receiver_id: mockReceiver.user_id,
            content: 'Hello!',
            is_read: false,
          },
        ])
      : []
  );
  Message.findByPk.mockImplementation((id) =>
    id === 1
      ? Promise.resolve({
          message_id: 1,
          sender_id: mockSender.user_id,
          receiver_id: mockReceiver.user_id,
          content: 'Hello!',
          is_read: false,
          update: jest.fn().mockResolvedValue(true),
          destroy: jest.fn().mockResolvedValue(true),
        })
      : null
  );
});

afterEach(() => {
  // Reset mocks after each test
  jest.clearAllMocks();
});

afterAll(() => {
  if (server) server.close(); // Stop the server after tests
});

describe('Message Controller Endpoints', () => {
  describe('POST /api/messages', () => {
    it('should send a message from sender to receiver', async () => {
      const messageData = { receiver_id: mockReceiver.user_id, content: 'Hello, Doctor!' };

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(messageData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toMatchObject({ message_id: 1, ...messageData });
      expect(Message.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sender_id: mockSender.user_id,
          ...messageData,
          is_read: false,
        })
      );
    });

    it('should not send a message to a non-existent receiver', async () => {
      const messageData = { receiver_id: 999, content: 'Hello, Unknown!' };

      Message.create.mockRejectedValue({ status: 404, message: 'Receiver not found' });

      const res = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${senderToken}`)
        .send(messageData);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Receiver not found');
      expect(Message.create).toHaveBeenCalled();
    });
  });

  describe('GET /api/messages', () => {
    it('should fetch all messages for the receiver', async () => {
      const res = await request(app)
        .get('/api/messages')
        .set('Authorization', `Bearer ${receiverToken}`);

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toEqual([
        {
          message_id: 1,
          sender_id: mockSender.user_id,
          receiver_id: mockReceiver.user_id,
          content: 'Hello!',
          is_read: false,
        },
      ]);
    });
  });

  describe('PUT /api/messages/:id/read', () => {
    it('should mark a message as read', async () => {
      const res = await request(app)
        .put('/api/messages/1/read')
        .set('Authorization', `Bearer ${receiverToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Message marked as read');
      const mockMessage = await Message.findByPk(1);
      expect(mockMessage.update).toHaveBeenCalledWith({ is_read: true });
    });

    it('should return 404 if message not found', async () => {
      Message.findByPk.mockResolvedValueOnce(null);

     
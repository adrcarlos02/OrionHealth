// tests/authService.test.js

import * as authService from '../services/authService.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mock the User model and external dependencies
jest.mock('../models/index.js', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('registerUser', () => {
    it('should register a new user and return the token', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'customer',
      };
      const mockUser = { user_id: 1, ...userData, password_hash: 'hashed_password' };

      User.findOne.mockResolvedValue(null); // No existing user
      bcrypt.genSalt.mockResolvedValue('salt');
      bcrypt.hash.mockResolvedValue('hashed_password');
      User.create.mockResolvedValue(mockUser);
      jwt.sign.mockReturnValue('mocked_token');

      const result = await authService.registerUser(userData);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(User.create).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed_password',
        role: 'customer',
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toEqual({ user: mockUser, token: 'mocked_token' });
    });

    it('should throw 400 if the user already exists', async () => {
      const userData = { email: 'test@example.com' };

      User.findOne.mockResolvedValue({ user_id: 1 }); // Existing user

      await expect(authService.registerUser(userData)).rejects.toEqual({
        status: 400,
        message: 'User already exists',
      });
    });
  });

  describe('loginUser', () => {
    it('should log in an existing user and return the token', async () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockUser = { user_id: 1, email: 'test@example.com', password_hash: 'hashed_password' };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(true); // Password matches
      jwt.sign.mockReturnValue('mocked_token');

      const result = await authService.loginUser(credentials);

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
      expect(jwt.sign).toHaveBeenCalledWith(
        { user_id: 1, role: undefined },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );
      expect(result).toEqual({ user: mockUser, token: 'mocked_token' });
    });

    it('should throw 400 for invalid credentials', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };

      User.findOne.mockResolvedValue(null); // User not found

      await expect(authService.loginUser(credentials)).rejects.toEqual({
        status: 400,
        message: 'Invalid credentials',
      });
    });

    it('should throw 400 if the password does not match', async () => {
      const credentials = { email: 'test@example.com', password: 'wrongpassword' };
      const mockUser = { user_id: 1, email: 'test@example.com', password_hash: 'hashed_password' };

      User.findOne.mockResolvedValue(mockUser);
      bcrypt.compare.mockResolvedValue(false); // Password mismatch

      await expect(authService.loginUser(credentials)).rejects.toEqual({
        status: 400,
        message: 'Invalid credentials',
      });
    });
  });
});
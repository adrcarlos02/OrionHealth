// tests/userService.test.js

import * as userService from '../services/userService.js';
import { User } from '../models/index.js';
import bcrypt from 'bcryptjs';
import { mockCustomer } from './mockData.js'; // Import mock customer data

// Mock the User model and bcrypt library
jest.mock('../models/index.js', () => ({
  User: {
    findByPk: jest.fn(),
    destroy: jest.fn(),
    save: jest.fn(),
  },
}));
jest.mock('bcryptjs', () => ({
  genSalt: jest.fn(),
  hash: jest.fn(),
}));

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe('getUserProfile', () => {
    it('should return the user profile when the user exists', async () => {
      User.findByPk.mockResolvedValue(mockCustomer);

      const result = await userService.getUserProfile(mockCustomer.user_id);

      expect(User.findByPk).toHaveBeenCalledWith(mockCustomer.user_id, {
        attributes: { exclude: ['password_hash'] },
      });
      expect(result).toEqual(mockCustomer);
    });

    it('should throw 404 if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.getUserProfile(mockCustomer.user_id)).rejects.toEqual({
        status: 404,
        message: 'User not found',
      });
    });
  });

  describe('updateUserProfile', () => {
    it('should update the user profile with valid data', async () => {
      const updatedData = { name: 'Updated Name', email: 'updated@example.com' };
      const mockUser = { ...mockCustomer, save: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.updateUserProfile(mockCustomer.user_id, updatedData);

      expect(User.findByPk).toHaveBeenCalledWith(mockCustomer.user_id);
      expect(mockUser.name).toBe('Updated Name');
      expect(mockUser.email).toBe('updated@example.com');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining(updatedData));
    });

    it('should hash the password if it is provided', async () => {
      const updatedData = { password: 'newPassword123' };
      const mockUser = { ...mockCustomer, save: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);
      bcrypt.genSalt.mockResolvedValue('mockSalt');
      bcrypt.hash.mockResolvedValue('hashedPassword');

      const result = await userService.updateUserProfile(mockCustomer.user_id, updatedData);

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'mockSalt');
      expect(mockUser.password_hash).toBe('hashedPassword');
      expect(mockUser.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('should throw 404 if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.updateUserProfile(mockCustomer.user_id, {})).rejects.toEqual({
        status: 404,
        message: 'User not found',
      });
    });
  });

  describe('deleteUserProfile', () => {
    it('should delete the user profile if the user exists', async () => {
      const mockUser = { ...mockCustomer, destroy: jest.fn() };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.deleteUserProfile(mockCustomer.user_id);

      expect(User.findByPk).toHaveBeenCalledWith(mockCustomer.user_id);
      expect(mockUser.destroy).toHaveBeenCalled();
      expect(result).toEqual({ message: 'User profile deleted successfully' });
    });

    it('should throw 404 if the user is not found', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.deleteUserProfile(mockCustomer.user_id)).rejects.toEqual({
        status: 404,
        message: 'User not found',
      });
    });
  });
});
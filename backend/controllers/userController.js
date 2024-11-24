// services/userService.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * @desc    Create a new user (Admin Only)
 * @route   POST /api/users
 * @access  Admin
 */
export const createUser = async (req, res) => {
  try {
    // Handle validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Delegate user creation to the service layer
    const { user, token } = await userService.createUser({ name, email, password, role });

    res.status(201).json({ token, user });
  } catch (error) {
    console.error(`Create User Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while creating user' });
    }
  }
};

/**
 * @desc    Get all users (Admin Only)
 * @route   GET /api/users
 * @access  Admin
 */
export const getAllUsers = async (req, res) => {
  try {
    // Delegate fetching all users to the service layer
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(`Get All Users Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching users' });
    }
  }
};

/**
 * @desc    Get a user by ID (Admin or the user themselves)
 * @route   GET /api/users/:id
 * @access  Admin or the user themselves
 */
export const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Check if the requester is admin or the user themselves
    if (req.user.role !== 'admin' && req.user.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Delegate fetching user by ID to the service layer
    const user = await userService.getUserById(userId);
    res.json(user);
  } catch (error) {
    console.error(`Get User By ID Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching user' });
    }
  }
};

/**
 * @desc    Update a user (Admin or the user themselves)
 * @route   PUT /api/users/:id
 * @access  Admin or the user themselves
 */
export const updateUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Check if the requester is admin or the user themselves
    if (req.user.role !== 'admin' && req.user.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Delegate user update to the service layer
    const updatedUser = await userService.updateUser(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error(`Update User Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while updating user' });
    }
  }
};

/**
 * @desc    Delete a user (Admin Only)
 * @route   DELETE /api/users/:id
 * @access  Admin
 */
export const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    // Delegate user deletion to the service layer
    const result = await userService.deleteUser(userId);
    res.json(result);
  } catch (error) {
    console.error(`Delete User Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while deleting user' });
    }
  }
};
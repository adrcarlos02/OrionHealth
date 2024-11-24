// controllers/authController.js

import { validationResult } from 'express-validator';
import * as authService from '../services/authService.js';

/**
 * Registers a new user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const register = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Delegate to service
    const { user, token } = await authService.registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    console.error(`Registration Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error during registration' });
    }
  }
};

/**
 * Logs in an existing user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const login = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Delegate to service
    const { user, token } = await authService.loginUser(req.body);
    res.json({ user, token });
  } catch (error) {
    console.error(`Login Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error during login' });
    }
  }
};
// services/authService.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Registers a new user.
 * @param {Object} userData - The data for the new user (name, email, password, role).
 * @returns {Object} - The created user and token.
 */
export const registerUser = async (userData) => {
  const { name, email, password, role } = userData;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create new user
  const user = await User.create({ name, email, password_hash, role });

  // Generate token
  const payload = { user_id: user.user_id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { user, token };
};

/**
 * Logs in an existing user.
 * @param {Object} credentials - The user's login credentials (email, password).
 * @returns {Object} - The logged-in user and token.
 */
export const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw { status: 400, message: 'Invalid credentials' };
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw { status: 400, message: 'Invalid credentials' };
  }

  // Generate token
  const payload = { user_id: user.user_id, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  return { user, token };
};
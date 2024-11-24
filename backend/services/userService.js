// services/userService.js

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Registers a new user. (Admin Only)
 * @param {Object} userData - Contains name, email, password, and role.
 * @returns {Object} - The created user and JWT token.
 * @throws {Object} - Error with status and message.
 */
export const createUser = async ({ name, email, password, role }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw { status: 400, message: 'User already exists' };
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create the user
  const user = await User.create({
    name,
    email,
    password_hash,
    role,
  });

  // Generate JWT token
  const payload = {
    user_id: user.user_id,
    role: user.role,
  };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Return user data excluding password_hash
  const userResponse = {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile_image_url: user.profile_image_url,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: userResponse, token };
};

/**
 * Retrieves all users. (Admin Only)
 * @returns {Array} - List of all users.
 * @throws {Object} - Error with status and message.
 */
export const getAllUsers = async () => {
  const users = await User.findAll({
    attributes: { exclude: ['password_hash'] },
  });
  return users;
};

/**
 * Retrieves a user by ID. (Admin or the user themselves)
 * @param {number} userId - The ID of the user.
 * @returns {Object} - The user profile.
 * @throws {Object} - Error with status and message.
 */
export const getUserById = async (userId) => {
  const user = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
  });

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  return user;
};

/**
 * Updates a user. (Admin or the user themselves)
 * @param {number} userId - The ID of the user.
 * @param {Object} updateData - The data to update.
 * @returns {Object} - The updated user profile.
 * @throws {Object} - Error with status and message.
 */
export const updateUser = async (userId, updateData) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  // Update fields if they are provided
  if (updateData.name !== undefined) {
    user.name = updateData.name;
  }

  if (updateData.email !== undefined) {
    // Check if the new email is already taken by another user
    const existingUser = await User.findOne({ where: { email: updateData.email } });
    if (existingUser && existingUser.user_id !== userId) {
      throw { status: 400, message: 'Email is already in use by another user' };
    }
    user.email = updateData.email;
  }

  if (updateData.password !== undefined) {
    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(updateData.password, salt);
  }

  if (updateData.role !== undefined) {
    user.role = updateData.role;
  }

  if (updateData.profile_image_url !== undefined) {
    user.profile_image_url = updateData.profile_image_url;
  }

  await user.save();

  // Return updated user data excluding password_hash
  const updatedUser = await User.findByPk(userId, {
    attributes: { exclude: ['password_hash'] },
  });

  return updatedUser;
};

/**
 * Deletes a user. (Admin Only)
 * @param {number} userId - The ID of the user.
 * @returns {Object} - Success message.
 * @throws {Object} - Error with status and message.
 */
export const deleteUser = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  await user.destroy();

  return { message: 'User deleted successfully' };
};
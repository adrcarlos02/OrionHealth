// controllers/userController.js

import { User } from '../models/index.js'; // Adjust the path as needed
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

/**
 * Retrieves the authenticated user's profile.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id; // Assuming authenticateToken attaches user info to req.user

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }, // Exclude sensitive information
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(`Get User Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching user profile' });
  }
};

/**
 * Updates the authenticated user's profile.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Extract fields to update
    const { name, email, password } = req.body;

    // Find the user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (password !== undefined) {
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Return the updated user profile without the password_hash
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] },
    });

    res.json(updatedUser);
  } catch (error) {
    console.error(`Update User Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating user profile' });
  }
};

/**
 * Deletes the authenticated user's profile.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const deleteUserProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.destroy();

    res.json({ message: 'User profile deleted successfully' });
  } catch (error) {
    console.error(`Delete User Profile Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting user profile' });
  }
};
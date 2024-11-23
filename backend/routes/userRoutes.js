// routes/userRoutes.js

import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
} from '../controllers/userController.js';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private (Authenticated Users)
 */
router.get('/me', authenticateToken, getUserProfile);

/**
 * @route   PUT /api/users/me
 * @desc    Update current user's profile
 * @access  Private (Authenticated Users)
 */
router.put(
  '/me',
  authenticateToken,
  [
    body('name')
      .optional()
      .notEmpty()
      .withMessage('Name cannot be empty')
      .isString()
      .withMessage('Name must be a string'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .optional()
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    // Add more validations as needed
  ],
  updateUserProfile
);

/**
 * @route   DELETE /api/users/me
 * @desc    Delete current user's profile
 * @access  Private (Authenticated Users)
 */
router.delete('/me', authenticateToken, deleteUserProfile);

export default router;
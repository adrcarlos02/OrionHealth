// routes/authRoutes.js

import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { body } from 'express-validator';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    // Validation middleware using express-validator
    body('name')
      .notEmpty()
      .withMessage('Name is required')
      .isString()
      .withMessage('Name must be a string'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['admin', 'doctor', 'customer'])
      .withMessage('Role must be admin, doctor, or customer'),
  ],
  registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get token
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  loginUser
);

export default router;
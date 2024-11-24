// routes/userRoutes.js

import express from 'express';
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/userController.js';
import { body, param } from 'express-validator';
import authenticateToken from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorize.js';
import validateUserUpdate from '../validators/userUpdateValidator.js'; // Import your custom validator

const router = express.Router();

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    // Validation middleware using express-validator
    body('name')
      .isString()
      .withMessage('Name must be a string')
      .notEmpty()
      .withMessage('Name cannot be empty'),
    body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .notEmpty()
      .withMessage('Email cannot be empty'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .isIn(['admin', 'doctor', 'customer'])
      .withMessage('Role must be one of admin, doctor, or customer'),
  ],
  createUser
);

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Admin
 */
router.get('/', authenticateToken, authorizeRoles('admin'), getAllUsers);

/**
 * @route   GET /api/users/:id
 * @desc    Get a user by ID
 * @access  Admin or the user themselves
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('User ID must be an integer')
      .notEmpty()
      .withMessage('User ID cannot be empty'),
  ],
  getUserById
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Admin or the user themselves
 */
router.put(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('User ID must be an integer')
      .notEmpty()
      .withMessage('User ID cannot be empty'),
    // Additional validations can be added for fields being updated
    // For example, validating the role if admin is updating it
  ],
  validateUserUpdate,
  updateUser
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [
    param('id')
      .isInt()
      .withMessage('User ID must be an integer')
      .notEmpty()
      .withMessage('User ID cannot be empty'),
  ],
  deleteUser
);

export default router;
// routes/messageRoutes.js

import express from 'express';
import {
  sendMessage,
  getAllMessages,
  getMessageById,
  markMessageAsRead,
  deleteMessage,
} from '../controllers/messageController.js';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Authenticated Users
 */
router.post(
  '/',
  authenticateToken, // Ensure the user is authenticated
  [
    body('receiver_id')
      .isInt()
      .withMessage('Valid receiver_id is required')
      .notEmpty()
      .withMessage('receiver_id cannot be empty'),
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isString()
      .withMessage('Content must be a string'),
    // Add more validations as needed
  ],
  sendMessage
);

/**
 * @route   GET /api/messages
 * @desc    Get all messages for the authenticated user
 * @access  Admin, Authenticated Users
 */
router.get('/', authenticateToken, getAllMessages);

/**
 * @route   GET /api/messages/:id
 * @desc    Get a message by ID
 * @access  Admin, Sender, Receiver
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Message ID must be an integer')
      .notEmpty()
      .withMessage('Message ID cannot be empty'),
  ],
  getMessageById
);

/**
 * @route   PUT /api/messages/:id/read
 * @desc    Mark a message as read
 * @access  Receiver or Admin
 */
router.put(
  '/:id/read',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Message ID must be an integer')
      .notEmpty()
      .withMessage('Message ID cannot be empty'),
  ],
  markMessageAsRead
);

/**
 * @route   DELETE /api/messages/:id
 * @desc    Delete a message
 * @access  Admin, Sender, Receiver
 */
router.delete(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Message ID must be an integer')
      .notEmpty()
      .withMessage('Message ID cannot be empty'),
  ],
  deleteMessage
);

export default router;
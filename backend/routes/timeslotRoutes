// routes/timeslotRoutes.js

import express from 'express';
import {
  createTimeslot,
  getAllTimeslots,
  getTimeslotById,
  updateTimeslot,
  deleteTimeslot,
} from '../controllers/timeslotController.js';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/timeslots
 * @desc    Create a new timeslot
 * @access  Admin or Doctor
 */
router.post(
  '/',
  authenticateToken, // Ensure the user is authenticated
  authorizeRoles('admin', 'doctor'), // Admins and Doctors can create timeslots
  [
    body('doctor_id')
      .isInt()
      .withMessage('Valid doctor_id is required')
      .notEmpty()
      .withMessage('doctor_id cannot be empty'),
    body('date')
      .isISO8601()
      .withMessage('Valid date is required')
      .notEmpty()
      .withMessage('Date cannot be empty'),
    body('start_time')
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('Start time must be in HH:MM format')
      .notEmpty()
      .withMessage('Start time cannot be empty'),
    body('end_time')
      .matches(/^([0-1]\d|2[0-3]):([0-5]\d)$/)
      .withMessage('End time must be in HH:MM format')
      .notEmpty()
      .withMessage('End time cannot be empty'),
    body('status')
      .isIn(['available', 'booked', 'unavailable'])
      .withMessage('Status must be available, booked, or unavailable'),
  ],
  createTimeslot
);

/**
 * @route   GET /api/timeslots
 * @desc    Get all timeslots
 * @access  Authenticated Users
 */
router.get('/', authenticateToken, getAllTimeslots);

/**
 * @route   GET /api/timeslots/:id
 * @desc    Get a timeslot by ID
 * @access  Authenticated Users
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Timeslot ID must be an integer')
      .notEmpty()
      .withMessage('Timeslot ID cannot be empty'),
  ],
  getTimeslotById
);

/**
 * @route   PUT /api/timeslots/:id
 * @desc    Update a timeslot
 * @access  Admin or Doctor
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'doctor'), // Admins and Doctors can update timeslots
  [
    param('id')
      .isInt()
      .withMessage('Timeslot ID must be an integer')
      .notEmpty()
      .withMessage('Timeslot ID cannot be empty'),
    // Add body validations as needed for fields being updated
  ],
  updateTimeslot
);

/**
 * @route   DELETE /api/timeslots/:id
 * @desc    Delete a timeslot
 * @access  Admin or Doctor
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'doctor'), // Admins and Doctors can delete timeslots
  [
    param('id')
      .isInt()
      .withMessage('Timeslot ID must be an integer')
      .notEmpty()
      .withMessage('Timeslot ID cannot be empty'),
  ],
  deleteTimeslot
);

export default router;
// routes/appointmentRoutes.js

import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment
 * @access  Customer
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('customer'), // Only customers can create appointments
  [
    body('timeslot_id')
      .isInt()
      .withMessage('Valid timeslot_id is required')
      .notEmpty()
      .withMessage('timeslot_id cannot be empty'),
    body('notes')
      .optional()
      .isString()
      .withMessage('Notes must be a string'),
    // Add more validations as needed
  ],
  createAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments
 * @access  Admin, Doctor, Customer
 */
router.get('/', authenticateToken, getAllAppointments);

/**
 * @route   GET /api/appointments/:id
 * @desc    Get an appointment by ID
 * @access  Admin, Doctor, Customer
 */
router.get(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Appointment ID must be an integer')
      .notEmpty()
      .withMessage('Appointment ID cannot be empty'),
  ],
  getAppointmentById
);

/**
 * @route   PUT /api/appointments/:id
 * @desc    Update an appointment
 * @access  Admin or Customer
 */
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'customer'), // Admins and Customers can update appointments
  [
    param('id')
      .isInt()
      .withMessage('Appointment ID must be an integer')
      .notEmpty()
      .withMessage('Appointment ID cannot be empty'),
    // Add body validations as needed for fields being updated
  ],
  updateAppointment
);

/**
 * @route   DELETE /api/appointments/:id
 * @desc    Delete an appointment
 * @access  Admin or Customer
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin', 'customer'), // Admins and Customers can delete appointments
  [
    param('id')
      .isInt()
      .withMessage('Appointment ID must be an integer')
      .notEmpty()
      .withMessage('Appointment ID cannot be empty'),
  ],
  deleteAppointment
);

export default router;
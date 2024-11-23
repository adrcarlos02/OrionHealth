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
  authorizeRoles('customer'),
  [
    body('timeslot_id').isInt().withMessage('Valid timeslot_id is required'),
    body('notes').optional().isString().withMessage('Notes must be a string'),
    // Additional validations as needed
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
  [param('id').isInt().withMessage('Appointment ID must be an integer')],
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
  [
    param('id').isInt().withMessage('Appointment ID must be an integer'),
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
  [
    param('id').isInt().withMessage('Appointment ID must be an integer'),
    // Optionally, enforce role-based access here if not handled in controller
  ],
  deleteAppointment
);

export default router;
// routes/doctorRoutes.js

import express from 'express';
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
} from '../controllers/doctorController.js';
import { body, param } from 'express-validator';
import { authenticateToken, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor profile
 * @access  Admin
 */
router.post(
  '/',
  authenticateToken,
  authorizeRoles('admin'),
  [
    body('user_id').isInt().withMessage('Valid user_id is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
    body('degree').notEmpty().withMessage('Degree is required'),
    body('experience').isInt({ min: 0 }).withMessage('Experience must be a positive integer'),
    body('fees').isDecimal({ decimal_digits: '0,2' }).withMessage('Valid fees are required'),
    body('address_line1').notEmpty().withMessage('Address Line 1 is required'),
    body('city').notEmpty().withMessage('City is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('postal_code').notEmpty().withMessage('Postal Code is required'),
    // Additional validations as needed
  ],
  createDoctor
);

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors
 * @access  Authenticated Users
 */
router.get('/', authenticateToken, getAllDoctors);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get a doctor by ID
 * @access  Authenticated Users
 */
router.get(
  '/:id',
  authenticateToken,
  [param('id').isInt().withMessage('Doctor ID must be an integer')],
  getDoctorById
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update a doctor profile
 * @access  Admin or Doctor
 */
router.put(
  '/:id',
  authenticateToken,
  [
    param('id').isInt().withMessage('Doctor ID must be an integer'),
    // Add body validations as needed for fields being updated
  ],
  updateDoctor
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete a doctor profile
 * @access  Admin
 */
router.delete(
  '/:id',
  authenticateToken,
  authorizeRoles('admin'),
  [param('id').isInt().withMessage('Doctor ID must be an integer')],
  deleteDoctor
);

export default router;
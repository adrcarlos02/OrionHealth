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
import authenticateToken from '../middleware/authenticateToken.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @route   POST /api/doctors
 * @desc    Create a new doctor profile
 * @access  Admin
 */
router.post(
  '/',
  authenticateToken, // Ensure the user is authenticated
  authorizeRoles('admin'), // Only admins can create doctor profiles
  [
    // Validation middleware using express-validator
    body('user_id')
      .isInt()
      .withMessage('Valid user_id is required')
      .notEmpty()
      .withMessage('user_id cannot be empty'),
    body('specialty')
      .notEmpty()
      .withMessage('Specialty is required')
      .isString()
      .withMessage('Specialty must be a string'),
    body('degree')
      .notEmpty()
      .withMessage('Degree is required')
      .isString()
      .withMessage('Degree must be a string'),
    body('experience')
      .isInt({ min: 0 })
      .withMessage('Experience must be a non-negative integer'),
    body('fees')
      .isDecimal({ decimal_digits: '0,2' })
      .withMessage('Fees must be a decimal with up to two decimal places'),
    body('address_line1')
      .notEmpty()
      .withMessage('Address Line 1 is required')
      .isString()
      .withMessage('Address Line 1 must be a string'),
    body('city')
      .notEmpty()
      .withMessage('City is required')
      .isString()
      .withMessage('City must be a string'),
    body('state')
      .notEmpty()
      .withMessage('State is required')
      .isString()
      .withMessage('State must be a string'),
    body('postal_code')
      .notEmpty()
      .withMessage('Postal Code is required')
      .isString()
      .withMessage('Postal Code must be a string'),
    // Optional fields
    body('about').optional().isString().withMessage('About must be a string'),
    body('address_line2').optional().isString().withMessage('Address Line 2 must be a string'),
    body('profile_image_url').optional().isURL().withMessage('Profile Image URL must be a valid URL'),
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
  [
    param('id')
      .isInt()
      .withMessage('Doctor ID must be an integer')
      .notEmpty()
      .withMessage('Doctor ID cannot be empty'),
  ],
  getDoctorById
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update a doctor profile
 * @access  Admin or Doctor themselves
 */
router.put(
  '/:id',
  authenticateToken,
  [
    param('id')
      .isInt()
      .withMessage('Doctor ID must be an integer')
      .notEmpty()
      .withMessage('Doctor ID cannot be empty'),
    // Additional validations can be added for fields being updated
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
  authorizeRoles('admin'), // Only admins can delete doctor profiles
  [
    param('id')
      .isInt()
      .withMessage('Doctor ID must be an integer')
      .notEmpty()
      .withMessage('Doctor ID cannot be empty'),
  ],
  deleteDoctor
);

export default router;
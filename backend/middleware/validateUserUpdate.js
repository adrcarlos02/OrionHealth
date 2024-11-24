// middleware/validateUserUpdate.js

import { body } from 'express-validator';

/**
 * Validation rules for updating a user profile.
 */
const validateUserUpdate = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export default validateUserUpdate;
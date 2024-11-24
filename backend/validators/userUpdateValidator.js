// validators/userUpdateValidator.js

import { body } from 'express-validator';

const validateUserUpdate = [
  body('name')
    .optional()
    .isString()
    .withMessage('Name must be a string')
    .isLength({ max: 100 })
    .withMessage('Name can be up to 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

export default validateUserUpdate;
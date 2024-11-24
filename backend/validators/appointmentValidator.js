// validators/appointmentValidator.js

import { body } from 'express-validator';

export const createAppointmentValidator = [
  body('timeslot_id')
    .isInt({ gt: 0 })
    .withMessage('Timeslot ID must be a positive integer')
    .notEmpty()
    .withMessage('Timeslot ID is required'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes can be up to 500 characters'),
];

export const updateAppointmentValidator = [
  body('timeslot_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Timeslot ID must be a positive integer'),
  body('notes')
    .optional()
    .isString()
    .withMessage('Notes must be a string')
    .isLength({ max: 500 })
    .withMessage('Notes can be up to 500 characters'),
  body('status')
    .optional()
    .isIn(['confirmed', 'cancelled', 'completed'])
    .withMessage('Status must be one of confirmed, cancelled, or completed'),
];
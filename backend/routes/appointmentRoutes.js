// routes/appointmentsRoutes.js

import express from 'express';
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
} from '../controllers/appointmentController.js';
import { createAppointmentValidator, updateAppointmentValidator } from '../validators/appointmentValidator.js';
import { authorizeRoles } from '../middleware/authorize.js';

const router = express.Router();

// Create Appointment - Only customers
router.post(
  '/',
  authorizeRoles('customer'),
  createAppointmentValidator,
  createAppointment
);

// Get All Appointments - Admins, Doctors, Customers
router.get('/', authorizeRoles('admin', 'doctor', 'customer'), getAllAppointments);

// Get Appointment By ID - Admins, Doctors, Customers
router.get('/:id', authorizeRoles('admin', 'doctor', 'customer'), getAppointmentById);

// Update Appointment - Admins, Customers
router.put(
  '/:id',
  authorizeRoles('admin', 'customer'),
  updateAppointmentValidator,
  updateAppointment
);

// Delete Appointment - Admins, Customers
router.delete('/:id', authorizeRoles('admin', 'customer'), deleteAppointment);

export default router;
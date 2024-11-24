// controllers/appointmentController.js

import { validationResult } from 'express-validator';
import * as appointmentService from '../services/appointmentService.js';

/**
 * Create a new appointment.
 * Only accessible by customers.
 */
export const createAppointment = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await appointmentService.createAppointment(req.user.user_id, req.body);
    res.status(201).json(appointment);
  } catch (error) {
    console.error(`Create Appointment Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while creating appointment' });
    }
  }
};

/**
 * Get all appointments.
 * Accessible by admins and doctors (for their patients).
 * Customers can view their own appointments.
 */
export const getAllAppointments = async (req, res, next) => {
  try {
    const appointments = await appointmentService.getAllAppointments(req.user);
    res.json(appointments);
  } catch (error) {
    console.error(`Get All Appointments Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching appointments' });
    }
  }
};

/**
 * Get a single appointment by ID.
 * Accessible by admins, doctors (for their patients), and the customer who booked it.
 */
export const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params; // appointment_id
    const appointment = await appointmentService.getAppointmentById(id, req.user);
    res.json(appointment);
  } catch (error) {
    console.error(`Get Appointment By ID Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching appointment' });
    }
  }
};

/**
 * Update an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params; // appointment_id
    const appointment = await appointmentService.updateAppointment(id, req.user, req.body);
    res.json(appointment);
  } catch (error) {
    console.error(`Update Appointment Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while updating appointment' });
    }
  }
};

/**
 * Delete an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params; // appointment_id
    const result = await appointmentService.deleteAppointment(id, req.user);
    res.json(result);
  } catch (error) {
    console.error(`Delete Appointment Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while deleting appointment' });
    }
  }
};
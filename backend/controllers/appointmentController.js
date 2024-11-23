// controllers/appointmentController.js

import { Appointment, Timeslot, Doctor, User } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Create a new appointment.
 * Only accessible by customers.
 */
export const createAppointment = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { timeslot_id, notes } = req.body;

    // Check if timeslot exists and is available
    const timeslot = await Timeslot.findByPk(timeslot_id);
    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found' });
    }
    if (timeslot.status !== 'available') {
      return res.status(400).json({ message: 'Timeslot is not available' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      timeslot_id,
      customer_id: req.user.user_id,
      status: 'confirmed',
      notes,
    });

    // Update timeslot status
    await timeslot.update({ status: 'booked' });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(`Create Appointment Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating appointment' });
  }
};

/**
 * Get all appointments.
 * Accessible by admins and doctors (for their patients).
 * Customers can view their own appointments.
 */
export const getAllAppointments = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'doctor') {
      // Find doctor profile
      const doctor = await Doctor.findOne({ where: { user_id: req.user.user_id } });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }

      // Get appointments for this doctor's timeslots
      const timeslotIds = await Timeslot.findAll({
        where: { doctor_id: doctor.doctor_id },
        attributes: ['timeslot_id'],
      }).then(timeslots => timeslots.map(ts => ts.timeslot_id));

      whereClause = { timeslot_id: timeslotIds };
    } else if (req.user.role === 'customer') {
      // Customers can view their own appointments
      whereClause = { customer_id: req.user.user_id };
    }

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Timeslot,
          include: {
            model: Doctor,
            include: {
              model: User,
              attributes: ['name', 'email'],
            },
          },
        },
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    res.json(appointments);
  } catch (error) {
    console.error(`Get All Appointments Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching appointments' });
  }
};

/**
 * Get a single appointment by ID.
 * Accessible by admins, doctors (for their patients), and the customer who booked it.
 */
export const getAppointmentById = async (req, res) => {
  try {
    const { id } = req.params; // appointment_id
    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Timeslot,
          include: {
            model: Doctor,
            include: {
              model: User,
              attributes: ['name', 'email'],
            },
          },
        },
        {
          model: User,
          attributes: ['name', 'email'],
        },
      ],
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Access control
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.user_id } });
      if (appointment.Timeslot.doctor_id !== doctor.doctor_id) {
        return res.status(403).json({ message: 'Forbidden: Access is denied.' });
      }
    } else if (req.user.role === 'customer' && appointment.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    res.json(appointment);
  } catch (error) {
    console.error(`Get Appointment By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching appointment' });
  }
};

/**
 * Update an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const updateAppointment = async (req, res) => {
  try {
    const { id } = req.params; // appointment_id
    const appointment = await Appointment.findByPk(id, {
      include: {
        model: Timeslot,
      },
    });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && appointment.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // If updating timeslot, ensure the new timeslot is available
    if (req.body.timeslot_id && req.body.timeslot_id !== appointment.timeslot_id) {
      const newTimeslot = await Timeslot.findByPk(req.body.timeslot_id);
      if (!newTimeslot || newTimeslot.status !== 'available') {
        return res.status(400).json({ message: 'New timeslot is not available' });
      }

      // Update timeslot statuses
      const oldTimeslot = await Timeslot.findByPk(appointment.timeslot_id);
      await oldTimeslot.update({ status: 'available' });
      await newTimeslot.update({ status: 'booked' });
    }

    // Update appointment
    await appointment.update(req.body);

    res.json(appointment);
  } catch (error) {
    console.error(`Update Appointment Error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const deleteAppointment = async (req, res) => {
  try {
    const { id } = req.params; // appointment_id
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && appointment.customer_id !== req.user.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Update timeslot status to available
    const timeslot = await Timeslot.findByPk(appointment.timeslot_id);
    await timeslot.update({ status: 'available' });

    // Delete appointment
    await appointment.destroy();

    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error(`Delete Appointment Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting appointment' });
  }
};
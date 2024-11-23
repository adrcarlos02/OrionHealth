// controllers/timeslotController.js

import { Timeslot, Doctor, Appointment } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Create a new timeslot for a doctor.
 * Only accessible by admins or the doctor themselves.
 */
export const createTimeslot = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctor_id, date, start_time, end_time, status } = req.body;

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctor_id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the user is admin or the doctor themselves
    if (req.user.role !== 'admin' && req.user.user_id !== doctor.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Create timeslot
    const timeslot = await Timeslot.create({
      doctor_id,
      date,
      start_time,
      end_time,
      status,
    });

    res.status(201).json(timeslot);
  } catch (error) {
    console.error(`Create Timeslot Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating timeslot' });
  }
};

/**
 * Get all timeslots.
 * Accessible by authenticated users.
 * Admins can view all timeslots; doctors can view their own; customers can view available timeslots.
 */
export const getAllTimeslots = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.user_id } });
      if (!doctor) {
        return res.status(404).json({ message: 'Doctor profile not found' });
      }
      whereClause = { doctor_id: doctor.doctor_id };
    } else if (req.user.role === 'customer') {
      whereClause = { status: 'available' };
    }

    const timeslots = await Timeslot.findAll({
      where: whereClause,
      include: {
        model: Doctor,
        include: {
          model: User,
          attributes: ['name', 'email'],
        },
      },
    });

    res.json(timeslots);
  } catch (error) {
    console.error(`Get All Timeslots Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching timeslots' });
  }
};

/**
 * Get a single timeslot by ID.
 * Accessible by admins, the respective doctor, or customers (if available).
 */
export const getTimeslotById = async (req, res) => {
  try {
    const { id } = req.params; // timeslot_id
    const timeslot = await Timeslot.findByPk(id, {
      include: {
        model: Doctor,
        include: {
          model: User,
          attributes: ['name', 'email'],
        },
      },
    });

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found' });
    }

    // Access control
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { user_id: req.user.user_id } });
      if (timeslot.doctor_id !== doctor.doctor_id) {
        return res.status(403).json({ message: 'Forbidden: Access is denied.' });
      }
    } else if (req.user.role === 'customer' && timeslot.status !== 'available') {
      return res.status(403).json({ message: 'Forbidden: Timeslot is not available.' });
    }

    res.json(timeslot);
  } catch (error) {
    console.error(`Get Timeslot By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching timeslot' });
  }
};

/**
 * Update a timeslot.
 * Only accessible by admins or the respective doctor.
 */
export const updateTimeslot = async (req, res) => {
  try {
    const { id } = req.params; // timeslot_id
    const timeslot = await Timeslot.findByPk(id);

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found' });
    }

    // Access control
    const doctor = await Doctor.findOne({ where: { doctor_id: timeslot.doctor_id } });
    if (req.user.role !== 'admin' && req.user.user_id !== doctor.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Update timeslot
    await timeslot.update(req.body);

    res.json(timeslot);
  } catch (error) {
    console.error(`Update Timeslot Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating timeslot' });
  }
};

/**
 * Delete a timeslot.
 * Only accessible by admins or the respective doctor.
 */
export const deleteTimeslot = async (req, res) => {
  try {
    const { id } = req.params; // timeslot_id
    const timeslot = await Timeslot.findByPk(id);

    if (!timeslot) {
      return res.status(404).json({ message: 'Timeslot not found' });
    }

    // Access control
    const doctor = await Doctor.findOne({ where: { doctor_id: timeslot.doctor_id } });
    if (req.user.role !== 'admin' && req.user.user_id !== doctor.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Check if timeslot has an appointment
    const appointment = await Appointment.findOne({ where: { timeslot_id: id } });
    if (appointment) {
      return res.status(400).json({ message: 'Cannot delete timeslot with existing appointment' });
    }

    await timeslot.destroy();

    res.json({ message: 'Timeslot deleted successfully' });
  } catch (error) {
    console.error(`Delete Timeslot Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting timeslot' });
  }
};
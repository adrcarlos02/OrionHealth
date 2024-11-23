// controllers/doctorController.js

import { Doctor, User, Timeslot } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Create a new doctor profile.
 * Only accessible by admins.
 */
export const createDoctor = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { user_id, specialty, degree, experience, about, fees, address_line1, address_line2, city, state, postal_code, profile_image_url } = req.body;

    // Check if user exists and is a doctor
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role !== 'doctor') {
      return res.status(400).json({ message: 'User role is not doctor' });
    }

    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ where: { user_id } });
    if (existingDoctor) {
      return res.status(400).json({ message: 'Doctor profile already exists for this user' });
    }

    // Create doctor profile
    const doctor = await Doctor.create({
      user_id,
      specialty,
      degree,
      experience,
      about,
      fees,
      address_line1,
      address_line2,
      city,
      state,
      postal_code,
      profile_image_url,
    });

    res.status(201).json(doctor);
  } catch (error) {
    console.error(`Create Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while creating doctor profile' });
  }
};

/**
 * Get all doctors.
 * Accessible by authenticated users.
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: {
        model: User,
        attributes: ['name', 'email', 'profile_image_url'],
      },
    });
    res.json(doctors);
  } catch (error) {
    console.error(`Get All Doctors Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching doctors' });
  }
};

/**
 * Get a single doctor by ID.
 * Accessible by authenticated users.
 */
export const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findByPk(id, {
      include: {
        model: User,
        attributes: ['name', 'email', 'profile_image_url'],
      },
    });

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.json(doctor);
  } catch (error) {
    console.error(`Get Doctor By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching doctor' });
  }
};

/**
 * Update a doctor profile.
 * Only accessible by admins or the doctor themselves.
 */
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params; // doctor_id
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if the user is admin or the owner of the doctor profile
    if (req.user.role !== 'admin' && req.user.user_id !== doctor.user_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Update doctor profile
    await doctor.update(req.body);

    res.json(doctor);
  } catch (error) {
    console.error(`Update Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating doctor profile' });
  }
};

/**
 * Delete a doctor profile.
 * Only accessible by admins.
 */
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params; // doctor_id
    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Only admin can delete doctor profiles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Only admins can delete doctor profiles.' });
    }

    await doctor.destroy();

    res.json({ message: 'Doctor profile deleted successfully' });
  } catch (error) {
    console.error(`Delete Doctor Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting doctor profile' });
  }
};
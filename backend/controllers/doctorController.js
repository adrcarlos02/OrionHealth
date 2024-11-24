// controllers/doctorController.js

import { validationResult } from 'express-validator';
import * as doctorService from '../services/doctorService.js';

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

    const doctor = await doctorService.createDoctor(req.body);
    res.status(201).json(doctor);
  } catch (error) {
    console.error(`Create Doctor Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while creating doctor profile' });
    }
  }
};

/**
 * Get all doctors.
 * Accessible by authenticated users.
 */
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorService.getAllDoctors();
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
    const doctor = await doctorService.getDoctorById(id);
    res.json(doctor);
  } catch (error) {
    console.error(`Get Doctor By ID Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching doctor' });
    }
  }
};

/**
 * Update a doctor profile.
 * Only accessible by admins or the doctor themselves.
 */
export const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params; // doctor_id
    const doctor = await doctorService.updateDoctor(id, req.user, req.body);
    res.json(doctor);
  } catch (error) {
    console.error(`Update Doctor Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while updating doctor profile' });
    }
  }
};

/**
 * Delete a doctor profile.
 * Only accessible by admins.
 */
export const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params; // doctor_id
    const result = await doctorService.deleteDoctor(id, req.user);
    res.json(result);
  } catch (error) {
    console.error(`Delete Doctor Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while deleting doctor profile' });
    }
  }
};
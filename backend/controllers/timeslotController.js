// controllers/timeslotController.js

import { validationResult } from 'express-validator';
import * as timeslotService from '../services/timeslotService.js';

/**
 * Create a new timeslot for a doctor.
 * Only accessible by admins or the doctor themselves.
 */
export const createTimeslot = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timeslot = await timeslotService.createTimeslot(req.user, req.body);
    res.status(201).json(timeslot);
  } catch (error) {
    console.error(`Create Timeslot Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while creating timeslot' });
    }
  }
};

/**
 * Get all timeslots.
 * Accessible by authenticated users.
 */
export const getAllTimeslots = async (req, res) => {
  try {
    const timeslots = await timeslotService.getAllTimeslots(req.user);
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
    const { id } = req.params;
    const timeslot = await timeslotService.getTimeslotById(id, req.user);
    res.json(timeslot);
  } catch (error) {
    console.error(`Get Timeslot By ID Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching timeslot' });
    }
  }
};

/**
 * Update a timeslot.
 * Only accessible by admins or the respective doctor.
 */
export const updateTimeslot = async (req, res) => {
  try {
    const { id } = req.params;
    const timeslot = await timeslotService.updateTimeslot(id, req.user, req.body);
    res.json(timeslot);
  } catch (error) {
    console.error(`Update Timeslot Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while updating timeslot' });
    }
  }
};

/**
 * Delete a timeslot.
 * Only accessible by admins or the respective doctor.
 */
export const deleteTimeslot = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await timeslotService.deleteTimeslot(id, req.user);
    res.json(result);
  } catch (error) {
    console.error(`Delete Timeslot Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while deleting timeslot' });
    }
  }
};
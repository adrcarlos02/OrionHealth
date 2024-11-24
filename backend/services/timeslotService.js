// services/timeslotService.js

import { Timeslot, Doctor, Appointment, User } from '../models/index.js';

/**
 * Create a new timeslot for a doctor.
 * @param {Object} user - The authenticated user.
 * @param {Object} timeslotData - Data for the new timeslot.
 * @returns {Object} - The created timeslot.
 * @throws {Object} - Error with status and message.
 */
export const createTimeslot = async (user, timeslotData) => {
  const { doctor_id, date, start_time, end_time, status } = timeslotData;

  // Check if doctor exists
  const doctor = await Doctor.findByPk(doctor_id);
  if (!doctor) {
    throw { status: 404, message: 'Doctor not found' };
  }

  // Check if the user is admin or the doctor themselves
  if (user.role !== 'admin' && user.user_id !== doctor.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Create and return the timeslot
  return await Timeslot.create({ doctor_id, date, start_time, end_time, status });
};

/**
 * Get all timeslots.
 * @param {Object} user - The authenticated user.
 * @returns {Array} - List of timeslots.
 */
export const getAllTimeslots = async (user) => {
  let whereClause = {};

  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { user_id: user.user_id } });
    if (!doctor) {
      throw { status: 404, message: 'Doctor profile not found' };
    }
    whereClause = { doctor_id: doctor.doctor_id };
  } else if (user.role === 'customer') {
    whereClause = { status: 'available' };
  }

  return await Timeslot.findAll({
    where: whereClause,
    include: {
      model: Doctor,
      include: {
        model: User,
        attributes: ['name', 'email'],
      },
    },
  });
};

/**
 * Get a single timeslot by ID.
 * @param {number} id - The timeslot ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - The requested timeslot.
 * @throws {Object} - Error with status and message.
 */
export const getTimeslotById = async (id, user) => {
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
    throw { status: 404, message: 'Timeslot not found' };
  }

  // Access control
  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { user_id: user.user_id } });
    if (timeslot.doctor_id !== doctor.doctor_id) {
      throw { status: 403, message: 'Forbidden: Access is denied.' };
    }
  } else if (user.role === 'customer' && timeslot.status !== 'available') {
    throw { status: 403, message: 'Forbidden: Timeslot is not available.' };
  }

  return timeslot;
};

/**
 * Update a timeslot.
 * @param {number} id - The timeslot ID.
 * @param {Object} user - The authenticated user.
 * @param {Object} updateData - Data to update the timeslot with.
 * @returns {Object} - The updated timeslot.
 * @throws {Object} - Error with status and message.
 */
export const updateTimeslot = async (id, user, updateData) => {
  const timeslot = await Timeslot.findByPk(id);

  if (!timeslot) {
    throw { status: 404, message: 'Timeslot not found' };
  }

  // Access control
  const doctor = await Doctor.findOne({ where: { doctor_id: timeslot.doctor_id } });
  if (user.role !== 'admin' && user.user_id !== doctor.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Update and return the timeslot
  await timeslot.update(updateData);
  return timeslot;
};

/**
 * Delete a timeslot.
 * @param {number} id - The timeslot ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - Success message.
 * @throws {Object} - Error with status and message.
 */
export const deleteTimeslot = async (id, user) => {
  const timeslot = await Timeslot.findByPk(id);

  if (!timeslot) {
    throw { status: 404, message: 'Timeslot not found' };
  }

  // Access control
  const doctor = await Doctor.findOne({ where: { doctor_id: timeslot.doctor_id } });
  if (user.role !== 'admin' && user.user_id !== doctor.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Check if timeslot has an appointment
  const appointment = await Appointment.findOne({ where: { timeslot_id: id } });
  if (appointment) {
    throw { status: 400, message: 'Cannot delete timeslot with existing appointment' };
  }

  await timeslot.destroy();
  return { message: 'Timeslot deleted successfully' };
};
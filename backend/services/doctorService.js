// services/doctorService.js

import { Doctor, User } from '../models/index.js';

/**
 * Create a new doctor profile.
 * @param {Object} doctorData - Data for the new doctor profile.
 * @returns {Object} - The created doctor profile.
 * @throws {Object} - Error with status and message.
 */
export const createDoctor = async (doctorData) => {
  const { user_id, specialty, degree, experience, about, fees, address_line1, address_line2, city, state, postal_code, profile_image_url } = doctorData;

  // Check if the user exists and has a role of doctor
  const user = await User.findByPk(user_id);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  if (user.role !== 'doctor') {
    throw { status: 400, message: 'User role is not doctor' };
  }

  // Check if the doctor profile already exists
  const existingDoctor = await Doctor.findOne({ where: { user_id } });
  if (existingDoctor) {
    throw { status: 400, message: 'Doctor profile already exists for this user' };
  }

  // Create and return doctor profile
  return await Doctor.create({
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
};

/**
 * Get all doctors.
 * @returns {Array} - List of all doctor profiles.
 */
export const getAllDoctors = async () => {
  return await Doctor.findAll({
    include: {
      model: User,
      attributes: ['name', 'email', 'profile_image_url'],
    },
  });
};

/**
 * Get a single doctor by ID.
 * @param {number} id - The doctor ID.
 * @returns {Object} - The doctor profile.
 * @throws {Object} - Error with status and message if not found.
 */
export const getDoctorById = async (id) => {
  const doctor = await Doctor.findByPk(id, {
    include: {
      model: User,
      attributes: ['name', 'email', 'profile_image_url'],
    },
  });

  if (!doctor) {
    throw { status: 404, message: 'Doctor not found' };
  }

  return doctor;
};

/**
 * Update a doctor profile.
 * @param {number} id - The doctor ID.
 * @param {Object} user - The authenticated user.
 * @param {Object} updateData - Data to update the doctor profile with.
 * @returns {Object} - The updated doctor profile.
 * @throws {Object} - Error with status and message if unauthorized or not found.
 */
export const updateDoctor = async (id, user, updateData) => {
  const doctor = await Doctor.findByPk(id);

  if (!doctor) {
    throw { status: 404, message: 'Doctor not found' };
  }

  // Check if the user is admin or the owner of the doctor profile
  if (user.role !== 'admin' && user.user_id !== doctor.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Update and return the doctor profile
  await doctor.update(updateData);
  return doctor;
};

/**
 * Delete a doctor profile.
 * @param {number} id - The doctor ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - Success message.
 * @throws {Object} - Error with status and message if unauthorized or not found.
 */
export const deleteDoctor = async (id, user) => {
  const doctor = await Doctor.findByPk(id);

  if (!doctor) {
    throw { status: 404, message: 'Doctor not found' };
  }

  // Only admins can delete doctor profiles
  if (user.role !== 'admin') {
    throw { status: 403, message: 'Forbidden: Only admins can delete doctor profiles.' };
  }

  await doctor.destroy();
  return { message: 'Doctor profile deleted successfully' };
};
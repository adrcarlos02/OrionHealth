// services/appointmentService.js

import { Appointment, Timeslot, Doctor, User } from '../models/index.js';

/**
 * Create a new appointment.
 * Only accessible by customers.
 */
export const createAppointment = async (customerId, { timeslot_id, notes }) => {
  // Check if timeslot exists and is available
  const timeslot = await Timeslot.findByPk(timeslot_id);
  if (!timeslot) {
    throw { status: 404, message: 'Timeslot not found' };
  }
  if (timeslot.status !== 'available') {
    throw { status: 400, message: 'Timeslot is not available' };
  }

  // Create appointment
  const appointment = await Appointment.create({
    timeslot_id,
    customer_id: customerId,
    status: 'confirmed',
    notes,
  });

  // Update timeslot status
  await timeslot.update({ status: 'booked' });

  return appointment;
};

/**
 * Get all appointments.
 * Accessible by admins and doctors (for their patients).
 * Customers can view their own appointments.
 */
export const getAllAppointments = async (user) => {
  let whereClause = {};

  if (user.role === 'doctor') {
    // Find doctor profile
    const doctor = await Doctor.findOne({ where: { user_id: user.user_id } });
    if (!doctor) {
      throw { status: 404, message: 'Doctor profile not found' };
    }

    // Get appointments for this doctor's timeslots
    const timeslotIds = await Timeslot.findAll({
      where: { doctor_id: doctor.doctor_id },
      attributes: ['timeslot_id'],
    }).then(timeslots => timeslots.map(ts => ts.timeslot_id));

    whereClause = { timeslot_id: timeslotIds };
  } else if (user.role === 'customer') {
    // Customers can view their own appointments
    whereClause = { customer_id: user.user_id };
  }
  // Admins can view all appointments; no need to modify whereClause

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

  return appointments;
};

/**
 * Get a single appointment by ID.
 * Accessible by admins, doctors (for their patients), and the customer who booked it.
 */
export const getAppointmentById = async (appointmentId, user) => {
  const appointment = await Appointment.findByPk(appointmentId, {
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
    throw { status: 404, message: 'Appointment not found' };
  }

  // Access control
  if (user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { user_id: user.user_id } });
    if (appointment.Timeslot.doctor_id !== doctor.doctor_id) {
      throw { status: 403, message: 'Forbidden: Access is denied.' };
    }
  } else if (user.role === 'customer' && appointment.customer_id !== user.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  return appointment;
};

/**
 * Update an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const updateAppointment = async (appointmentId, user, updateData) => {
  const appointment = await Appointment.findByPk(appointmentId, {
    include: {
      model: Timeslot,
    },
  });

  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  // Access control
  if (user.role !== 'admin' && appointment.customer_id !== user.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // If updating timeslot, ensure the new timeslot is available
  if (updateData.timeslot_id && updateData.timeslot_id !== appointment.timeslot_id) {
    const newTimeslot = await Timeslot.findByPk(updateData.timeslot_id);
    if (!newTimeslot || newTimeslot.status !== 'available') {
      throw { status: 400, message: 'New timeslot is not available' };
    }

    // Update timeslot statuses
    const oldTimeslot = await Timeslot.findByPk(appointment.timeslot_id);
    await oldTimeslot.update({ status: 'available' });
    await newTimeslot.update({ status: 'booked' });

    // Update the timeslot_id in the appointment
    appointment.timeslot_id = updateData.timeslot_id;
  }

  // Update other fields (e.g., notes, status)
  if (updateData.notes !== undefined) {
    appointment.notes = updateData.notes;
  }

  if (updateData.status !== undefined) {
    appointment.status = updateData.status;
  }

  await appointment.save();

  return appointment;
};

/**
 * Delete an appointment.
 * Only accessible by admins or the customer who booked it.
 */
export const deleteAppointment = async (appointmentId, user) => {
  const appointment = await Appointment.findByPk(appointmentId);

  if (!appointment) {
    throw { status: 404, message: 'Appointment not found' };
  }

  // Access control
  if (user.role !== 'admin' && appointment.customer_id !== user.user_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Update timeslot status to available
  const timeslot = await Timeslot.findByPk(appointment.timeslot_id);
  if (timeslot) {
    await timeslot.update({ status: 'available' });
  }

  // Delete appointment
  await appointment.destroy();

  return { message: 'Appointment deleted successfully' };
};
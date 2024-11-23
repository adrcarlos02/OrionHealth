import request from 'supertest';
import { app, server } from '../index.js';
import { User, Doctor, Timeslot, Appointment } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let customerToken, doctor, timeslot;

beforeAll(async () => {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test customer
    const customer = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      password_hash: hashedPassword,
      role: 'customer',
    });

    // Create test doctor
    doctor = await Doctor.create({
      user_id: customer.user_id, // Link doctor to the customer for simplicity
      specialty: 'Cardiology',
      degree: 'MD',
      experience: 10,
      fees: 150.0,
      address_line1: '123 Street',
      city: 'Metropolis',
      state: 'State',
      postal_code: '12345',
    });

    // Create test timeslot
    timeslot = await Timeslot.create({
      doctor_id: doctor.doctor_id,
      date: '2024-12-01',
      start_time: '09:00',
      end_time: '10:00',
      status: 'available',
    });

    // Generate JWT token for customer
    const payload = { user_id: customer.user_id, role: customer.role };
    customerToken = jwt.sign(payload, process.env.JWT_SECRET || 'test_secret', {
      expiresIn: '1h',
    });
  } catch (error) {
    console.error('Error setting up test data:', error);
  }
});

describe('Appointment Endpoints', () => {
  it('should create an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        timeslot_id: timeslot.timeslot_id,
        notes: 'Check-up appointment',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('appointment_id');
    expect(res.body).toMatchObject({
      notes: 'Check-up appointment',
      status: 'confirmed',
    });
  });

  it('should not create an appointment for an unavailable timeslot', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        timeslot_id: timeslot.timeslot_id, // Already booked
        notes: 'Follow-up appointment',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Timeslot is not available');
  });
});

afterEach(async () => {
  // Cleanup database after each test to maintain isolation
  await Appointment.destroy({ where: {} });
});

afterAll(async () => {
  try {
    // Cleanup all test data
    await Timeslot.destroy({ where: {} });
    await Doctor.destroy({ where: {} });
    await User.destroy({ where: {} });

    if (server) server.close(); // Stop the server after tests
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
});
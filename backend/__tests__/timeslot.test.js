import request from 'supertest';
import { app, server } from '../index.js';
import { User, Doctor, Timeslot } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let doctorToken, doctor, timeslot;

beforeAll(async () => {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a doctor user
  const doctorUser = await User.create({
    name: 'Test Doctor',
    email: 'doctor@example.com',
    password_hash: hashedPassword,
    role: 'doctor',
  });

  doctor = await Doctor.create({
    user_id: doctorUser.user_id,
    specialty: 'Cardiology',
    degree: 'MD',
    experience: 5,
    fees: 200.0,
    address_line1: '123 Elm Street',
    city: 'Metropolis',
    state: 'NY',
    postal_code: '10001',
  });

  // Generate a token for the doctor
  doctorToken = jwt.sign(
    { user_id: doctorUser.user_id, role: doctorUser.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );

  // Create a timeslot for testing
  timeslot = await Timeslot.create({
    doctor_id: doctor.doctor_id,
    date: '2024-12-15',
    start_time: '09:00',
    end_time: '10:00',
    status: 'available',
  });
});

describe('Timeslot Management Endpoints', () => {
  it('should create a timeslot', async () => {
    const res = await request(app)
      .post('/api/timeslots')
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        doctor_id: doctor.doctor_id,
        date: '2024-12-16',
        start_time: '11:00',
        end_time: '12:00',
        status: 'available',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('timeslot_id');
    expect(res.body).toMatchObject({
      doctor_id: doctor.doctor_id,
      date: '2024-12-16',
      status: 'available',
    });
  });

  it('should fetch all timeslots for the doctor', async () => {
    const res = await request(app)
      .get('/api/timeslots')
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          doctor_id: doctor.doctor_id,
          status: 'available',
        }),
      ])
    );
  });

  it('should fetch a timeslot by ID', async () => {
    const res = await request(app)
      .get(`/api/timeslots/${timeslot.timeslot_id}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toMatchObject({
      timeslot_id: timeslot.timeslot_id,
      doctor_id: doctor.doctor_id,
      status: 'available',
    });
  });

  it('should update a timeslot', async () => {
    const res = await request(app)
      .put(`/api/timeslots/${timeslot.timeslot_id}`)
      .set('Authorization', `Bearer ${doctorToken}`)
      .send({
        status: 'unavailable',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('status', 'unavailable');
  });

  it('should delete a timeslot', async () => {
    const res = await request(app)
      .delete(`/api/timeslots/${timeslot.timeslot_id}`)
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Timeslot deleted successfully');
  });

  it('should return 404 for a non-existent timeslot', async () => {
    const res = await request(app)
      .get('/api/timeslots/9999') // Non-existent timeslot ID
      .set('Authorization', `Bearer ${doctorToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Timeslot not found');
  });
});

afterEach(async () => {
  // Clean up created timeslots after each test
  await Timeslot.destroy({ where: {} });
});

afterAll(async () => {
  try {
    // Cleanup created users and doctors
    await Doctor.destroy({ where: {} });
    await User.destroy({ where: {} });

    if (server) server.close(); // Stop the server after tests
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
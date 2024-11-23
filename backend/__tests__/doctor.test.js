import request from 'supertest';
import { app, server } from '../index.js';
import { User, Doctor } from '../models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

let adminToken, doctorToken, doctorUser, doctorProfile;

beforeAll(async () => {
  // Hash passwords for a realistic scenario
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create an admin user
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    password_hash: hashedPassword,
    role: 'admin',
  });

  // Create a doctor user
  doctorUser = await User.create({
    name: 'Doctor User',
    email: 'doctor@example.com',
    password_hash: hashedPassword,
    role: 'doctor',
  });

  // Generate tokens for admin and doctor
  adminToken = jwt.sign(
    { user_id: admin.user_id, role: admin.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );

  doctorToken = jwt.sign(
    { user_id: doctorUser.user_id, role: doctorUser.role },
    process.env.JWT_SECRET || 'test_secret',
    { expiresIn: '1h' }
  );
});

describe('Doctor Management Endpoints', () => {
  it('should create a doctor profile', async () => {
    const res = await request(app)
      .post('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        user_id: doctorUser.user_id,
        specialty: 'Pediatrics',
        degree: 'MD',
        experience: 5,
        about: 'Specialist in child health',
        fees: 150.0,
        address_line1: '123 Main Street',
        city: 'Metropolis',
        state: 'NY',
        postal_code: '10001',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('doctor_id');
    expect(res.body).toMatchObject({
      specialty: 'Pediatrics',
      degree: 'MD',
      experience: 5,
      fees: 150.0,
    });

    doctorProfile = res.body; // Store for subsequent tests
  });

  it('should get all doctors', async () => {
    const res = await request(app)
      .get('/api/doctors')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          specialty: 'Pediatrics',
          user_id: doctorUser.user_id,
        }),
      ])
    );
  });

  it('should get a doctor by ID', async () => {
    const res = await request(app)
      .get(`/api/doctors/${doctorProfile.doctor_id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('specialty', 'Pediatrics');
    expect(res.body).toMatchObject({
      specialty: 'Pediatrics',
      degree: 'MD',
      experience: 5,
      fees: 150.0,
    });
  });

  it('should update a doctor profile', async () => {
    const res = await request(app)
      .put(`/api/doctors/${doctorProfile.doctor_id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        experience: 10, // Updating experience
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('experience', 10);
    expect(res.body).toMatchObject({
      specialty: 'Pediatrics',
      experience: 10,
    });
  });

  it('should delete a doctor profile', async () => {
    const res = await request(app)
      .delete(`/api/doctors/${doctorProfile.doctor_id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Doctor profile deleted successfully');
  });

  it('should return 404 for a non-existent doctor', async () => {
    const res = await request(app)
      .get('/api/doctors/9999') // Non-existent ID
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Doctor not found');
  });
});

afterEach(async () => {
  // Cleanup created doctor profiles
  await Doctor.destroy({ where: {} });
});

afterAll(async () => {
  try {
    // Cleanup test users
    await User.destroy({ where: {} });
    if (server) server.close(); // Stop the server after all tests
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
});
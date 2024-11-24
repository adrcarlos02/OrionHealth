import request from 'supertest';
import { app, server } from '../index.js';
import { User, Doctor } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { mockAdmin, mockDoctorProfile } from './mockData.js';

// Mock the Doctor and User models
jest.mock('../models/index.js');

let adminToken;

beforeAll(() => {
  // Ensure JWT_SECRET is set for tests
  process.env.JWT_SECRET = 'ORIONHEALTH11';

  // Generate JWT token for admin
  adminToken = jwt.sign(
    { user_id: mockAdmin.user_id, role: mockAdmin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Mock model behavior
  User.findByPk.mockImplementation((id) => (id === mockAdmin.user_id ? Promise.resolve(mockAdmin) : null));
  Doctor.create.mockImplementation((data) => Promise.resolve({ doctor_id: 1, ...data }));
  Doctor.findByPk.mockImplementation((id) =>
    id === mockDoctorProfile.doctor_id ? Promise.resolve(mockDoctorProfile) : null
  );
  Doctor.findAll.mockResolvedValue([mockDoctorProfile]);
  Doctor.update.mockResolvedValue([1]); // Mock successful update
  Doctor.destroy.mockResolvedValue(1); // Mock successful delete
});

describe('Doctor Controller Endpoints', () => {
  describe('POST /api/doctors', () => {
    it('should create a new doctor profile', async () => {
      const doctorData = {
        user_id: mockAdmin.user_id,
        specialty: 'Neurology',
        degree: 'MD',
        experience: 8,
        about: 'Experienced neurologist.',
        fees: 250.0,
        address_line1: '456 Health Ave',
        city: 'Healthville',
        state: 'CA',
        postal_code: '90001',
      };

      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(doctorData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('doctor_id', 1);
      expect(res.body).toMatchObject(doctorData);
    });

    it('should not create a doctor profile if user is not admin', async () => {
      const userToken = jwt.sign(
        { user_id: 2, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          user_id: 2,
          specialty: 'Dermatology',
          degree: 'MD',
          experience: 5,
          fees: 180.0,
          address_line1: '789 Skin St',
          city: 'Dermatown',
          state: 'TX',
          postal_code: '75001',
        });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: Access is denied.');
    });
  });

  describe('GET /api/doctors', () => {
    it('should fetch all doctors', async () => {
      const res = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([mockDoctorProfile]);
    });
  });

  describe('GET /api/doctors/:id', () => {
    it('should fetch a doctor by ID', async () => {
      const res = await request(app)
        .get(`/api/doctors/${mockDoctorProfile.doctor_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(mockDoctorProfile);
    });

    it('should return 404 if doctor not found', async () => {
      Doctor.findByPk.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/doctors/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Doctor not found');
    });
  });

  describe('PUT /api/doctors/:id', () => {
    it('should update a doctor profile', async () => {
      const updatedData = { experience: 10 };

      const res = await request(app)
        .put(`/api/doctors/${mockDoctorProfile.doctor_id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('experience', 10);
      expect(Doctor.update).toHaveBeenCalledWith(
        updatedData,
        { where: { doctor_id: mockDoctorProfile.doctor_id } }
      );
    });

    it('should not update a doctor profile if user is not admin or owner', async () => {
      const userToken = jwt.sign(
        { user_id: 2, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .put(`/api/doctors/${mockDoctorProfile.doctor_id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ experience: 10 });

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: Access is denied.');
    });
  });

  describe('DELETE /api/doctors/:id', () => {
    it('should delete a doctor profile', async () => {
      const res = await request(app)
        .delete(`/api/doctors/${mockDoctorProfile.doctor_id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Doctor profile deleted successfully');
      expect(Doctor.destroy).toHaveBeenCalledWith({ where: { doctor_id: mockDoctorProfile.doctor_id } });
    });

    it('should not delete a doctor profile if user is not admin', async () => {
      const userToken = jwt.sign(
        { user_id: 2, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const res = await request(app)
        .delete(`/api/doctors/${mockDoctorProfile.doctor_id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: Access is denied.');
    });

    it('should return 404 if doctor not found', async () => {
      Doctor.findByPk.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/doctors/999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'Doctor not found');
    });
  });
});

afterAll(() => {
  if (server) server.close(); // Stop the server after tests
});
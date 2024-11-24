import request from 'supertest';
import { app, server } from '../index.js';
import { User, Doctor, Timeslot, Appointment } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { mockDoctor, mockAdmin, mockTimeslot } from './mockData.js'; // Import mock data

// Mock the models
jest.mock('../models/index.js');

let doctorToken, adminToken;

beforeAll(() => {
  // Ensure JWT_SECRET is set for tests
  process.env.JWT_SECRET = 'ORIONHEALTH11';

  // Generate JWT tokens
  doctorToken = jwt.sign(
    { user_id: mockDoctor.user_id, role: mockDoctor.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  adminToken = jwt.sign(
    { user_id: mockAdmin.user_id, role: mockAdmin.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Mock User and Doctor models
  User.findByPk.mockImplementation((id) =>
    id === mockDoctor.user_id
      ? Promise.resolve(mockDoctor)
      : id === mockAdmin.user_id
      ? Promise.resolve(mockAdmin)
      : Promise.resolve(null)
  );

  Doctor.findByPk.mockImplementation((id) =>
    id === mockDoctor.doctor_id ? Promise.resolve(mockDoctor) : Promise.resolve(null)
  );

  // Mock Timeslot model
  Timeslot.findByPk.mockImplementation((id) =>
    id === mockTimeslot.timeslot_id ? Promise.resolve(mockTimeslot) : null
  );
  Timeslot.findAll.mockResolvedValue([mockTimeslot]);
  Timeslot.create.mockImplementation((data) => Promise.resolve({ timeslot_id: 1, ...data }));
  Timeslot.update.mockImplementation((data) => Promise.resolve([1, [{ ...mockTimeslot, ...data }]]));
  Timeslot.destroy.mockResolvedValue(1);

  // Mock Appointment model
  Appointment.findOne.mockResolvedValue(null); // Default: no appointments conflict
});

afterEach(() => {
  jest.clearAllMocks(); // Reset all mocks after each test
});

afterAll(() => {
  if (server) server.close(); // Close the server after all tests
});

describe('Timeslot Controller Endpoints', () => {
  describe('POST /api/timeslots', () => {
    it('should create a new timeslot by doctor', async () => {
      const timeslotData = {
        doctor_id: mockDoctor.doctor_id,
        date: '2024-12-20',
        start_time: '10:00',
        end_time: '11:00',
        status: 'available',
      };

      const res = await request(app)
        .post('/api/timeslots')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(timeslotData);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('timeslot_id', 1);
      expect(res.body).toMatchObject(timeslotData);
      expect(Timeslot.create).toHaveBeenCalledWith(timeslotData);
    });

    it('should not allow unauthorized users to create timeslots', async () => {
      const unauthorizedUserToken = jwt.sign(
        { user_id: 3, role: 'customer' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const timeslotData = {
        doctor_id: mockDoctor.doctor_id,
        date: '2024-12-22',
        start_time: '14:00',
        end_time: '15:00',
        status: 'available',
      };

      const res = await request(app)
        .post('/api/timeslots')
        .set('Authorization', `Bearer ${unauthorizedUserToken}`)
        .send(timeslotData);

      expect(res.statusCode).toEqual(403);
      expect(res.body).toHaveProperty('message', 'Forbidden: Access is denied.');
    });
  });

  describe('GET /api/timeslots', () => {
    it('should fetch all timeslots', async () => {
      const res = await request(app)
        .get('/api/timeslots')
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual([mockTimeslot]);
      expect(Timeslot.findAll).toHaveBeenCalledWith({ where: { doctor_id: mockDoctor.doctor_id } });
    });
  });

  describe('PUT /api/timeslots/:id', () => {
    it('should update a timeslot status', async () => {
      const updatedData = { status: 'unavailable' };

      const res = await request(app)
        .put(`/api/timeslots/${mockTimeslot.timeslot_id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(updatedData);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'unavailable');
      expect(Timeslot.update).toHaveBeenCalledWith(
        updatedData,
        { where: { timeslot_id: mockTimeslot.timeslot_id } }
      );
    });
  });

  describe('DELETE /api/timeslots/:id', () => {
    it('should delete a timeslot by doctor', async () => {
      const res = await request(app)
        .delete(`/api/timeslots/${mockTimeslot.timeslot_id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Timeslot deleted successfully');
      expect(Timeslot.destroy).toHaveBeenCalledWith({ where: { timeslot_id: mockTimeslot.timeslot_id } });
    });

    it('should not delete a timeslot with existing appointment', async () => {
      Appointment.findOne.mockResolvedValueOnce({ appointment_id: 1 });

      const res = await request(app)
        .delete(`/api/timeslots/${mockTimeslot.timeslot_id}`)
        .set('Authorization', `Bearer ${doctorToken}`);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'Cannot delete timeslot with existing appointment');
    });
  });
});
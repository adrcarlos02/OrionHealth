import request from 'supertest';
import { app, server } from '../index.js';
import { Appointment, Timeslot, User } from '../models/index.js';
import jwt from 'jsonwebtoken';
import { mockCustomer, mockTimeslot, mockAppointment } from './mockData.js';

jest.mock('../models/index.js');

let customerToken;

beforeAll(() => {
  // Ensure JWT_SECRET is set for tests
  process.env.JWT_SECRET = 'ORIONHEALTH11';

  // Generate JWT token for the customer
  customerToken = jwt.sign(
    { user_id: mockCustomer.user_id, role: mockCustomer.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Mock model behavior
  User.findByPk.mockResolvedValue(mockCustomer);
  Timeslot.findByPk.mockResolvedValue(mockTimeslot);
  Appointment.create.mockImplementation((data) =>
    Promise.resolve({ ...data, appointment_id: 1 })
  );
  Appointment.findByPk.mockImplementation((id) =>
    id === mockAppointment.appointment_id ? Promise.resolve(mockAppointment) : null
  );
  Appointment.findAll.mockResolvedValue([mockAppointment]);
  Appointment.update.mockResolvedValue([1]); // Mock successful update
  Appointment.destroy.mockResolvedValue(1); // Mock successful delete
});

describe('Appointment Endpoints', () => {
  it('should create an appointment', async () => {
    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        timeslot_id: mockTimeslot.timeslot_id,
        notes: 'Check-up appointment',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('appointment_id');
    expect(res.body).toMatchObject({
      timeslot_id: mockTimeslot.timeslot_id,
      customer_id: mockCustomer.user_id,
      status: 'confirmed',
      notes: 'Check-up appointment',
    });

    expect(Timeslot.update).toHaveBeenCalledWith(
      { status: 'booked' },
      { where: { timeslot_id: mockTimeslot.timeslot_id } }
    );
  });

  it('should not create an appointment for an unavailable timeslot', async () => {
    Timeslot.findByPk.mockResolvedValueOnce({
      ...mockTimeslot,
      status: 'booked',
    });

    const res = await request(app)
      .post('/api/appointments')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        timeslot_id: mockTimeslot.timeslot_id,
        notes: 'Follow-up appointment',
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'Timeslot is not available');
  });

  it('should fetch all appointments for the customer', async () => {
    const res = await request(app)
      .get('/api/appointments')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('appointment_id');
  });

  it('should fetch a single appointment by ID', async () => {
    const res = await request(app)
      .get(`/api/appointments/${mockAppointment.appointment_id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('appointment_id', mockAppointment.appointment_id);
    expect(res.body).toHaveProperty('notes', 'Check-up appointment');
  });

  it('should return 404 if fetching a non-existent appointment', async () => {
    Appointment.findByPk.mockResolvedValueOnce(null);

    const res = await request(app)
      .get('/api/appointments/999')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Appointment not found');
  });

  it('should update an appointment', async () => {
    const res = await request(app)
      .put(`/api/appointments/${mockAppointment.appointment_id}`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        notes: 'Updated appointment notes',
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('notes', 'Updated appointment notes');
    expect(Appointment.update).toHaveBeenCalledWith(
      { notes: 'Updated appointment notes' },
      { where: { appointment_id: mockAppointment.appointment_id } }
    );
  });

  it('should return 404 when updating a non-existent appointment', async () => {
    Appointment.findByPk.mockResolvedValueOnce(null);

    const res = await request(app)
      .put('/api/appointments/999')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        notes: 'Updated appointment notes',
      });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Appointment not found');
  });

  it('should delete an appointment', async () => {
    const res = await request(app)
      .delete(`/api/appointments/${mockAppointment.appointment_id}`)
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Appointment deleted successfully');
    expect(Appointment.destroy).toHaveBeenCalledWith({
      where: { appointment_id: mockAppointment.appointment_id },
    });
  });

  it('should return 404 when deleting a non-existent appointment', async () => {
    Appointment.findByPk.mockResolvedValueOnce(null);

    const res = await request(app)
      .delete('/api/appointments/999')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Appointment not found');
  });
});

afterAll(() => {
  if (server) server.close(); // Stop the server after tests
});
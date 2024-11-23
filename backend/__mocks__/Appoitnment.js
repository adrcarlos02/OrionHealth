// __mocks__/Appointment.js
const Appointment = {
  create: jest.fn((data) => ({
    ...data,
    appointment_id: Math.floor(Math.random() * 1000),
  })),
  findAll: jest.fn(() => [
    {
      appointment_id: 1,
      customer_id: 1,
      timeslot_id: 1,
      status: 'confirmed',
      notes: 'Follow-up checkup',
    },
  ]),
  findByPk: jest.fn((id) => {
    if (id === 1) {
      return {
        appointment_id: 1,
        customer_id: 1,
        timeslot_id: 1,
        status: 'confirmed',
        notes: 'Follow-up checkup',
      };
    }
    return null;
  }),
  destroy: jest.fn((condition) => {
    if (condition.where.appointment_id === 1) {
      return 1; // Simulate successful deletion
    }
    return 0; // Simulate failure
  }),
};

export default Appointment;
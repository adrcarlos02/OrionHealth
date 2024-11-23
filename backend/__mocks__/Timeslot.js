// __mocks__/Timeslot.js
const Timeslot = {
  create: jest.fn((data) => ({
    ...data,
    timeslot_id: Math.floor(Math.random() * 1000),
  })),
  findAll: jest.fn(() => [
    {
      timeslot_id: 1,
      doctor_id: 1,
      date: '2024-12-15',
      start_time: '09:00',
      end_time: '10:00',
      status: 'available',
    },
    {
      timeslot_id: 2,
      doctor_id: 1,
      date: '2024-12-16',
      start_time: '11:00',
      end_time: '12:00',
      status: 'booked',
    },
  ]),
  findByPk: jest.fn((id) => {
    if (id === 1) {
      return {
        timeslot_id: 1,
        doctor_id: 1,
        date: '2024-12-15',
        start_time: '09:00',
        end_time: '10:00',
        status: 'available',
      };
    }
    return null;
  }),
  destroy: jest.fn((condition) => {
    if (condition.where.timeslot_id === 1) {
      return 1; // Simulate successful deletion
    }
    return 0; // Simulate failure
  }),
};

export default Timeslot;
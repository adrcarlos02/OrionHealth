// __mocks__/Doctor.js
const Doctor = {
  findOne: jest.fn((condition) => {
    if (condition.where.user_id === 1) {
      return {
        doctor_id: 1,
        user_id: 1,
        specialty: 'Cardiology',
      };
    }
    return null;
  }),
  findByPk: jest.fn((id) => {
    if (id === 1) {
      return {
        doctor_id: 1,
        user_id: 1,
        specialty: 'Cardiology',
        degree: 'MD',
        experience: 5,
        fees: 200.0,
        address_line1: '123 Elm Street',
        city: 'Metropolis',
        state: 'NY',
        postal_code: '10001',
      };
    }
    return null;
  }),
  create: jest.fn((data) => ({
    ...data,
    doctor_id: Math.floor(Math.random() * 1000),
  })),
};

export default Doctor;
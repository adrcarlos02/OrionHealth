// __mocks__/User.js
const User = {
  findOne: jest.fn((condition) => {
    if (condition.where.email === 'test@example.com') {
      return {
        user_id: 1,
        email: 'test@example.com',
        password_hash: 'password123',
        role: 'customer',
      };
    }
    return null;
  }),
  findByPk: jest.fn((id) => {
    if (id === 1) {
      return {
        user_id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'customer',
      };
    }
    return null;
  }),
  create: jest.fn((data) => ({
    ...data,
    user_id: Math.floor(Math.random() * 1000),
  })),
  destroy: jest.fn((condition) => {
    if (condition.where.user_id === 1) {
      return 1; // Simulate successful deletion
    }
    return 0; // Simulate failure
  }),
};

export default User;
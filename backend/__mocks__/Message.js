// __mocks__/Message.js
const Message = {
  create: jest.fn((data) => ({
    ...data,
    message_id: Math.floor(Math.random() * 1000),
  })),
  findAll: jest.fn(() => [
    {
      message_id: 1,
      sender_id: 1,
      receiver_id: 2,
      content: 'Hello!',
      is_read: false,
    },
  ]),
  findByPk: jest.fn((id) => {
    if (id === 1) {
      return {
        message_id: 1,
        sender_id: 1,
        receiver_id: 2,
        content: 'Hello!',
        is_read: false,
      };
    }
    return null;
  }),
  destroy: jest.fn((condition) => {
    if (condition.where.message_id === 1) {
      return 1; // Simulate successful deletion
    }
    return 0; // Simulate failure
  }),
};

export default Message;
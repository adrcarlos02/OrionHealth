// services/messageService.js

import { Message, User } from '../models/index.js';
import { Op } from 'sequelize';

/**
 * Sends a message from one user to another.
 * @param {Object} sender - The sender (user object).
 * @param {Object} messageData - The message content and receiver details.
 * @returns {Object} - The created message.
 * @throws {Object} - Error with status and message.
 */
export const sendMessage = async (sender, messageData) => {
  const { receiver_id, content } = messageData;

  // Check if receiver exists
  const receiver = await User.findByPk(receiver_id);
  if (!receiver) {
    throw { status: 404, message: 'Receiver not found' };
  }

  // Create and return the message
  return await Message.create({
    sender_id: sender.user_id,
    receiver_id,
    content,
  });
};

/**
 * Fetches all messages for a user (or all for admins).
 * @param {Object} user - The authenticated user.
 * @returns {Array} - List of messages.
 */
export const getAllMessages = async (user) => {
  let whereClause = {};

  if (user.role !== 'admin') {
    whereClause = {
      [Op.or]: [
        { sender_id: user.user_id },
        { receiver_id: user.user_id },
      ],
    };
  }

  return await Message.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['name', 'email'],
      },
      {
        model: User,
        as: 'Receiver',
        attributes: ['name', 'email'],
      },
    ],
    order: [['timestamp', 'DESC']],
  });
};

/**
 * Fetches a single message by its ID.
 * @param {number} id - The message ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - The fetched message.
 * @throws {Object} - Error with status and message if access is denied or not found.
 */
export const getMessageById = async (id, user) => {
  const message = await Message.findByPk(id, {
    include: [
      {
        model: User,
        as: 'Sender',
        attributes: ['name', 'email'],
      },
      {
        model: User,
        as: 'Receiver',
        attributes: ['name', 'email'],
      },
    ],
  });

  if (!message) {
    throw { status: 404, message: 'Message not found' };
  }

  // Access control
  if (
    user.role !== 'admin' &&
    user.user_id !== message.sender_id &&
    user.user_id !== message.receiver_id
  ) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  return message;
};

/**
 * Marks a message as read.
 * @param {number} id - The message ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - The updated message.
 * @throws {Object} - Error with status and message if access is denied or not found.
 */
export const markMessageAsRead = async (id, user) => {
  const message = await Message.findByPk(id);

  if (!message) {
    throw { status: 404, message: 'Message not found' };
  }

  // Access control
  if (user.role !== 'admin' && user.user_id !== message.receiver_id) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  // Update and return the message
  await message.update({ is_read: true });
  return { message: 'Message marked as read', is_read: true };
};

/**
 * Deletes a message.
 * @param {number} id - The message ID.
 * @param {Object} user - The authenticated user.
 * @returns {Object} - Success message.
 * @throws {Object} - Error with status and message if access is denied or not found.
 */
export const deleteMessage = async (id, user) => {
  const message = await Message.findByPk(id);

  if (!message) {
    throw { status: 404, message: 'Message not found' };
  }

  // Access control
  if (
    user.role !== 'admin' &&
    user.user_id !== message.sender_id &&
    user.user_id !== message.receiver_id
  ) {
    throw { status: 403, message: 'Forbidden: Access is denied.' };
  }

  await message.destroy();
  return { message: 'Message deleted successfully' };
};
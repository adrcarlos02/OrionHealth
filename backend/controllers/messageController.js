// controllers/messageController.js

import { Message, User } from '../models/index.js';
import { validationResult } from 'express-validator';

/**
 * Send a message from one user to another.
 * Accessible by authenticated users.
 */
export const sendMessage = async (req, res) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { receiver_id, content } = req.body;

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create message
    const message = await Message.create({
      sender_id: req.user.user_id,
      receiver_id,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(`Send Message Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while sending message' });
  }
};

/**
 * Get all messages for the authenticated user.
 * Accessible by authenticated users.
 * Admins can view all messages.
 */
export const getAllMessages = async (req, res) => {
  try {
    let whereClause = {};

    if (req.user.role !== 'admin') {
      whereClause = {
        [Op.or]: [
          { sender_id: req.user.user_id },
          { receiver_id: req.user.user_id },
        ],
      };
    }

    const messages = await Message.findAll({
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

    res.json(messages);
  } catch (error) {
    console.error(`Get All Messages Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching messages' });
  }
};

/**
 * Get a single message by ID.
 * Accessible by admins, sender, or receiver.
 */
export const getMessageById = async (req, res) => {
  try {
    const { id } = req.params; // message_id
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
      return res.status(404).json({ message: 'Message not found' });
    }

    // Access control
    if (
      req.user.role !== 'admin' &&
      req.user.user_id !== message.sender_id &&
      req.user.user_id !== message.receiver_id
    ) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    res.json(message);
  } catch (error) {
    console.error(`Get Message By ID Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while fetching message' });
  }
};

/**
 * Mark a message as read.
 * Accessible by the receiver or admins.
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params; // message_id
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Access control
    if (req.user.role !== 'admin' && req.user.user_id !== message.receiver_id) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    // Update is_read status
    await message.update({ is_read: true });

    res.json({ message: 'Message marked as read', is_read: true });
  } catch (error) {
    console.error(`Mark Message As Read Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while updating message' });
  }
};

/**
 * Delete a message.
 * Accessible by admins, sender, or receiver.
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params; // message_id
    const message = await Message.findByPk(id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Access control
    if (
      req.user.role !== 'admin' &&
      req.user.user_id !== message.sender_id &&
      req.user.user_id !== message.receiver_id
    ) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }

    await message.destroy();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error(`Delete Message Error: ${error.message}`);
    res.status(500).json({ message: 'Server error while deleting message' });
  }
};
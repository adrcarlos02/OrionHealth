// controllers/messageController.js

import * as messageService from '../services/messageService.js';
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

    const message = await messageService.sendMessage(req.user, req.body);
    res.status(201).json(message);
  } catch (error) {
    console.error(`Send Message Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while sending message' });
    }
  }
};

/**
 * Get all messages for the authenticated user.
 * Accessible by authenticated users.
 * Admins can view all messages.
 */
export const getAllMessages = async (req, res) => {
  try {
    const messages = await messageService.getAllMessages(req.user);
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
    const { id } = req.params;
    const message = await messageService.getMessageById(id, req.user);
    res.json(message);
  } catch (error) {
    console.error(`Get Message By ID Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while fetching message' });
    }
  }
};

/**
 * Mark a message as read.
 * Accessible by the receiver or admins.
 */
export const markMessageAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await messageService.markMessageAsRead(id, req.user);
    res.json(result);
  } catch (error) {
    console.error(`Mark Message As Read Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while updating message' });
    }
  }
};

/**
 * Delete a message.
 * Accessible by admins, sender, or receiver.
 */
export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await messageService.deleteMessage(id, req.user);
    res.json(result);
  } catch (error) {
    console.error(`Delete Message Error: ${error.message}`);
    if (error.status) {
      res.status(error.status).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Server error while deleting message' });
    }
  }
};
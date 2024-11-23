// controllers/userController.js

import { User } from '../models/index.js';

/**
 * Retrieves the profile of the logged-in user.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.user_id, {
      attributes: { exclude: ['password_hash'] },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error(`Get User Profile Error: ${error.message}`);
    res.status(500).send('Server error');
  }
};

// Additional user-related controllers can be added here
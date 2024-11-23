// routes/userRoutes.js

import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/users/me
 * @desc    Get current user's profile
 * @access  Private
 */
router.get('/me', authenticateToken, getUserProfile);

// Additional user routes can be added here

export default router;
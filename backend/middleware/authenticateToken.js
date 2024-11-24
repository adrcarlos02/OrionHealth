// middleware/authenticateToken.js

import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT tokens.
 */
export default function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token is missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user info to request object
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
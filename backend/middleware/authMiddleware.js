// middleware/authMiddleware.js

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Middleware to authenticate JWT tokens.
 * Verifies the token and attaches the decoded user to req.user.
 */
export const authenticateToken = async (req, res, next) => {
  try {
    // Retrieve the Authorization header
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      // If Authorization header is missing
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    // The token should be in the format 'Bearer TOKEN'
    const tokenParts = authHeader.split(' ');

    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      // If token format is invalid
      return res.status(401).json({ message: 'Invalid authorization format. Format should be: Bearer <token>' });
    }

    const token = tokenParts[1];

    if (!token) {
      // If token is missing after 'Bearer'
      return res.status(401).json({ message: 'Access token missing' });
    }

    // Verify the token asynchronously
    const decoded = await verifyToken(token);

    if (!decoded) {
      // If token verification failed
      return res.status(403).json({ message: 'Invalid or expired token' });
    }

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    console.error(`Authentication Error: ${error.message}`);
    res.status(500).json({ message: 'Server error during authentication' });
  }
};

/**
 * Helper function to verify JWT tokens using Promises.
 * @param {string} token - JWT token to verify.
 * @returns {Promise<Object|null>} - Decoded token payload or null if invalid.
 */
const verifyToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Log the specific error for debugging purposes
        console.error(`JWT Verification Failed: ${err.message}`);
        return resolve(null);
      }
      resolve(decoded);
    });
  });
};

/**
 * Middleware to authorize user roles.
 * Restricts access to routes based on user roles.
 * @param  {...string} roles - Allowed roles for the route.
 */
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    try {
      // Ensure that req.user is populated by authenticateToken middleware
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Forbidden: User role not found.' });
      }

      // Check if the user's role is among the allowed roles
      if (!roles.includes(req.user.role)) {
        console.warn(`Unauthorized Access Attempt by User ID: ${req.user.user_id} with Role: ${req.user.role}`);
        return res.status(403).json({ message: `Forbidden: Requires one of the following roles: ${roles.join(', ')}` });
      }

      // User is authorized; proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(`Authorization Error: ${error.message}`);
      res.status(500).json({ message: 'Server error during authorization' });
    }
  };
};
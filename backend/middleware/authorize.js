// middleware/authorize.js

/**
 * Middleware to authorize users based on their roles.
 * @param  {...string} allowedRoles - The roles allowed to access the route.
 * @returns {Function} - Middleware function.
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access is denied.' });
    }
    next();
  };
};
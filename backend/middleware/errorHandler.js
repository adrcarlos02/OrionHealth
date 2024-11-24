// middleware/errorHandler.js

/**
 * Global error-handling middleware.
 */
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  if (err.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({ message: 'An unexpected error occurred' });
  }
};
// index.js

import 'dotenv/config'; // Load environment variables from .env
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import xss from 'xss-clean';
import sequelize from './config/database.js'; // Sequelize instance

// Import route files
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import timeslotRoutes from './routes/timeslotRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import messageRoutes from './routes/messageRoutes.js';

// Import middleware
import authenticateToken from './middleware/authenticateToken.js';
import { authorizeRoles } from './middleware/authorize.js'; // Named import
import { errorHandler } from './middleware/errorHandler.js'; // Named import

const app = express();

// =====================
// Global Middleware
// =====================

// Enable CORS with default settings
app.use(cors());

// Set security-related HTTP headers
app.use(helmet());

// HTTP request logging with Morgan
app.use(morgan('dev')); // Use 'combined' in production

// Parse incoming JSON requests
app.use(express.json());

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({ extended: true }));

// Rate Limiting to prevent brute-force attacks and abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use(limiter);

// Input Sanitization to prevent XSS attacks
app.use(xss());

// =====================
// Routes
// =====================

// Public Routes
app.use('/api/auth', authRoutes);

// Protected Routes
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/doctors', authenticateToken, doctorRoutes);
app.use('/api/timeslots', authenticateToken, timeslotRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/messages', authenticateToken, messageRoutes);

// =====================
// Root Route
// =====================
app.get('/', (req, res) => {
  res.send('API is running...');
});

// =====================
// Example Protected Routes
// =====================

// Route accessible by any authenticated user
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

// Route accessible only by admins
app.get('/api/admin', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin!' });
});

// =====================
// Error-Handling Middleware
// =====================

// 404 Not Found Handler
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

// =====================
// Database Synchronization and Server Start
// =====================
const PORT = process.env.PORT || 5005;
const isTestEnv = process.env.NODE_ENV === 'test';

let server; // Declare server variable to hold the server instance

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return sequelize.sync({ alter: !isTestEnv }); // Disable schema alterations in tests
  })
  .then(() => {
    console.log('Database & tables synchronized!');
    if (!isTestEnv) {
      server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
    process.exit(1); // Exit the process with failure
  });

export { app, server }; // Export both app and server for testing purposes
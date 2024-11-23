// config/database.js

import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME, // Database name
  process.env.DB_USER, // Username
  process.env.DB_PASSWORD, // Password
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable logging; set to true for debugging
  }
);

export default sequelize;
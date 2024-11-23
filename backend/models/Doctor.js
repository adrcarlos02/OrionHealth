// models/Doctor.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import User from './User.js';

const Doctor = sequelize.define(
  'Doctor',
  {
    doctor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: User,
        key: 'user_id',
      },
    },
    specialty: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    degree: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    about: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    fees: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: false,
    },
    address_line1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address_line2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    profile_image_url: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: 'Doctors',
    timestamps: true,
  }
);

export default Doctor;
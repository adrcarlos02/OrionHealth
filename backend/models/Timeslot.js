// models/Timeslot.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Doctor from './Doctor.js';

const Timeslot = sequelize.define(
  'Timeslot',
  {
    timeslot_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Doctor,
        key: 'doctor_id',
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'booked', 'unavailable'),
      allowNull: false,
    },
  },
  {
    tableName: 'Timeslots',
    timestamps: true,
  }
);

export default Timeslot;
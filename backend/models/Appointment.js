// models/Appointment.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import Timeslot from './Timeslot.js';
import User from './User.js';

const Appointment = sequelize.define(
  'Appointment',
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    timeslot_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false,
      references: {
        model: Timeslot,
        key: 'timeslot_id',
      },
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'user_id',
      },
    },
    booking_date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'canceled'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: 'Appointments',
    timestamps: true,
  }
);

export default Appointment;
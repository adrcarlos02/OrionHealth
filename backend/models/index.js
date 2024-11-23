// models/index.js

import User from './User.js';
import Doctor from './Doctor.js';
import Timeslot from './Timeslot.js';
import Appointment from './Appointment.js';
import Message from './Message.js';

// Users and Doctors (One-to-One)
User.hasOne(Doctor, { foreignKey: 'user_id' });
Doctor.belongsTo(User, { foreignKey: 'user_id' });

// Doctors and Timeslots (One-to-Many)
Doctor.hasMany(Timeslot, { foreignKey: 'doctor_id' });
Timeslot.belongsTo(Doctor, { foreignKey: 'doctor_id' });

// Timeslots and Appointments (One-to-One)
Timeslot.hasOne(Appointment, { foreignKey: 'timeslot_id' });
Appointment.belongsTo(Timeslot, { foreignKey: 'timeslot_id' });

// Users (Customers) and Appointments (One-to-Many)
User.hasMany(Appointment, { foreignKey: 'customer_id' });
Appointment.belongsTo(User, { foreignKey: 'customer_id' });

// Users and Messages (Many-to-Many through Messages)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'SentMessages' });
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'ReceivedMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'Receiver' });

export { User, Doctor, Timeslot, Appointment, Message };
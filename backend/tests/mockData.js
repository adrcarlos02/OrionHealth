export const mockCustomer = {
  user_id: 1,
  name: 'Test Customer',
  email: 'customer@example.com',
  password_hash: 'hashed_customer_password',
  role: 'customer',
};

export const mockDoctor = {
  user_id: 2,
  name: 'Test Doctor',
  email: 'doctor@example.com',
  password_hash: 'hashed_doctor_password',
  role: 'doctor',
};

export const mockAdmin = {
  user_id: 3,
  name: 'Test Admin',
  email: 'admin@example.com',
  password_hash: 'hashed_admin_password',
  role: 'admin',
};

export const mockDoctorProfile = {
  doctor_id: 1,
  user_id: mockDoctor.user_id,
  specialty: 'Cardiology',
  degree: 'MD',
  experience: 10,
  fees: 200,
  address_line1: '123 Health St',
  city: 'Medcity',
  state: 'Healthstate',
  postal_code: '12345',
};

export const mockTimeslot = {
  timeslot_id: 1,
  doctor_id: mockDoctorProfile.doctor_id,
  date: '2024-12-01',
  start_time: '10:00',
  end_time: '11:00',
  status: 'available',
};

export const mockAppointment = {
  appointment_id: 1,
  timeslot_id: mockTimeslot.timeslot_id,
  customer_id: mockCustomer.user_id,
  status: 'confirmed',
  notes: 'Check-up appointment',
};

export const mockMessage = {
  message_id: 1,
  sender_id: mockCustomer.user_id,
  receiver_id: mockDoctor.user_id,
  content: 'Hello Doctor!',
  is_read: false,
};
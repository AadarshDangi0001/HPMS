require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Bed = require('../models/Bed');
const Bill = require('../models/Bill');
const Counter = require('../models/Counter');
const generateId = require('../utils/generateId');

const CLEAR_ONLY = process.argv.includes('--clear');

async function clearDemoCollections() {
  console.warn('WARNING: Clearing existing Patient, Doctor, Appointment, Bed, Bill and Counter collections...');
  await Promise.all([
    Patient.deleteMany({}),
    Doctor.deleteMany({}),
    Appointment.deleteMany({}),
    Bed.deleteMany({}),
    Bill.deleteMany({}),
    Counter.deleteMany({}),
  ]);
  console.log('Demo collections cleared.');
}

function futureDate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
}

async function seed() {
  await connectDB();
  await clearDemoCollections();

  if (CLEAR_ONLY) {
    console.log('Database is now empty (--clear only). Skipping sample data insertion.');
    await mongoose.disconnect();
    return;
  }

  // Doctors
  const doctorDefs = [
    { name: 'Dr. Aditi Sharma', specialization: 'Cardiologist', department: 'Cardiology', phone: '9876500001', consultationStart: '09:00', consultationEnd: '13:00' },
    { name: 'Dr. Rohan Mehta', specialization: 'Orthopedic Surgeon', department: 'Orthopedics', phone: '9876500002', consultationStart: '10:00', consultationEnd: '14:00' },
    { name: 'Dr. Priya Nair', specialization: 'Pediatrician', department: 'Pediatrics', phone: '9876500003', consultationStart: '09:30', consultationEnd: '12:30' },
    { name: 'Dr. Karan Verma', specialization: 'Dermatologist', department: 'Dermatology', phone: '9876500004', consultationStart: '11:00', consultationEnd: '15:00' },
    { name: 'Dr. Sneha Iyer', specialization: 'General Physician', department: 'General Medicine', phone: '9876500005', consultationStart: '08:00', consultationEnd: '12:00' },
  ];

  const doctors = [];
  for (const def of doctorDefs) {
    const doctorId = await generateId('doctor');
    doctors.push(await Doctor.create({ ...def, doctorId, isAvailable: true }));
  }

  // Patients
  const patientDefs = [
    { name: 'Rajesh Kumar', age: 45, gender: 'Male', phone: '9123456001', email: 'rajesh.kumar@example.com', bloodGroup: 'O+', symptoms: 'Chest pain and shortness of breath' },
    { name: 'Anita Desai', age: 32, gender: 'Female', phone: '9123456002', email: 'anita.desai@example.com', bloodGroup: 'A+', symptoms: 'Persistent headache' },
    { name: 'Vikram Singh', age: 58, gender: 'Male', phone: '9123456003', bloodGroup: 'B+', symptoms: 'Knee pain while walking' },
    { name: 'Meera Pillai', age: 8, gender: 'Female', phone: '9123456004', email: 'meera.parent@example.com', bloodGroup: 'AB+', symptoms: 'Fever and cold' },
    { name: 'Suresh Reddy', age: 50, gender: 'Male', phone: '9123456005', bloodGroup: 'O-', symptoms: 'Skin rash on arms' },
    { name: 'Kavita Joshi', age: 29, gender: 'Female', phone: '9123456006', email: 'kavita.joshi@example.com', bloodGroup: 'A-', symptoms: 'Routine checkup' },
    { name: 'Arjun Nambiar', age: 36, gender: 'Male', phone: '9123456007', bloodGroup: 'B-', symptoms: 'Lower back pain' },
    { name: 'Priyanka Rao', age: 41, gender: 'Female', phone: '9123456008', email: 'priyanka.rao@example.com', bloodGroup: 'O+', symptoms: 'Seasonal allergies' },
  ];

  const patients = [];
  for (const def of patientDefs) {
    const patientId = await generateId('patient');
    patients.push(await Patient.create({ ...def, patientId }));
  }

  // Beds: 12 across a few wards
  const bedDefs = [
    { bedNumber: 'G-101', wardName: 'General Ward A', wardType: 'General', status: 'Available' },
    { bedNumber: 'G-102', wardName: 'General Ward A', wardType: 'General', status: 'Occupied' },
    { bedNumber: 'G-103', wardName: 'General Ward A', wardType: 'General', status: 'Available' },
    { bedNumber: 'G-104', wardName: 'General Ward A', wardType: 'General', status: 'Maintenance' },
    { bedNumber: 'P-201', wardName: 'Private Ward B', wardType: 'Private', status: 'Available' },
    { bedNumber: 'P-202', wardName: 'Private Ward B', wardType: 'Private', status: 'Occupied' },
    { bedNumber: 'P-203', wardName: 'Private Ward B', wardType: 'Private', status: 'Available' },
    { bedNumber: 'ICU-301', wardName: 'ICU', wardType: 'ICU', status: 'Occupied' },
    { bedNumber: 'ICU-302', wardName: 'ICU', wardType: 'ICU', status: 'Available' },
    { bedNumber: 'ICU-303', wardName: 'ICU', wardType: 'ICU', status: 'Maintenance' },
    { bedNumber: 'PED-401', wardName: 'Pediatric Ward', wardType: 'Pediatric', status: 'Available' },
    { bedNumber: 'PED-402', wardName: 'Pediatric Ward', wardType: 'Pediatric', status: 'Occupied' },
  ];

  const beds = [];
  for (const def of bedDefs) {
    beds.push(await Bed.create(def));
  }

  // Assign patients to occupied beds for demo realism
  const occupiedBeds = beds.filter((b) => b.status === 'Occupied');
  for (let i = 0; i < occupiedBeds.length && i < patients.length; i++) {
    occupiedBeds[i].patient = patients[i]._id;
    await occupiedBeds[i].save();
  }

  // Appointments: mix of statuses across future and past dates
  const appointmentDefs = [
    { patient: patients[0], doctor: doctors[0], date: futureDate(1), time: '09:30', reason: 'Follow-up on chest pain', status: 'Confirmed' },
    { patient: patients[1], doctor: doctors[4], date: futureDate(2), time: '08:30', reason: 'Headache evaluation', status: 'Confirmed' },
    { patient: patients[2], doctor: doctors[1], date: futureDate(0), time: '11:00', reason: 'Knee pain consultation', status: 'Pending' },
    { patient: patients[3], doctor: doctors[2], date: futureDate(-3), time: '10:00', reason: 'Fever checkup', status: 'Completed' },
    { patient: patients[4], doctor: doctors[3], date: futureDate(-1), time: '12:00', reason: 'Skin rash review', status: 'Cancelled' },
    { patient: patients[5], doctor: doctors[4], date: futureDate(3), time: '09:00', reason: 'Routine checkup', status: 'Confirmed' },
  ];

  for (const def of appointmentDefs) {
    const appointmentId = await generateId('appointment');
    await Appointment.create({
      appointmentId,
      patient: def.patient._id,
      doctor: def.doctor._id,
      department: def.doctor.department,
      date: def.date,
      time: def.time,
      reason: def.reason,
      status: def.status,
    });
  }

  // Bills
  const billDefs = [
    { patient: patients[0], consultationCharges: 800, roomCharges: 0, laboratoryCharges: 1500, medicationCharges: 600, paymentStatus: 'Paid' },
    { patient: patients[2], consultationCharges: 1000, roomCharges: 3000, laboratoryCharges: 2200, medicationCharges: 900, paymentStatus: 'Unpaid' },
    { patient: patients[3], consultationCharges: 500, roomCharges: 0, laboratoryCharges: 300, medicationCharges: 250, paymentStatus: 'Paid' },
  ];

  for (const def of billDefs) {
    const billId = await generateId('bill');
    const totalAmount = def.consultationCharges + def.roomCharges + def.laboratoryCharges + def.medicationCharges;
    await Bill.create({
      billId,
      patient: def.patient._id,
      consultationCharges: def.consultationCharges,
      roomCharges: def.roomCharges,
      laboratoryCharges: def.laboratoryCharges,
      medicationCharges: def.medicationCharges,
      totalAmount,
      paymentStatus: def.paymentStatus,
    });
  }

  console.log('Seed complete:');
  console.log(`  Doctors: ${doctors.length}`);
  console.log(`  Patients: ${patients.length}`);
  console.log(`  Beds: ${beds.length}`);
  console.log(`  Appointments: ${appointmentDefs.length}`);
  console.log(`  Bills: ${billDefs.length}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

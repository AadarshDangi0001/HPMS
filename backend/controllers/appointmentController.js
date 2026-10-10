const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const generateId = require('../utils/generateId');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/appointments
exports.createAppointment = asyncHandler(async (req, res) => {
  const { patient, doctor, department, date, time, reason } = req.body;

  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) {
    throw new AppError('Patient not found', 404);
  }

  const doctorDoc = await Doctor.findById(doctor);
  if (!doctorDoc) {
    throw new AppError('Doctor not found', 404);
  }

  if (!doctorDoc.isAvailable) {
    throw new AppError('Selected doctor is currently unavailable', 409);
  }

  const appointmentDateTime = new Date(`${date}T${time}:00`);
  if (Number.isNaN(appointmentDateTime.getTime())) {
    throw new AppError('Invalid date or time format', 400);
  }
  if (appointmentDateTime.getTime() < Date.now()) {
    throw new AppError('Cannot book an appointment in the past', 400);
  }

  const existing = await Appointment.findOne({ doctor, date, time, status: 'Confirmed' });
  if (existing) {
    throw new AppError('This doctor is already booked for the selected date and time', 409);
  }

  const appointmentId = await generateId('appointment');

  let appointment;
  try {
    appointment = await Appointment.create({
      appointmentId,
      patient,
      doctor,
      department,
      date,
      time,
      reason,
      status: 'Confirmed',
    });
  } catch (err) {
    // Safety net against race conditions on the partial unique index.
    if (err.code === 11000) {
      throw new AppError('This doctor is already booked for the selected date and time', 409);
    }
    throw err;
  }

  await appointment.populate(['patient', 'doctor']);

  res.status(201).json({
    success: true,
    message: 'Appointment confirmed successfully',
    data: appointment,
  });
});

// GET /api/appointments?status=
exports.getAppointments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status && status !== 'All') {
    filter.status = status;
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name patientId phone')
    .populate('doctor', 'name department specialization')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: appointments.length, data: appointments });
});

// GET /api/appointments/:id
exports.getAppointmentById = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor');
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }
  res.json({ success: true, data: appointment });
});

// PATCH /api/appointments/:id/status
exports.updateAppointmentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['Cancelled', 'Completed', 'Confirmed', 'Pending'];

  if (!allowed.includes(status)) {
    throw new AppError('Invalid status value', 400);
  }

  const appointment = await Appointment.findById(req.params.id);
  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
    throw new AppError(`Cannot change status of an appointment that is already ${appointment.status.toLowerCase()}`, 400);
  }

  appointment.status = status;
  await appointment.save();
  await appointment.populate(['patient', 'doctor']);

  res.json({ success: true, message: `Appointment marked as ${status}`, data: appointment });
});

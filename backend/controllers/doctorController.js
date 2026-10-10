const Doctor = require('../models/Doctor');
const generateId = require('../utils/generateId');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/doctors
exports.createDoctor = asyncHandler(async (req, res) => {
  const { name, specialization, department, phone, consultationStart, consultationEnd } = req.body;

  const doctorId = await generateId('doctor');

  const doctor = await Doctor.create({
    doctorId,
    name,
    specialization,
    department,
    phone,
    consultationStart,
    consultationEnd,
  });

  res.status(201).json({ success: true, message: 'Doctor added successfully', data: doctor });
});

// GET /api/doctors?activeOnly=true
exports.getDoctors = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.activeOnly === 'true') {
    filter.isAvailable = true;
  }
  const doctors = await Doctor.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: doctors.length, data: doctors });
});

// GET /api/doctors/:id
exports.getDoctorById = asyncHandler(async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }
  res.json({ success: true, data: doctor });
});

// PATCH /api/doctors/:id/availability
exports.updateAvailability = asyncHandler(async (req, res) => {
  const { isAvailable } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    throw new AppError('Doctor not found', 404);
  }

  doctor.isAvailable = isAvailable;
  await doctor.save();

  res.json({ success: true, message: 'Doctor availability updated', data: doctor });
});

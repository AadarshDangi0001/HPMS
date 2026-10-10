const Patient = require('../models/Patient');
const generateId = require('../utils/generateId');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/patients
exports.createPatient = asyncHandler(async (req, res) => {
  const { name, age, gender, phone, email, address, bloodGroup, symptoms } = req.body;

  const patientId = await generateId('patient');

  const patient = await Patient.create({
    patientId,
    name,
    age,
    gender,
    phone,
    email,
    address,
    bloodGroup,
    symptoms,
  });

  res.status(201).json({ success: true, message: 'Patient registered successfully', data: patient });
});

// GET /api/patients?search=
exports.getPatients = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { patientId: { $regex: search, $options: 'i' } },
    ];
  }

  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, count: patients.length, data: patients });
});

// GET /api/patients/:id
exports.getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) {
    throw new AppError('Patient not found', 404);
  }
  res.json({ success: true, data: patient });
});

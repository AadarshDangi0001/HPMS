const Bill = require('../models/Bill');
const Patient = require('../models/Patient');
const generateId = require('../utils/generateId');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// POST /api/bills
exports.createBill = asyncHandler(async (req, res) => {
  const { patient, consultationCharges = 0, roomCharges = 0, laboratoryCharges = 0, medicationCharges = 0 } = req.body;

  const patientDoc = await Patient.findById(patient);
  if (!patientDoc) {
    throw new AppError('Patient not found', 404);
  }

  // Total is always computed server-side, never trusted from the client.
  const totalAmount =
    Number(consultationCharges) + Number(roomCharges) + Number(laboratoryCharges) + Number(medicationCharges);

  const billId = await generateId('bill');

  const bill = await Bill.create({
    billId,
    patient,
    consultationCharges,
    roomCharges,
    laboratoryCharges,
    medicationCharges,
    totalAmount,
  });

  await bill.populate('patient', 'name patientId');

  res.status(201).json({ success: true, message: 'Bill created successfully', data: bill });
});

// GET /api/bills
exports.getBills = asyncHandler(async (req, res) => {
  const bills = await Bill.find().populate('patient', 'name patientId').sort({ createdAt: -1 });
  res.json({ success: true, count: bills.length, data: bills });
});

// GET /api/bills/:id
exports.getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('patient');
  if (!bill) {
    throw new AppError('Bill not found', 404);
  }
  res.json({ success: true, data: bill });
});

// PATCH /api/bills/:id/payment
exports.updatePaymentStatus = asyncHandler(async (req, res) => {
  const bill = await Bill.findById(req.params.id);
  if (!bill) {
    throw new AppError('Bill not found', 404);
  }

  bill.paymentStatus = 'Paid';
  await bill.save();
  await bill.populate('patient', 'name patientId');

  res.json({ success: true, message: 'Bill marked as paid', data: bill });
});

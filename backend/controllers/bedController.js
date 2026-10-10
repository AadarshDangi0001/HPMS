const Bed = require('../models/Bed');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

// GET /api/beds
exports.getBeds = asyncHandler(async (req, res) => {
  const beds = await Bed.find().populate('patient', 'name patientId').sort({ bedNumber: 1 });
  res.json({ success: true, count: beds.length, data: beds });
});

// PATCH /api/beds/:id/status
exports.updateBedStatus = asyncHandler(async (req, res) => {
  const { status, patientId } = req.body;
  const allowed = ['Available', 'Occupied', 'Maintenance'];

  if (!allowed.includes(status)) {
    throw new AppError('Invalid bed status', 400);
  }

  const bed = await Bed.findById(req.params.id);
  if (!bed) {
    throw new AppError('Bed not found', 404);
  }

  if (status === 'Occupied') {
    if (bed.status === 'Occupied') {
      throw new AppError('This bed is already occupied', 409);
    }
    if (bed.status === 'Maintenance') {
      throw new AppError('Bed under maintenance cannot be allocated', 409);
    }
    bed.patient = patientId || null;
  }

  if (status !== 'Occupied') {
    bed.patient = null;
  }

  bed.status = status;
  await bed.save();
  await bed.populate('patient', 'name patientId');

  res.json({ success: true, message: 'Bed status updated', data: bed });
});

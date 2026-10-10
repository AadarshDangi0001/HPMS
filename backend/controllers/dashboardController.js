const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Bed = require('../models/Bed');
const asyncHandler = require('../middleware/asyncHandler');

// GET /api/dashboard/stats
exports.getStats = asyncHandler(async (req, res) => {
  const [totalPatients, totalAppointments, statusCounts, bedCounts, recentAppointments] = await Promise.all([
    Patient.countDocuments(),
    Appointment.countDocuments(),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Bed.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Appointment.find()
      .populate('patient', 'name patientId')
      .populate('doctor', 'name department')
      .sort({ createdAt: -1 })
      .limit(5),
  ]);

  const appointmentStatusCounts = { Confirmed: 0, Pending: 0, Cancelled: 0, Completed: 0 };
  statusCounts.forEach((s) => {
    appointmentStatusCounts[s._id] = s.count;
  });

  const bedStatusCounts = { Available: 0, Occupied: 0, Maintenance: 0 };
  bedCounts.forEach((b) => {
    bedStatusCounts[b._id] = b.count;
  });

  res.json({
    success: true,
    data: {
      totalPatients,
      totalAppointments,
      confirmedAppointments: appointmentStatusCounts.Confirmed,
      availableBeds: bedStatusCounts.Available,
      occupiedBeds: bedStatusCounts.Occupied,
      maintenanceBeds: bedStatusCounts.Maintenance,
      appointmentStatusCounts,
      recentAppointments,
    },
  });
});

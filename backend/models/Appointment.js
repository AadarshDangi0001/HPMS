const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema(
  {
    appointmentId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    date: { type: String, required: true }, // YYYY-MM-DD
    time: { type: String, required: true }, // HH:MM (24hr)
    reason: { type: String, trim: true, maxlength: 300, default: '' },
    status: {
      type: String,
      enum: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
      default: 'Confirmed',
    },
  },
  { timestamps: true }
);

// Only one Confirmed appointment per doctor/date/time slot can exist at a time.
// A partial unique index lets cancelled slots free up without needing cleanup.
appointmentSchema.index(
  { doctor: 1, date: 1, time: 1 },
  { unique: true, partialFilterExpression: { status: 'Confirmed' } }
);

module.exports = mongoose.model('Appointment', appointmentSchema);

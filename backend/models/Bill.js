const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    billId: { type: String, required: true, unique: true },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
    consultationCharges: { type: Number, required: true, min: 0, default: 0 },
    roomCharges: { type: Number, required: true, min: 0, default: 0 },
    laboratoryCharges: { type: Number, required: true, min: 0, default: 0 },
    medicationCharges: { type: Number, required: true, min: 0, default: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    paymentStatus: { type: String, enum: ['Unpaid', 'Paid'], default: 'Unpaid' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bill', billSchema);

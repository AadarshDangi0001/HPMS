const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    doctorId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    specialization: { type: String, required: true, trim: true, maxlength: 100 },
    department: { type: String, required: true, trim: true, maxlength: 100 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    consultationStart: { type: String, required: true },
    consultationEnd: { type: String, required: true },
    isAvailable: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

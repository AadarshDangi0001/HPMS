const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    patientId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    email: { type: String, trim: true, maxlength: 100, default: '' },
    address: { type: String, trim: true, maxlength: 250, default: '' },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    symptoms: { type: String, trim: true, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);

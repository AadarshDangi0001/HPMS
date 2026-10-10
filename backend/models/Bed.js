const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    bedNumber: { type: String, required: true, unique: true, trim: true },
    wardName: { type: String, required: true, trim: true, maxlength: 100 },
    wardType: { type: String, required: true, trim: true, maxlength: 50 },
    status: {
      type: String,
      enum: ['Available', 'Occupied', 'Maintenance'],
      default: 'Available',
    },
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Bed', bedSchema);

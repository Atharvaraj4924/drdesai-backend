const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  vitals: {
    weight: {
      value: Number,
      unit: { type: String, default: 'kg' },
      date: Date
    },
    height: {
      value: Number,
      unit: { type: String, default: 'cm' },
      date: Date
    },
    heartRate: {
      value: Number,
      unit: { type: String, default: 'bpm' },
      date: Date
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
      date: Date
    },
    temperature: {
      value: Number,
      unit: { type: String, default: '°C' },
      date: Date
    }
  },
  diagnosis: { type: String },
  symptoms: [{ type: String }],
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    notes: String
  },
  treatment: { type: String },
  followUp: {
    required: { type: Boolean, default: false },
    date: Date,
    notes: String
  },
  allergies: [{ type: String }],
  medicalHistory: [{
    condition: String,
    year: Number,
    status: {
      type: String,
      enum: ['active', 'resolved', 'chronic']
    }
  }],
  remedy: {
    type: String,
    // This field is only visible to doctors
  },
  formula: {
    type: String,
    // This field is only visible to doctors
  },
  notes: { type: String }
}, {
  timestamps: true
});

medicalRecordSchema.index({ patient: 1, createdAt: -1 });
medicalRecordSchema.index({ doctor: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema); 
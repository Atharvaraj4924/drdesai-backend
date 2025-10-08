const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
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
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: {
    type: String
  },
  notes: {
    type: String
  },
  prescription: {
    type: String
  },
  followUpDate: {
    type: Date
  },
  rescheduledFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  rescheduledTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  }
}, {
  timestamps: true
});

// Index for efficient queries
appointmentSchema.index({ patient: 1, date: 1 });
appointmentSchema.index({ doctor: 1, date: 1 });
appointmentSchema.index({ status: 1 });

module.exports = mongoose.model('Appointment', appointmentSchema); 
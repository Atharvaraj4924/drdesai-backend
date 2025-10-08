const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// @desc    Book an appointment (Patient)
// @route   POST /api/appointments
// @access  Private (Patient only)
const bookAppointment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { doctorId, date, time, reason, symptoms } = req.body;

    // Check if doctor exists
    const doctor = await User.findOne({ _id: doctorId, role: 'doctor' });
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check if appointment time is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      date: new Date(date),
      time,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    const appointment = new Appointment({
      patient: req.user.id,
      doctor: doctorId,
      date: new Date(date),
      time,
      reason,
      symptoms
    });

    await appointment.save();

    // Populate doctor and patient details
    await appointment.populate([
      { path: 'doctor', select: 'name specialization' },
      { path: 'patient', select: 'name age gender' }
    ]);

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment
    });
  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({ message: 'Server error during booking' });
  }
};

// @desc    Get appointments for current user
// @route   GET /api/appointments
// @access  Private
const getAppointments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (req.user.role === 'doctor') {
      query.doctor = req.user.id;
    } else {
      query.patient = req.user.id;
    }

    if (status) {
      query.status = status;
    }

    const appointments = await Appointment.find(query)
      .populate('doctor', 'name specialization')
      .populate('patient', 'name age gender')
      .sort({ date: -1, time: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
// @access  Private
const getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('doctor', 'name specialization phone')
      .populate('patient', 'name age gender phone address');

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (appointment.doctor._id.toString() !== req.user.id && 
        appointment.patient._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(appointment);
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update appointment status (Doctor only)
// @route   PUT /api/appointments/:id/status
// @access  Private (Doctor only)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { status, notes, prescription, followUpDate } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if doctor owns this appointment
    if (appointment.doctor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    if (prescription) appointment.prescription = prescription;
    if (followUpDate) appointment.followUpDate = new Date(followUpDate);

    await appointment.save();

    await appointment.populate([
      { path: 'doctor', select: 'name specialization' },
      { path: 'patient', select: 'name age gender' }
    ]);

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reschedule appointment
// @route   PUT /api/appointments/:id/reschedule
// @access  Private
const rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (appointment.doctor.toString() !== req.user.id && 
        appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if new time slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      date: new Date(newDate),
      time: newTime,
      status: { $in: ['pending', 'accepted'] },
      _id: { $ne: appointment._id }
    });

    if (existingAppointment) {
      return res.status(400).json({ message: 'This time slot is already booked' });
    }

    // Create new appointment with updated time
    const newAppointment = new Appointment({
      patient: appointment.patient,
      doctor: appointment.doctor,
      date: new Date(newDate),
      time: newTime,
      reason: appointment.reason,
      symptoms: appointment.symptoms,
      status: 'pending',
      rescheduledFrom: appointment._id
    });

    await newAppointment.save();

    // Update original appointment
    appointment.status = 'cancelled';
    appointment.rescheduledTo = newAppointment._id;
    await appointment.save();

    await newAppointment.populate([
      { path: 'doctor', select: 'name specialization' },
      { path: 'patient', select: 'name age gender' }
    ]);

    res.json({
      message: 'Appointment rescheduled successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Reschedule appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Cancel appointment
// @route   DELETE /api/appointments/:id
// @access  Private
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user has access to this appointment
    if (appointment.doctor.toString() !== req.user.id && 
        appointment.patient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get available doctors
// @route   GET /api/appointments/doctors
// @access  Public
const getAvailableDoctors = async (req, res) => {
  try {
    const doctors = await User.find({ role: 'doctor' })
      .select('name specialization experience licenseNumber')
      .sort({ name: 1 });

    res.json(doctors);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableDoctors
}; 
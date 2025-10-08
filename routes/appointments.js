const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  bookAppointment,
  getAppointments,
  getAppointment,
  updateAppointmentStatus,
  rescheduleAppointment,
  cancelAppointment,
  getAvailableDoctors
} = require('../controllers/appointmentController');

const router = express.Router();

// Validation middleware
const bookAppointmentValidation = [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('reason').trim().isLength({ min: 10 }).withMessage('Reason must be at least 10 characters long'),
  body('symptoms').optional().trim()
];

const updateStatusValidation = [
  body('status').isIn(['pending', 'accepted', 'rejected', 'completed', 'cancelled']).withMessage('Valid status is required'),
  body('notes').optional().trim(),
  body('prescription').optional().trim(),
  body('followUpDate').optional().isISO8601().withMessage('Valid follow-up date is required')
];

const rescheduleValidation = [
  body('newDate').isISO8601().withMessage('Valid new date is required'),
  body('newTime').notEmpty().withMessage('New time is required')
];

// Public routes
router.get('/doctors', getAvailableDoctors);

// Protected routes
router.use(auth);

// Patient routes
router.post('/', authorize('patient'), bookAppointmentValidation, bookAppointment);

// All authenticated users
router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.delete('/:id', cancelAppointment);
router.put('/:id/reschedule', rescheduleValidation, rescheduleAppointment);

// Doctor only routes
router.put('/:id/status', authorize('doctor'), updateStatusValidation, updateAppointmentStatus);

module.exports = router; 
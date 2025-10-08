const express = require('express');
const { body } = require('express-validator');
const { auth, authorize } = require('../middleware/auth');
const {
  createMedicalRecord,
  getPatientMedicalRecords,
  getAllPatients,
  getMedicalRecord,
  updateMedicalRecord,
  updatePatientVitals,
  getPatientVitalsHistory,
  deleteMedicalRecord
} = require('../controllers/medicalRecordController');

const router = express.Router();

// Validation middleware
const createMedicalRecordValidation = [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('appointmentId').optional().isMongoId().withMessage('Valid appointment ID is required'),
  body('diagnosis').optional().trim(),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('treatment').optional().trim(),
  body('remedy').optional().trim(),
  body('formula').optional().trim(),
  body('notes').optional().trim(),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
  body('followUp.required').optional().isBoolean().withMessage('Follow-up required must be boolean'),
  body('followUp.date').optional().isISO8601().withMessage('Valid follow-up date is required'),
  body('followUp.notes').optional().trim()
];

const updateVitalsValidation = [
  body('weight').optional().isNumeric().withMessage('Weight must be a number'),
  body('height').optional().isNumeric().withMessage('Height must be a number'),
  body('heartRate').optional().isNumeric().withMessage('Heart rate must be a number'),
  body('bloodPressure.systolic').optional().isNumeric().withMessage('Systolic pressure must be a number'),
  body('bloodPressure.diastolic').optional().isNumeric().withMessage('Diastolic pressure must be a number'),
  body('temperature').optional().isNumeric().withMessage('Temperature must be a number')
];

const updateMedicalRecordValidation = [
  body('diagnosis').optional().trim(),
  body('symptoms').optional().isArray().withMessage('Symptoms must be an array'),
  body('treatment').optional().trim(),
  body('remedy').optional().trim(),
  body('formula').optional().trim(),
  body('notes').optional().trim(),
  body('allergies').optional().isArray().withMessage('Allergies must be an array'),
  body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
  body('followUp.required').optional().isBoolean().withMessage('Follow-up required must be boolean'),
  body('followUp.date').optional().isISO8601().withMessage('Valid follow-up date is required'),
  body('followUp.notes').optional().trim()
];

// All routes require authentication
router.use(auth);

// Doctor only routes
router.post('/', authorize('doctor'), createMedicalRecordValidation, createMedicalRecord);
router.put('/:id', authorize('doctor'), updateMedicalRecordValidation, updateMedicalRecord);
router.delete('/:id', authorize('doctor'), deleteMedicalRecord);
router.get('/patients', authorize('doctor'), getAllPatients);

// Routes for both doctors and patients
router.get('/patient/:patientId', getPatientMedicalRecords);
router.get('/:id', getMedicalRecord);
router.put('/vitals/:patientId', updateVitalsValidation, updatePatientVitals);
router.get('/vitals/:patientId', getPatientVitalsHistory);

module.exports = router; 
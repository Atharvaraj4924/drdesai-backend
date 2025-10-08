const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getProfile,
  updateProfile
} = require('../controllers/authController');

const router = express.Router();

// Validation middleware
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role').isIn(['doctor', 'patient']).withMessage('Role must be either doctor or patient'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('specialization').if(body('role').equals('doctor')).notEmpty().withMessage('Specialization is required for doctors'),
  body('licenseNumber').if(body('role').equals('doctor')).notEmpty().withMessage('License number is required for doctors'),
  body('experience').if(body('role').equals('doctor')).isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('age').if(body('role').equals('patient')).isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').if(body('role').equals('patient')).isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('address').if(body('role').equals('patient')).notEmpty().withMessage('Address is required for patients')
];

const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  body('role').isIn(['doctor', 'patient']).withMessage('Role must be either doctor or patient')
];

const updateProfileValidation = [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
  body('phone').optional().notEmpty().withMessage('Phone number cannot be empty'),
  body('specialization').optional().notEmpty().withMessage('Specialization cannot be empty'),
  body('licenseNumber').optional().notEmpty().withMessage('License number cannot be empty'),
  body('experience').optional().isInt({ min: 0 }).withMessage('Experience must be a positive number'),
  body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
  body('address').optional().notEmpty().withMessage('Address cannot be empty')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', auth, getProfile);
router.put('/profile', auth, updateProfileValidation, updateProfile);

module.exports = router; 
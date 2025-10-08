const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'dr_desai_super_secret_jwt_key_2024',
    { expiresIn: '7d' }
  );
};

// @desc    Register user (Patient or Doctor)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, phone, specialization, licenseNumber, experience, age, gender, address, emergencyContact } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user based on role
    const userData = {
      name,
      email,
      password,
      role,
      phone
    };

    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.licenseNumber = licenseNumber;
      userData.experience = experience;
    } else if (role === 'patient') {
      userData.age = age;
      userData.gender = gender;
      userData.address = address;
      userData.emergencyContact = emergencyContact;
    }

    const user = new User(userData);
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...(user.role === 'doctor' && {
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          experience: user.experience
        }),
        ...(user.role === 'patient' && {
          age: user.age,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergencyContact
        })
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, role } = req.body;

    // Find user by email and role
    const user = await User.findOne({ email, role });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ...(user.role === 'doctor' && {
          specialization: user.specialization,
          licenseNumber: user.licenseNumber,
          experience: user.experience
        }),
        ...(user.role === 'patient' && {
          age: user.age,
          gender: user.gender,
          address: user.address,
          emergencyContact: user.emergencyContact
        })
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, specialization, licenseNumber, experience, age, gender, address, emergencyContact } = req.body;

    const updateData = { name, phone };

    if (req.user.role === 'doctor') {
      updateData.specialization = specialization;
      updateData.licenseNumber = licenseNumber;
      updateData.experience = experience;
    } else if (req.user.role === 'patient') {
      updateData.age = age;
      updateData.gender = gender;
      updateData.address = address;
      updateData.emergencyContact = emergencyContact;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error during profile update' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile
}; 